import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Syntra Administrator";

  if (!email || !password) {
    console.log(
      "Skipping admin seed because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.",
    );
    return;
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log(`Admin account is ready for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
