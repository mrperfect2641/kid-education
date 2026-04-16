import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const USERS = [
  { username: "admin", email: "admin@ecolearn.local", password: "Admin@123", role: "ADMIN", fullName: "System Admin" },
  { username: "manager", email: "manager@ecolearn.local", password: "Manager@123", role: "MANAGER", fullName: "Ops Manager" },
  { username: "staff", email: "staff@ecolearn.local", password: "Staff@123", role: "STAFF", fullName: "Team Staff" },
  { username: "teacher", email: "teacher@ecolearn.local", password: "Teacher@123", role: "TEACHER", fullName: "Teacher User" },
  { username: "student", email: "student@ecolearn.local", password: "Student@123", role: "STUDENT", fullName: "Student User" },
];

async function main() {
  for (const user of USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        passwordHash,
      },
      create: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // biome-ignore lint/suspicious/noConsole: seeding error output
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
