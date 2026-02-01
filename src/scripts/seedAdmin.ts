import { UserRole } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Admin Rahman",
      email: process.env.ADMIN_EMAIL!,
      role: UserRole.ADMIN,
      password: process.env.ADMIN_PASSWORD,
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      console.log("Admin user already exists. Skipping seeding.");
      return;
    }

    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (signUpAdmin.ok) {
      console.log("Admin Created.");
      await prisma.user.update({
        where: { email: adminData.email },
        data: { emailVerified: true },
      });
      console.log("Email Verification status updated!");
    } else {
      console.log("API call failed:");
      console.log("Status:", signUpAdmin.status);
      console.log("Response:", await signUpAdmin.text());
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

seedAdmin();
