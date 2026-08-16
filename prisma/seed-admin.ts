import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  console.log("👑 Creating EduMind admin...");

  const passwordHash = await bcrypt.hash(
    "Admin12345",
    12
  );

  await prisma.user.upsert({
    where: {
      email: "admin@edumind.com",
    },
    update: {
      name: "EduMind Admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "EduMind Admin",
      email: "admin@edumind.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("");
  console.log("======================================");
  console.log("🎉 Admin created successfully!");
  console.log("======================================");
  console.log("");
  console.log("Email:    admin@edumind.com");
  console.log("Password: Admin12345");
}

main()
  .catch((error) => {
    console.error("❌ Admin seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });