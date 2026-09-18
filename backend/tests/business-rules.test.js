import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Inventory Management Core Business Rules & Authorization", () => {
  let adminToken = "";
  let staffToken = "";
  let testProductId = "";
  let testSupplierId = "";
  let testCategoryId = "";

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "Admin@1234" });
    adminToken = adminRes.body?.data?.accessToken;

    // 2. Authenticate Staff
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "staff@example.com", password: "Staff@1234" });
    staffToken = staffRes.body?.data?.accessToken;

    // 3. Create isolated test category
    const cat = await prisma.category.create({
      data: {
        name: `TestCategory_${Date.now()}`,
        code: `TC_${String(Date.now()).slice(-4)}`,
        description: "Temporary category for integration testing",
      },
    });
    testCategoryId = cat.id;

    // 4. Create isolated test product with 0 initial stock
    const prod = await prisma.product.create({
      data: {
        name: `TestProduct_${Date.now()}`,
        sku: `SKU-TEST-${Date.now()}`,
        categoryId: testCategoryId,
        unit: "pcs",
        costPrice: 50.0,
        sellingPrice: 80.0,
        minimumStock: 10,
        status: "ACTIVE",
      },
    });
    testProductId = prod.id;

    // 5. Create isolated test supplier
    const sup = await prisma.supplier.create({
      data: {
        name: `TestSupplier_${Date.now()}`,
        phone: "+251 900 123456",
        email: `supplier_${Date.now()}@test.local`,
      },
    });
    testSupplierId = sup.id;
  });

  afterAll(async () => {
    // Clean up isolated test data
    try {
      if (testProductId) {
        await prisma.saleItem.deleteMany({ where: { productId: testProductId } });
        await prisma.purchaseItem.deleteMany({ where: { productId: testProductId } });
        await prisma.stockAdjustment.deleteMany({ where: { productId: testProductId } });
        await prisma.product.deleteMany({ where: { id: testProductId } });
      }
      if (testCategoryId) {
        await prisma.category.deleteMany({ where: { id: testCategoryId } });
      }
      if (testSupplierId) {
        await prisma.purchase.deleteMany({ where: { supplierId: testSupplierId } });
        await prisma.supplier.deleteMany({ where: { id: testSupplierId } });
      }
    } catch (err) {
      console.warn("Cleanup error in afterAll:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  });

  test("Rule 1: Rejection of sale when available stock is insufficient (no negative stock)", async () => {
    // Current stock of test product is 0. Attempting to complete a sale of 5 units must be rejected.
    const createDraftRes = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        items: [{ productId: testProductId, quantity: 5, unitPrice: 80.0 }],
        notes: "Test insufficient stock sale",
      });

    expect(createDraftRes.status).toBe(201);
    const saleId = createDraftRes.body?.data?.id;

    // Attempting to transition to COMPLETED
    const completeRes = await request(app)
      .patch(`/api/sales/${saleId}/complete`)
      .set("Authorization", `Bearer ${staffToken}`);

    expect(completeRes.status).toBe(409);
    expect(completeRes.body?.message).toMatch(/insufficient stock/i);

    // Cancel the draft so it doesn't hang
    await request(app)
      .patch(`/api/sales/${saleId}/cancel`)
      .set("Authorization", `Bearer ${staffToken}`);
  });

  test("Rule 2: Completing a purchase successfully increments product stock", async () => {
    // 1. Check current stock before purchase (should be 0)
    const stockBeforeRes = await request(app)
      .get("/api/stock")
      .set("Authorization", `Bearer ${staffToken}`);

    const itemBefore = stockBeforeRes.body?.data?.find((i) => i.id === testProductId);
    expect(Number(itemBefore?.currentStock || 0)).toBe(0);

    // 2. Create and complete a purchase of 25 units
    const purchaseRes = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        supplierId: testSupplierId,
        items: [{ productId: testProductId, quantity: 25, unitCost: 50.0 }],
        notes: "Test stock-in purchase",
      });

    expect(purchaseRes.status).toBe(201);
    const purchaseId = purchaseRes.body?.data?.id;

    const completePurchaseRes = await request(app)
      .patch(`/api/purchases/${purchaseId}/complete`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(completePurchaseRes.status).toBe(200);

    // 3. Verify stock increased by exactly 25 units
    const stockAfterRes = await request(app)
      .get("/api/stock")
      .set("Authorization", `Bearer ${staffToken}`);

    const itemAfter = stockAfterRes.body?.data?.find((i) => i.id === testProductId);
    expect(Number(itemAfter?.currentStock)).toBe(25);
  });

  test("Rule 3: Completing a sale correctly decrements stock after a purchase", async () => {
    // Now stock is 25. Complete a sale of 10 units.
    const createSaleRes = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        items: [{ productId: testProductId, quantity: 10, unitPrice: 80.0 }],
        notes: "Test stock-out sale",
      });

    expect(createSaleRes.status).toBe(201);
    const saleId = createSaleRes.body?.data?.id;

    const completeSaleRes = await request(app)
      .patch(`/api/sales/${saleId}/complete`)
      .set("Authorization", `Bearer ${staffToken}`);

    expect(completeSaleRes.status).toBe(200);

    // Stock should now be 25 - 10 = 15
    const stockAfterSaleRes = await request(app)
      .get("/api/stock")
      .set("Authorization", `Bearer ${staffToken}`);

    const item = stockAfterSaleRes.body?.data?.find((i) => i.id === testProductId);
    expect(Number(item?.currentStock)).toBe(15);
  });

  test("Rule 4: Authorization enforcement — Staff cannot perform Admin-only actions", async () => {
    // Attempting to post a stock adjustment using Staff token must be rejected with 403 Forbidden
    const staffAdjustmentRes = await request(app)
      .post("/api/stock-adjustments")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        productId: testProductId,
        type: "INCREASE",
        quantity: 5,
        reason: "Unauthorized staff correction attempt",
      });

    expect(staffAdjustmentRes.status).toBe(403);
    expect(staffAdjustmentRes.body?.message).toMatch(/permission/i);

    // Attempting to retrieve user directory as Staff must also be rejected
    const staffUsersRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(staffUsersRes.status).toBe(403);
  });
});
