import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

// 6 realistic business categories
const categoriesData = [
  {
    name: "Beverages & Cold Drinks",
    code: "BEV",
    description: "Packaged juices, premium mineral waters, sodas, and roasted coffee blends",
  },
  {
    name: "Fresh Produce & Greens",
    code: "PRO",
    description: "Locally sourced organic fruits, root vegetables, and fresh greens",
  },
  {
    name: "Bakery & Confectionery",
    code: "BAK",
    description: "Daily baked artisanal bread, rolls, breakfast pastries, and flour mixes",
  },
  {
    name: "Pantry & Dry Staples",
    code: "PAN",
    description: "Grains, pulses, premium cooking oils, condiments, and pasta",
  },
  {
    name: "Dairy & Chilled Goods",
    code: "DAI",
    description: "Fresh farm milk, yogurts, artisanal cheeses, and farm eggs",
  },
  {
    name: "Personal Care & Hygiene",
    code: "PER",
    description: "Daily essentials, hygiene products, soaps, dental and hair care",
  },
];

// 52 realistic supermarket/warehouse products with realistic pricing (in ETB) and units
const productsData = [
  // Beverages (9 items)
  { name: "Highland Spring Water 500ml", catCode: "BEV", unit: "btl", costPrice: 15.00, sellingPrice: 25.00, minStock: 50, openingStock: 220 },
  { name: "Highland Spring Water 1.5L", catCode: "BEV", unit: "btl", costPrice: 30.00, sellingPrice: 50.00, minStock: 40, openingStock: 180 },
  { name: "Harar Dark Roast Ground Coffee 500g", catCode: "BEV", unit: "pkg", costPrice: 320.00, sellingPrice: 450.00, minStock: 15, openingStock: 65 },
  { name: "Yirgacheffe Arabica Beans 250g", catCode: "BEV", unit: "pkg", costPrice: 280.00, sellingPrice: 400.00, minStock: 12, openingStock: 45 },
  { name: "Wondo Black Tea 100 Bags", catCode: "BEV", unit: "box", costPrice: 95.00, sellingPrice: 140.00, minStock: 20, openingStock: 90 },
  { name: "Sparkling Lemon Flavored Soda 330ml", catCode: "BEV", unit: "can", costPrice: 25.00, sellingPrice: 45.00, minStock: 30, openingStock: 140 },
  { name: "Classic Cola Can 330ml", catCode: "BEV", unit: "can", costPrice: 25.00, sellingPrice: 45.00, minStock: 35, openingStock: 160 },
  { name: "Pure Orange Juice 1L", catCode: "BEV", unit: "ctn", costPrice: 120.00, sellingPrice: 180.00, minStock: 15, openingStock: 70 },
  { name: "Apple & Mango Nectar 1L", catCode: "BEV", unit: "ctn", costPrice: 110.00, sellingPrice: 170.00, minStock: 15, openingStock: 60 },

  // Fresh Produce (9 items)
  { name: "Organic Red Apples 1kg", catCode: "PRO", unit: "kg", costPrice: 160.00, sellingPrice: 230.00, minStock: 20, openingStock: 85 },
  { name: "Cavendish Bananas 1kg", catCode: "PRO", unit: "kg", costPrice: 60.00, sellingPrice: 95.00, minStock: 25, openingStock: 110 },
  { name: "Sweet Valencia Oranges 1kg", catCode: "PRO", unit: "kg", costPrice: 90.00, sellingPrice: 140.00, minStock: 20, openingStock: 75 },
  { name: "Plum Salad Tomatoes 1kg", catCode: "PRO", unit: "kg", costPrice: 45.00, sellingPrice: 75.00, minStock: 30, openingStock: 130 },
  { name: "Red Cooking Onions 1kg", catCode: "PRO", unit: "kg", costPrice: 55.00, sellingPrice: 85.00, minStock: 35, openingStock: 150 },
  { name: "Fresh Table Potatoes 1kg", catCode: "PRO", unit: "kg", costPrice: 40.00, sellingPrice: 65.00, minStock: 40, openingStock: 190 },
  { name: "Fresh Garden Carrots 1kg", catCode: "PRO", unit: "kg", costPrice: 50.00, sellingPrice: 80.00, minStock: 15, openingStock: 60 },
  { name: "Green Bell Peppers 500g", catCode: "PRO", unit: "pkg", costPrice: 35.00, sellingPrice: 60.00, minStock: 10, openingStock: 40 },
  { name: "Fresh Baby Spinach 250g", catCode: "PRO", unit: "bch", costPrice: 25.00, sellingPrice: 45.00, minStock: 12, openingStock: 35 },

  // Bakery (9 items)
  { name: "Whole Grain Sliced Bread 800g", catCode: "BAK", unit: "loaf", costPrice: 45.00, sellingPrice: 70.00, minStock: 25, openingStock: 95 },
  { name: "Artisanal Sourdough Bread 600g", catCode: "BAK", unit: "loaf", costPrice: 65.00, sellingPrice: 110.00, minStock: 15, openingStock: 50 },
  { name: "Soft White Toast Bread 600g", catCode: "BAK", unit: "loaf", costPrice: 38.00, sellingPrice: 60.00, minStock: 20, openingStock: 80 },
  { name: "Butter Croissants (Pack of 4)", catCode: "BAK", unit: "pkg", costPrice: 110.00, sellingPrice: 175.00, minStock: 10, openingStock: 35 },
  { name: "Chocolate Swirl Muffins (Pack of 4)", catCode: "BAK", unit: "pkg", costPrice: 120.00, sellingPrice: 190.00, minStock: 10, openingStock: 30 },
  { name: "Brioche Burger Buns (Pack of 6)", catCode: "BAK", unit: "pkg", costPrice: 85.00, sellingPrice: 135.00, minStock: 15, openingStock: 55 },
  { name: "Hot Dog Rolls (Pack of 6)", catCode: "BAK", unit: "pkg", costPrice: 70.00, sellingPrice: 110.00, minStock: 12, openingStock: 45 },
  { name: "All-Purpose Wheat Flour 2kg", catCode: "BAK", unit: "bag", costPrice: 140.00, sellingPrice: 210.00, minStock: 20, openingStock: 90 },
  { name: "Self-Rising Cake Flour 1kg", catCode: "BAK", unit: "bag", costPrice: 85.00, sellingPrice: 130.00, minStock: 15, openingStock: 65 },

  // Pantry (9 items)
  { name: "Long Grain Basmati Rice 5kg", catCode: "PAN", unit: "bag", costPrice: 580.00, sellingPrice: 780.00, minStock: 15, openingStock: 55 },
  { name: "Pure Refined Sunflower Oil 3L", catCode: "PAN", unit: "btl", costPrice: 420.00, sellingPrice: 590.00, minStock: 20, openingStock: 75 },
  { name: "Extra Virgin Olive Oil 750ml", catCode: "PAN", unit: "btl", costPrice: 490.00, sellingPrice: 690.00, minStock: 8, openingStock: 28 },
  { name: "Italian Spaghetti Pasta 500g", catCode: "PAN", unit: "pkg", costPrice: 55.00, sellingPrice: 90.00, minStock: 30, openingStock: 140 },
  { name: "Durum Penne Rigate Pasta 500g", catCode: "PAN", unit: "pkg", costPrice: 55.00, sellingPrice: 90.00, minStock: 25, openingStock: 120 },
  { name: "Peeled Plum Canned Tomatoes 400g", catCode: "PAN", unit: "can", costPrice: 60.00, sellingPrice: 95.00, minStock: 20, openingStock: 80 },
  { name: "Canned Red Kidney Beans 400g", catCode: "PAN", unit: "can", costPrice: 50.00, sellingPrice: 80.00, minStock: 20, openingStock: 95 },
  { name: "Iodized Table Salt 1kg", catCode: "PAN", unit: "pkg", costPrice: 20.00, sellingPrice: 35.00, minStock: 30, openingStock: 150 },
  { name: "Pure Cane Sugar Granulated 2kg", catCode: "PAN", unit: "bag", costPrice: 170.00, sellingPrice: 240.00, minStock: 25, openingStock: 110 },

  // Dairy (8 items)
  { name: "Pasteurized Fresh Whole Milk 1L", catCode: "DAI", unit: "ctn", costPrice: 65.00, sellingPrice: 95.00, minStock: 35, openingStock: 140 },
  { name: "Farm Fresh Large Brown Eggs (30-Pack)", catCode: "DAI", unit: "crt", costPrice: 280.00, sellingPrice: 380.00, minStock: 15, openingStock: 50 },
  { name: "Unsalted Creamery Butter 250g", catCode: "DAI", unit: "blk", costPrice: 160.00, sellingPrice: 230.00, minStock: 12, openingStock: 45 },
  { name: "Aged Mild Cheddar Cheese Block 400g", catCode: "DAI", unit: "blk", costPrice: 310.00, sellingPrice: 440.00, minStock: 10, openingStock: 32 },
  { name: "Natural Greek Yogurt Plain 500g", catCode: "DAI", unit: "tub", costPrice: 115.00, sellingPrice: 175.00, minStock: 15, openingStock: 60 },
  { name: "Strawberry Flavored Yogurt 200ml", catCode: "DAI", unit: "cup", costPrice: 40.00, sellingPrice: 65.00, minStock: 25, openingStock: 95 },
  { name: "Whipped Cream Spray 250ml", catCode: "DAI", unit: "can", costPrice: 190.00, sellingPrice: 280.00, minStock: 8, openingStock: 22 },
  { name: "Fresh Mozzarella Ball 200g", catCode: "DAI", unit: "pkg", costPrice: 175.00, sellingPrice: 260.00, minStock: 8, openingStock: 24 },

  // Personal Care (8 items)
  { name: "Antibacterial Liquid Hand Soap 500ml", catCode: "PER", unit: "btl", costPrice: 90.00, sellingPrice: 145.00, minStock: 15, openingStock: 65 },
  { name: "Nourishing Herbal Shampoo 400ml", catCode: "PER", unit: "btl", costPrice: 160.00, sellingPrice: 240.00, minStock: 12, openingStock: 40 },
  { name: "Moisturizing Hair Conditioner 400ml", catCode: "PER", unit: "btl", costPrice: 170.00, sellingPrice: 250.00, minStock: 10, openingStock: 35 },
  { name: "Fluoride Protection Toothpaste 100ml", catCode: "PER", unit: "tub", costPrice: 75.00, sellingPrice: 120.00, minStock: 25, openingStock: 90 },
  { name: "Medium Bristle Toothbrush 2-Pack", catCode: "PER", unit: "pkg", costPrice: 60.00, sellingPrice: 95.00, minStock: 20, openingStock: 75 },
  { name: "Shea Butter Body Cream 250ml", catCode: "PER", unit: "jar", costPrice: 210.00, sellingPrice: 320.00, minStock: 8, openingStock: 28 },
  { name: "Soft Facial Tissues (200 sheets)", catCode: "PER", unit: "box", costPrice: 50.00, sellingPrice: 85.00, minStock: 25, openingStock: 100 },
  { name: "Premium 3-Ply Toilet Paper (10 Rolls)", catCode: "PER", unit: "pkg", costPrice: 220.00, sellingPrice: 330.00, minStock: 15, openingStock: 50 },
];

// 6 Real-World Suppliers
const suppliersData = [
  {
    name: "Apex Beverage & Coffee Distributors",
    phone: "+251 911 234567",
    email: "procurement@apexbeverages.com",
    address: "Bole Industrial Zone, Warehouse 4B, Addis Ababa",
    notes: "Main supplier for roasted coffee, mineral waters, and juices",
  },
  {
    name: "Valley Fresh Agricultural Cooperative",
    phone: "+251 912 876543",
    email: "supply@valleyfreshfarms.et",
    address: "Debre Zeit Agro Logistics Park, Bishoftu",
    notes: "Fresh fruits, local greens, root vegetables, and herbs",
  },
  {
    name: "Golden Wheat Mills & Bakery Supplies",
    phone: "+251 913 456789",
    email: "sales@goldenwheat.com",
    address: "Akaki Kality Sub-City, Plot 18, Addis Ababa",
    notes: "Flour grains, bakery ingredients, pre-packaged breads and buns",
  },
  {
    name: "Prime Agro-Commodities Wholesalers",
    phone: "+251 914 987654",
    email: "orders@primecommodities.et",
    address: "Merkato Wholesale District, Block C, Addis Ababa",
    notes: "Bulk rice, refined cooking oils, pasta, and dry condiments",
  },
  {
    name: "Highland Dairy Farms & Creamery",
    phone: "+251 915 321654",
    email: "distro@highlanddairy.et",
    address: "Sebeta Commercial Corridor, Oromia Region",
    notes: "Chilled fresh milk, cheeses, creamery butter, and yogurts",
  },
  {
    name: "Blue Nile Personal Care & Hygiene Corp",
    phone: "+251 916 789123",
    email: "b2b@bluenilecare.com",
    address: "Nifas Silk Lafto Industrial Hub, Addis Ababa",
    notes: "Body lotions, shampoos, dental hygiene, and sanitary paper goods",
  },
];

// 12 Real-World Retail & Corporate Customers
const customersData = [
  {
    name: "Walk-in Supermarket Shopper",
    phone: "+251 920 000001",
    email: "pos-counter@storefront.local",
    address: "Main Counter Register, Store #1",
    notes: "Standard walk-in customer for cash register and card checkout",
  },
  {
    name: "Alemayehu Tadesse (Café Owner)",
    phone: "+251 921 112233",
    email: "alemayehu.t@abyssinia-cafe.com",
    address: "Kazanchis Commercial Center, Addis Ababa",
    notes: "Regular wholesale buyer for ground coffee, milk, and sugar",
  },
  {
    name: "Bethlehem Haile (Boutique Baker)",
    phone: "+251 922 223344",
    email: "bethy.pastry@gmail.com",
    address: "Bole Atlas, 22 Mazoria, Addis Ababa",
    notes: "Bimonthly orders of butter, flour, eggs, and confectioneries",
  },
  {
    name: "Dawit Kebede (Restaurant Manager)",
    phone: "+251 923 334455",
    email: "dawit@kebede-grill.et",
    address: "Meskel Flower, Kirkos Sub-City, Addis Ababa",
    notes: "Bulk buyer of fresh produce, cooking oils, and rice",
  },
  {
    name: "Eleni Wolde (Residential Client)",
    phone: "+251 924 445566",
    email: "eleni.wolde@yahoo.com",
    address: "CMC Michael, Block 12, Apt 4B, Addis Ababa",
    notes: "Weekly family grocery shopper with online delivery",
  },
  {
    name: "Fasil Getachew (Corner Grocer)",
    phone: "+251 925 556677",
    email: "fasil.groceries@outlook.com",
    address: "Gullele Sub-City, Near St. Paul, Addis Ababa",
    notes: "Purchases bundled sodas, water bottles, and pasta",
  },
  {
    name: "Genet Assefa (Catering Services)",
    phone: "+251 926 667788",
    email: "genet.events@gmail.com",
    address: "Sarbet, Behind Pushkin Square, Addis Ababa",
    notes: "Event and conference catering organizer",
  },
  {
    name: "Habtamu Zewde (Hotel Procurement)",
    phone: "+251 927 778899",
    email: "h.zewde@capital-suites.et",
    address: "Bole Medhanialem, Near Edna Mall, Addis Ababa",
    notes: "Corporate accounts for hotel breakfast bar items and personal care supplies",
  },
  {
    name: "Kalkidan Bekele (Fitness Gym)",
    phone: "+251 928 889900",
    email: "kalkidan@fitlife-gym.et",
    address: "Old Airport Area, Kera, Addis Ababa",
    notes: "Regularly restocks mineral waters, Greek yogurts, and bananas",
  },
  {
    name: "Mahlet Tesfaye (Office Manager)",
    phone: "+251 929 990011",
    email: "mahlet.t@techcorp-east.com",
    address: "Gotera Condominium Towers, Addis Ababa",
    notes: "Weekly office pantry and hygiene restocking",
  },
  {
    name: "Nebiyu Girma (Retail Shopper)",
    phone: "+251 930 102030",
    email: "nebiyu.girma@gmail.com",
    address: "Summit Condominium, Site 2, Addis Ababa",
    notes: "Household consumer account",
  },
  {
    name: "Senait Desta (Daycare Center)",
    phone: "+251 931 203040",
    email: "senait@sunshine-daycare.et",
    address: "Gerji, Imperial Area, Addis Ababa",
    notes: "Fresh milk, sliced bread, fruits, and hand soaps",
  },
];

const daysAgo = (days) => new Date(Date.now() - days * 86400000);
const lineTotal = (quantity, price) => Number((quantity * price).toFixed(2));

const main = async () => {
  console.log("🌱 Starting Real-World Database Seed...");

  // Preserve existing user credentials
  const [adminPasswordHash, staffPasswordHash] = await Promise.all([
    bcrypt.hash("Admin@1234", 10),
    bcrypt.hash("Staff@1234", 10),
  ]);

  await prisma.$transaction(async (tx) => {
    // 1. Upsert Admin & Staff
    const admin = await tx.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        name: "Abebe Bikila (Admin)",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        name: "Abebe Bikila (Admin)",
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    const staff = await tx.user.upsert({
      where: { email: "staff@example.com" },
      update: {
        name: "Tigist Mengistu (Staff)",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        status: "ACTIVE",
      },
      create: {
        name: "Tigist Mengistu (Staff)",
        email: "staff@example.com",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        status: "ACTIVE",
      },
    });

    console.log("✓ Admin and Staff accounts verified.");

    // 2. Upsert Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      const row = await tx.category.upsert({
        where: { code: cat.code },
        update: {
          name: cat.name,
          description: cat.description,
          status: "ACTIVE",
        },
        create: {
          name: cat.name,
          code: cat.code,
          description: cat.description,
          status: "ACTIVE",
        },
      });
      categoryMap[cat.code] = row;
    }
    console.log(`✓ ${categoriesData.length} business categories ready.`);

    // 3. Upsert Suppliers
    const supplierRows = [];
    for (const s of suppliersData) {
      const existing = await tx.supplier.findFirst({ where: { email: s.email } });
      const row = existing
        ? await tx.supplier.update({
            where: { id: existing.id },
            data: { name: s.name, phone: s.phone, address: s.address, notes: s.notes, status: "ACTIVE" },
          })
        : await tx.supplier.create({
            data: { ...s, status: "ACTIVE" },
          });
      supplierRows.push(row);
    }
    console.log(`✓ ${supplierRows.length} realistic suppliers seeded.`);

    // 4. Upsert Customers
    const customerRows = [];
    for (const c of customersData) {
      const existing = await tx.customer.findFirst({ where: { email: c.email } });
      const row = existing
        ? await tx.customer.update({
            where: { id: existing.id },
            data: { name: c.name, phone: c.phone, address: c.address, notes: c.notes, status: "ACTIVE" },
          })
        : await tx.customer.create({
            data: { ...c, status: "ACTIVE" },
          });
      customerRows.push(row);
    }
    console.log(`✓ ${customerRows.length} customers seeded.`);

    // 5. Upsert 52 Products
    const productRows = [];
    for (const [index, p] of productsData.entries()) {
      const category = categoryMap[p.catCode];
      const sku = `SKU-${p.catCode}-${String(index + 1).padStart(3, "0")}`;

      const row = await tx.product.upsert({
        where: { sku },
        update: {
          name: p.name,
          categoryId: category.id,
          unit: p.unit,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          minimumStock: p.minStock,
          status: "ACTIVE",
        },
        create: {
          name: p.name,
          categoryId: category.id,
          sku,
          unit: p.unit,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          minimumStock: p.minStock,
          status: "ACTIVE",
        },
      });
      productRows.push({ ...row, openingStock: p.openingStock });
    }
    console.log(`✓ ${productRows.length} supermarket products cataloged.`);

    // Clean up old transactions & adjustments
    await tx.saleItem.deleteMany({});
    await tx.sale.deleteMany({});
    await tx.purchaseItem.deleteMany({});
    await tx.purchase.deleteMany({});
    await tx.stockAdjustment.deleteMany({});

    // 6. Seed Initial Stock Adjustments to establish base inventory
    await tx.stockAdjustment.createMany({
      data: productRows.map((product) => ({
        productId: product.id,
        createdById: admin.id,
        type: "INCREASE",
        quantity: product.openingStock,
        reason: "Initial warehouse inventory count",
      })),
    });

    // Create 2 low-stock test items by applying deliberate reduction
    // Product 4 (Black Tea) and Product 45 (Body Cream)
    await tx.stockAdjustment.createMany({
      data: [
        {
          productId: productRows[4].id,
          createdById: admin.id,
          type: "DECREASE",
          quantity: productRows[4].openingStock - 5, // Leaves 5 on hand (minStock is 20) -> LOW STOCK
          reason: "Batch expiration and write-off",
        },
        {
          productId: productRows[45].id,
          createdById: admin.id,
          type: "DECREASE",
          quantity: productRows[45].openingStock - 3, // Leaves 3 on hand (minStock is 8) -> LOW STOCK
          reason: "Defective packaging return",
        },
      ],
    });
    console.log("✓ Initial stock inventory and threshold alerts established.");

    // Helper to create purchases
    const createPurchase = async (ref, supplier, status, items, daysAgoVal, notes = "Procurement Order") => {
      const calculatedTotal = items.reduce((sum, it) => sum + lineTotal(it.quantity, it.unitCost), 0);
      return tx.purchase.create({
        data: {
          referenceNumber: ref,
          supplierId: supplier.id,
          createdById: admin.id,
          transactionDate: daysAgo(daysAgoVal),
          status,
          notes,
          total: calculatedTotal,
          purchaseItems: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitCost: it.unitCost,
              lineTotal: lineTotal(it.quantity, it.unitCost),
            })),
          },
        },
      });
    };

    // 7. Seed 10 Realistic Purchases across different timeframes
    console.log("✓ Generating realistic purchase transactions...");
    await createPurchase("PO-2026-001", supplierRows[0], "COMPLETED", [
      { productId: productRows[0].id, quantity: 150, unitCost: 15.00 },
      { productId: productRows[1].id, quantity: 100, unitCost: 30.00 },
      { productId: productRows[2].id, quantity: 30, unitCost: 320.00 },
    ], 28, "Monthly beverage restocking");

    await createPurchase("PO-2026-002", supplierRows[1], "COMPLETED", [
      { productId: productRows[9].id, quantity: 60, unitCost: 160.00 },
      { productId: productRows[10].id, quantity: 80, unitCost: 60.00 },
      { productId: productRows[12].id, quantity: 90, unitCost: 45.00 },
    ], 24, "Bi-weekly organic produce procurement");

    await createPurchase("PO-2026-003", supplierRows[2], "COMPLETED", [
      { productId: productRows[18].id, quantity: 50, unitCost: 45.00 },
      { productId: productRows[19].id, quantity: 30, unitCost: 65.00 },
      { productId: productRows[21].id, quantity: 25, unitCost: 110.00 },
      { productId: productRows[25].id, quantity: 40, unitCost: 140.00 },
    ], 20, "Bakery line replenishment");

    await createPurchase("PO-2026-004", supplierRows[3], "COMPLETED", [
      { productId: productRows[27].id, quantity: 30, unitCost: 580.00 },
      { productId: productRows[28].id, quantity: 40, unitCost: 420.00 },
      { productId: productRows[30].id, quantity: 80, unitCost: 55.00 },
    ], 16, "Dry staples and cooking oils order");

    await createPurchase("PO-2026-005", supplierRows[4], "COMPLETED", [
      { productId: productRows[36].id, quantity: 90, unitCost: 65.00 },
      { productId: productRows[37].id, quantity: 35, unitCost: 280.00 },
      { productId: productRows[38].id, quantity: 25, unitCost: 160.00 },
    ], 12, "Weekly fresh dairy crate intake");

    await createPurchase("PO-2026-006", supplierRows[5], "COMPLETED", [
      { productId: productRows[44].id, quantity: 40, unitCost: 90.00 },
      { productId: productRows[47].id, quantity: 50, unitCost: 75.00 },
      { productId: productRows[51].id, quantity: 30, unitCost: 220.00 },
    ], 9, "Personal care wholesale shipment");

    await createPurchase("PO-2026-007", supplierRows[0], "COMPLETED", [
      { productId: productRows[5].id, quantity: 80, unitCost: 25.00 },
      { productId: productRows[6].id, quantity: 90, unitCost: 25.00 },
      { productId: productRows[7].id, quantity: 35, unitCost: 120.00 },
    ], 5, "Weekend canned soft drinks refill");

    await createPurchase("PO-2026-008", supplierRows[1], "COMPLETED", [
      { productId: productRows[13].id, quantity: 100, unitCost: 55.00 },
      { productId: productRows[14].id, quantity: 120, unitCost: 40.00 },
    ], 2, "Root vegetables and onions shipment");

    await createPurchase("PO-2026-009", supplierRows[4], "DRAFT", [
      { productId: productRows[39].id, quantity: 20, unitCost: 310.00 },
      { productId: productRows[40].id, quantity: 35, unitCost: 115.00 },
    ], 1, "Pending dairy approval - cheddar and greek yogurt");

    await createPurchase("PO-2026-010", supplierRows[3], "CANCELLED", [
      { productId: productRows[29].id, quantity: 25, unitCost: 490.00 },
    ], 3, "Cancelled order due to supplier price discrepancy");

    // Helper to create sales
    const createSale = async (ref, customer, status, items, daysAgoVal, notes = "Store Checkout") => {
      const calculatedTotal = items.reduce((sum, it) => sum + lineTotal(it.quantity, it.unitPrice), 0);
      return tx.sale.create({
        data: {
          referenceNumber: ref,
          customerId: customer.id,
          createdById: staff.id,
          transactionDate: daysAgo(daysAgoVal),
          status,
          notes,
          total: calculatedTotal,
          saleItems: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              lineTotal: lineTotal(it.quantity, it.unitPrice),
            })),
          },
        },
      });
    };

    // 8. Seed 14 Realistic Sales across past 30 days
    console.log("✓ Generating realistic sales transactions...");
    await createSale("SO-2026-001", customerRows[1], "COMPLETED", [
      { productId: productRows[2].id, quantity: 10, unitPrice: 450.00 },
      { productId: productRows[36].id, quantity: 30, unitPrice: 95.00 },
      { productId: productRows[35].id, quantity: 15, unitPrice: 240.00 },
    ], 27, "Café Abyssinia weekly coffee and milk supply");

    await createSale("SO-2026-002", customerRows[2], "COMPLETED", [
      { productId: productRows[25].id, quantity: 15, unitPrice: 210.00 },
      { productId: productRows[37].id, quantity: 8, unitPrice: 380.00 },
      { productId: productRows[38].id, quantity: 10, unitPrice: 230.00 },
    ], 25, "Bethy Pastry baking supplies order");

    await createSale("SO-2026-003", customerRows[3], "COMPLETED", [
      { productId: productRows[27].id, quantity: 6, unitPrice: 780.00 },
      { productId: productRows[28].id, quantity: 8, unitPrice: 590.00 },
      { productId: productRows[13].id, quantity: 25, unitPrice: 85.00 },
      { productId: productRows[14].id, quantity: 30, unitPrice: 65.00 },
    ], 22, "Kebede Grill bulk restaurant procurement");

    await createSale("SO-2026-004", customerRows[0], "COMPLETED", [
      { productId: productRows[0].id, quantity: 4, unitPrice: 25.00 },
      { productId: productRows[18].id, quantity: 1, unitPrice: 70.00 },
      { productId: productRows[9].id, quantity: 2, unitPrice: 230.00 },
      { productId: productRows[36].id, quantity: 2, unitPrice: 95.00 },
    ], 19, "Walk-in basket checkout #1042");

    await createSale("SO-2026-005", customerRows[5], "COMPLETED", [
      { productId: productRows[6].id, quantity: 35, unitPrice: 45.00 },
      { productId: productRows[5].id, quantity: 25, unitPrice: 45.00 },
      { productId: productRows[30].id, quantity: 20, unitPrice: 90.00 },
    ], 17, "Corner grocer wholesale restock");

    await createSale("SO-2026-006", customerRows[7], "COMPLETED", [
      { productId: productRows[2].id, quantity: 6, unitPrice: 450.00 },
      { productId: productRows[36].id, quantity: 25, unitPrice: 95.00 },
      { productId: productRows[21].id, quantity: 8, unitPrice: 175.00 },
      { productId: productRows[50].id, quantity: 10, unitPrice: 85.00 },
    ], 14, "Capital Suites weekly hotel hospitality restock");

    await createSale("SO-2026-007", customerRows[8], "COMPLETED", [
      { productId: productRows[0].id, quantity: 60, unitPrice: 25.00 },
      { productId: productRows[10].id, quantity: 15, unitPrice: 95.00 },
      { productId: productRows[40].id, quantity: 12, unitPrice: 175.00 },
    ], 11, "FitLife Gym members refreshment counter");

    await createSale("SO-2026-008", customerRows[4], "COMPLETED", [
      { productId: productRows[18].id, quantity: 2, unitPrice: 70.00 },
      { productId: productRows[28].id, quantity: 1, unitPrice: 590.00 },
      { productId: productRows[30].id, quantity: 3, unitPrice: 90.00 },
      { productId: productRows[44].id, quantity: 1, unitPrice: 145.00 },
    ], 8, "Residential home groceries delivery");

    await createSale("SO-2026-009", customerRows[9], "COMPLETED", [
      { productId: productRows[3].id, quantity: 4, unitPrice: 400.00 },
      { productId: productRows[4].id, quantity: 3, unitPrice: 140.00 },
      { productId: productRows[36].id, quantity: 15, unitPrice: 95.00 },
      { productId: productRows[51].id, quantity: 5, unitPrice: 330.00 },
    ], 6, "TechCorp office pantry monthly restock");

    await createSale("SO-2026-010", customerRows[11], "COMPLETED", [
      { productId: productRows[18].id, quantity: 8, unitPrice: 70.00 },
      { productId: productRows[36].id, quantity: 20, unitPrice: 95.00 },
      { productId: productRows[10].id, quantity: 12, unitPrice: 95.00 },
      { productId: productRows[44].id, quantity: 4, unitPrice: 145.00 },
    ], 3, "Sunshine Daycare weekly order");

    await createSale("SO-2026-011", customerRows[0], "COMPLETED", [
      { productId: productRows[1].id, quantity: 3, unitPrice: 50.00 },
      { productId: productRows[7].id, quantity: 2, unitPrice: 180.00 },
      { productId: productRows[21].id, quantity: 1, unitPrice: 175.00 },
    ], 1, "Counter walk-in evening purchase");

    await createSale("SO-2026-012", customerRows[6], "DRAFT", [
      { productId: productRows[27].id, quantity: 5, unitPrice: 780.00 },
      { productId: productRows[28].id, quantity: 4, unitPrice: 590.00 },
      { productId: productRows[37].id, quantity: 6, unitPrice: 380.00 },
    ], 1, "Draft quote for Genet events weekend banquet");

    await createSale("SO-2026-013", customerRows[10], "DRAFT", [
      { productId: productRows[18].id, quantity: 2, unitPrice: 70.00 },
      { productId: productRows[36].id, quantity: 4, unitPrice: 95.00 },
    ], 0, "Cart checkout pending online payment confirmation");

    await createSale("SO-2026-014", customerRows[3], "CANCELLED", [
      { productId: productRows[29].id, quantity: 10, unitPrice: 690.00 },
    ], 5, "Customer cancelled - requested alternate brand");

    console.log("✓ All real-world sales transactions completed.");
  });

  console.log("\n========================================================");
  console.log("🎉 REAL-WORLD SEEDING COMPLETED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("📊 Summary of Seed Data:");
  console.log(`• Categories:    ${categoriesData.length} (BEV, PRO, BAK, PAN, DAI, PER)`);
  console.log(`• Products:      ${productsData.length} active realistic items with pricing`);
  console.log(`• Suppliers:     ${suppliersData.length} authentic business suppliers`);
  console.log(`• Customers:     ${customersData.length} diverse real-world customers`);
  console.log("• Purchases:     10 transactions (8 Completed, 1 Draft, 1 Cancelled)");
  console.log("• Sales:         14 transactions (11 Completed, 2 Draft, 1 Cancelled)");
  console.log("• Stock Alerts:  2 items placed under minimum threshold");
  console.log("\n🔑 Preserved Credentials:");
  console.log("• Admin:  admin@example.com  /  Admin@1234");
  console.log("• Staff:  staff@example.com  /  Staff@1234");
  console.log("========================================================\n");
};

main()
  .catch((error) => {
    console.error("❌ Seed failed with error:", error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
