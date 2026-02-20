import { prisma } from "../lib/prisma";

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const tutorCount = await prisma.tutorProfile.count();
    const categoryCount = await prisma.category.count();
    const bookingCount = await prisma.booking.count();

    console.log("Database Stats:");
    console.log("- Users:", userCount);
    console.log("- Tutor Profiles:", tutorCount);
    console.log("- Categories:", categoryCount);
    console.log("- Bookings:", bookingCount);

    if (tutorCount > 0) {
      const sampleTutors = await prisma.tutorProfile.findMany({
        take: 3,
        include: { user: true }
      });
      console.log("\nSample Tutors:", JSON.stringify(sampleTutors, null, 2));
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
