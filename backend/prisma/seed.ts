import "dotenv/config";
import { prisma } from "../src/database/prisma";
import { hashPassword } from "../src/utils/password.utils";
import { UserRole } from "../src/generated/prisma/enums";

interface SeedUser {
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  {
    email: "superadmin@university.edu",
    username: "superadmin",
    password: "SuperAdmin123!",
    role: UserRole.SUPER_ADMIN,
  },
  {
    email: "registrar@university.edu",
    username: "registrar",
    password: "Registrar123!",
    role: UserRole.REGISTRAR,
  },
  {
    email: "chair@university.edu",
    username: "chair",
    password: "Chair123!",
    role: UserRole.DEPARTMENT_CHAIR,
  },
  {
    email: "faculty@university.edu",
    username: "faculty",
    password: "Faculty123!",
    role: UserRole.FACULTY,
  },
  {
    email: "student@university.edu",
    username: "student",
    password: "Student123!",
    role: UserRole.STUDENT,
  },
];

async function main() {
  console.log("Seeding user roles...");

  for (const { email, username, password, role } of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log(`Skipped ${role} (${email}) — already exists`);
      continue;
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { email, username, passwordHash, role },
    });
    console.log(`Created ${role} (${email})`);
  }

  const total = await prisma.user.count();
  console.log(`Seeding complete. Total users in database: ${total}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
