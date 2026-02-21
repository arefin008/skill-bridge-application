import { prisma } from "../lib/prisma";

async function fixData() {
  try {
    const updated = await prisma.booking.updateMany({
        where: { 
            status: "CANCELLED", 
            availabilityId: { not: null } 
        },
        data: { availabilityId: null },
    });
    console.log(`Successfully detached ${updated.count} availability slots from old canceled bookings!`);
  } catch (error) {
    console.error("Error fixing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixData();
