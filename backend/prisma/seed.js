import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

const categories = [
  ["Beverages", "BEV"],
  ["Bakery", "BAK"],
  ["Dairy & Eggs", "DAI"],
  ["Pantry", "PAN"],
  ["Fresh Produce", "PRO"],
  ["Household", "HOU"],
  ["Personal Care", "PER"],
  ["Snacks", "SNK"],
];
const productNames = [
  "Sparkling Water",
  "Orange Juice",
  "Ground Coffee",
  "Black Tea",
  "Mineral Water",
  "Cola Drink",
  "Energy Drink",
  "White Bread",
  "Whole Wheat Bread",
  "Croissant",
  "Muffin Pack",
  "Burger Buns",
  "Cake Flour",
  "Biscuit Mix",
  "Fresh Milk",
  "Yogurt Cup",
  "Cheddar Cheese",
  "Free Range Eggs",
  "Butter Block",
  "Greek Yogurt",
  "Rice",
  "Pasta",
  "Cooking Oil",
  "Tomato Sauce",
  "Canned Beans",
  "Breakfast Cereal",
  "Wheat Flour",
  "Bananas",
  "Apples",
  "Oranges",
  "Tomatoes",
  "Potatoes",
  "Carrots",
  "Spinach",
  "Laundry Detergent",
  "Dish Soap",
  "Paper Towels",
  "Trash Bags",
  "All Purpose Cleaner",
  "Kitchen Sponges",
  "Hand Soap",
  "Toothpaste",
  "Shampoo",
  "Body Lotion",
  "Toilet Tissue",
  "Deodorant",
  "Potato Chips",
  "Chocolate Bar",
  "Salted Peanuts",
  "Granola Bar",
];
const suppliers = [
  ["Demo Fresh Foods Ltd", "0700001001", "orders@demofresh.test"],
  ["Demo Beverage Supply", "0700001002", "sales@demobeverage.test"],
  ["Demo Pantry Wholesalers", "0700001003", "hello@demopantry.test"],
  ["Demo Home Essentials", "0700001004", "trade@demohome.test"],
  ["Demo Dairy Distributors", "0700001005", "orders@demodairy.test"],
  ["Demo Produce Market", "0700001006", "supply@demoproduce.test"],
];
const customers = [
  ["Demo Walk-in Customer", "0710002001", "walkin@example.test"],
  ["Amina Hassan", "0710002002", "amina@example.test"],
  ["Brian Otieno", "0710002003", "brian@example.test"],
  ["Cynthia Wanjiku", "0710002004", "cynthia@example.test"],
  ["David Mwangi", "0710002005", "david@example.test"],
  ["Esther Njeri", "0710002006", "esther@example.test"],
  ["Farah Ali", "0710002007", "farah@example.test"],
  ["Grace Akinyi", "0710002008", "grace@example.test"],
  ["Hassan Noor", "0710002009", "hassan@example.test"],
  ["Irene Kamau", "0710002010", "irene@example.test"],
];
const demoPurchaseRefs = [
  "DEMO-PUR-001",
  "DEMO-PUR-002",
  "DEMO-PUR-003",
  "DEMO-PUR-004",
];
const demoSaleRefs = [
  "DEMO-SAL-001",
  "DEMO-SAL-002",
  "DEMO-SAL-003",
  "DEMO-SAL-004",
];
const daysAgo = (days) => new Date(Date.now() - days * 86400000);
const lineTotal = (quantity, price) => quantity * price;

const main = async () => {
  const [adminPasswordHash, staffPasswordHash] = await Promise.all([
    bcrypt.hash("Admin@1234", 10),
    bcrypt.hash("Staff@1234", 10),
  ]);

  await prisma.$transaction(async (tx) => {
    const admin = await tx.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        name: "Demo Administrator",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        name: "Demo Administrator",
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    const staff = await tx.user.upsert({
      where: { email: "staff@example.com" },
      update: {
        name: "Demo Staff",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        status: "ACTIVE",
      },
      create: {
        name: "Demo Staff",
        email: "staff@example.com",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        status: "ACTIVE",
      },
    });
    const categoryRows = await Promise.all(
      categories.map(([name, code]) =>
        tx.category.upsert({
          where: { code },
          update: {
            name,
            description: `Demo ${name.toLowerCase()} inventory`,
            status: "ACTIVE",
          },
          create: {
            name,
            code,
            description: `Demo ${name.toLowerCase()} inventory`,
            status: "ACTIVE",
          },
        }),
      ),
    );

    const upsertContact = async (model, [name, phone, email], extra) => {
      const existing = await model.findFirst({ where: { email } });
      return existing
        ? model.update({
            where: { id: existing.id },
            data: { name, phone, status: "ACTIVE" },
          })
        : model.create({
            data: {
              name,
              phone,
              email,
              address: "Demo City",
              notes: extra,
              status: "ACTIVE",
            },
          });
    };
    const supplierRows = [];
    for (const supplier of suppliers)
      supplierRows.push(
        await upsertContact(tx.supplier, supplier, "Development seed supplier"),
      );
    const customerRows = [];
    for (const customer of customers)
      customerRows.push(
        await upsertContact(tx.customer, customer, "Development seed customer"),
      );

    const productRows = [];
    for (const [index, name] of productNames.entries()) {
      const category = categoryRows[index % categoryRows.length];
      const costPrice = 20 + index * 3;
      const sku = `DEMO-${category.code}-${String(index + 1).padStart(3, "0")}`;
      productRows.push(
        await tx.product.upsert({
          where: { sku },
          update: {
            name,
            categoryId: category.id,
            unit: "pcs",
            costPrice,
            sellingPrice: costPrice + 15 + (index % 4) * 2,
            minimumStock: 12 + (index % 5),
            status: "ACTIVE",
          },
          create: {
            name,
            categoryId: category.id,
            sku,
            unit: "pcs",
            costPrice,
            sellingPrice: costPrice + 15 + (index % 4) * 2,
            minimumStock: 12 + (index % 5),
            status: "ACTIVE",
          },
        }),
      );
    }

    await tx.sale.deleteMany({
      where: { referenceNumber: { in: demoSaleRefs } },
    });
    await tx.purchase.deleteMany({
      where: { referenceNumber: { in: demoPurchaseRefs } },
    });
    await tx.stockAdjustment.deleteMany({
      where: { reason: { startsWith: "DEMO:" } },
    });
    await tx.stockAdjustment.createMany({
      data: productRows.map((product, index) => ({
        productId: product.id,
        createdById: admin.id,
        type: "INCREASE",
        quantity: 50 + index,
        reason: "DEMO: Opening stock",
      })),
    });
    await tx.stockAdjustment.createMany({
      data: [
        {
          productId: productRows[0].id,
          createdById: admin.id,
          type: "DECREASE",
          quantity: 3,
          reason: "DEMO: Damaged stock",
        },
        {
          productId: productRows[8].id,
          createdById: admin.id,
          type: "INCREASE",
          quantity: 10,
          reason: "DEMO: Stock count correction",
        },
      ],
    });

    const createPurchase = (referenceNumber, supplier, status, items, days) =>
      tx.purchase.create({
        data: {
          supplierId: supplier.id,
          createdById: admin.id,
          referenceNumber,
          transactionDate: daysAgo(days),
          status,
          notes: "DEMO: Seed purchase",
          total: items.reduce(
            (sum, item) => sum + lineTotal(item.quantity, item.unitCost),
            0,
          ),
          purchaseItems: {
            create: items.map((item) => ({
              ...item,
              lineTotal: lineTotal(item.quantity, item.unitCost),
            })),
          },
        },
      });
    await createPurchase(
      "DEMO-PUR-001",
      supplierRows[0],
      "COMPLETED",
      [
        { productId: productRows[0].id, quantity: 40, unitCost: 20 },
        { productId: productRows[1].id, quantity: 35, unitCost: 23 },
        { productId: productRows[2].id, quantity: 30, unitCost: 26 },
      ],
      12,
    );
    await createPurchase(
      "DEMO-PUR-002",
      supplierRows[2],
      "COMPLETED",
      [
        { productId: productRows[7].id, quantity: 25, unitCost: 41 },
        { productId: productRows[8].id, quantity: 20, unitCost: 44 },
        { productId: productRows[20].id, quantity: 30, unitCost: 80 },
      ],
      7,
    );
    await createPurchase(
      "DEMO-PUR-003",
      supplierRows[4],
      "DRAFT",
      [
        { productId: productRows[14].id, quantity: 24, unitCost: 62 },
        { productId: productRows[15].id, quantity: 18, unitCost: 65 },
      ],
      1,
    );
    await createPurchase(
      "DEMO-PUR-004",
      supplierRows[5],
      "CANCELLED",
      [{ productId: productRows[27].id, quantity: 40, unitCost: 101 }],
      3,
    );

    const createSale = (referenceNumber, customer, status, items, days) =>
      tx.sale.create({
        data: {
          customerId: customer.id,
          createdById: staff.id,
          referenceNumber,
          transactionDate: daysAgo(days),
          status,
          notes: "DEMO: Seed sale",
          total: items.reduce(
            (sum, item) => sum + lineTotal(item.quantity, item.unitPrice),
            0,
          ),
          saleItems: {
            create: items.map((item) => ({
              ...item,
              lineTotal: lineTotal(item.quantity, item.unitPrice),
            })),
          },
        },
      });
    await createSale(
      "DEMO-SAL-001",
      customerRows[1],
      "COMPLETED",
      [
        { productId: productRows[0].id, quantity: 12, unitPrice: 35 },
        { productId: productRows[1].id, quantity: 8, unitPrice: 40 },
      ],
      5,
    );
    await createSale(
      "DEMO-SAL-002",
      customerRows[4],
      "COMPLETED",
      [
        { productId: productRows[7].id, quantity: 6, unitPrice: 60 },
        { productId: productRows[20].id, quantity: 10, unitPrice: 105 },
      ],
      2,
    );
    await createSale(
      "DEMO-SAL-003",
      customerRows[0],
      "DRAFT",
      [
        { productId: productRows[14].id, quantity: 4, unitPrice: 80 },
        { productId: productRows[15].id, quantity: 3, unitPrice: 85 },
      ],
      0,
    );
    await createSale(
      "DEMO-SAL-004",
      customerRows[7],
      "CANCELLED",
      [{ productId: productRows[27].id, quantity: 7, unitPrice: 125 }],
      4,
    );
  });

  console.log(
    "Demo seed complete: 8 categories, 50 products, 6 suppliers, 10 customers.",
  );
  console.log("Admin: admin@example.com / Admin@1234");
  console.log("Staff: staff@example.com / Staff@1234");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
