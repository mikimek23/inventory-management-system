import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

const main = async () => {
  const email = "admin@example.com";
  const password = "Admin@1234";

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Initial admin created:");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${password}`);
};

main()
  .catch((error) => {
    console.error("Failed to create initial admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
