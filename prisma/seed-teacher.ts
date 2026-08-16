import "dotenv/config";

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  console.log("👨‍🏫 Creating EduMind teacher...");

  const passwordHash = await bcrypt.hash(
    "Teacher12345",
    12
  );

  const teacher = await prisma.user.upsert({
    where: {
      email: "teacher@edumind.com",
    },

    update: {
      name: "Test Teacher",
      passwordHash,
      role: "TEACHER",
      status: "ACTIVE",
    },

    create: {
      name: "Test Teacher",
      email: "teacher@edumind.com",
      passwordHash,
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  await prisma.teacherProfile.upsert({
    where: {
      userId: teacher.id,
    },

    update: {
      employeeId: "TCH001",
      department: "CSE",
    },

    create: {
      userId: teacher.id,
      employeeId: "TCH001",
      department: "CSE",
    },
  });

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  for (const course of courses) {
    await prisma.course.update({
      where: {
        id: course.id,
      },

      data: {
        teacherId: teacher.id,
      },
    });

    console.log(`📚 Assigned ${course.code}`);
  }

  console.log("");
  console.log("======================================");
  console.log("🎉 Teacher created successfully!");
  console.log("======================================");
  console.log("");
  console.log("Email:    teacher@edumind.com");
  console.log("Password: Teacher12345");
  console.log("Employee: TCH001");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Teacher seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });