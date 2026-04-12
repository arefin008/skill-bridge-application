import { BookingStatus, ReportStatus, SupportTicketStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getStudentDashboard = async (userId: string) => {
  const [totalBookings, upcomingSessions, cancelledSessions, completedSessions, recentBookings, recentReviews] =
    await Promise.all([
      prisma.booking.count({ where: { studentId: userId } }),
      prisma.booking.count({
        where: {
          studentId: userId,
          status: BookingStatus.CONFIRMED,
          sessionDate: { gte: new Date() },
        },
      }),
      prisma.booking.count({
        where: { studentId: userId, status: BookingStatus.CANCELLED },
      }),
      prisma.booking.count({
        where: { studentId: userId, status: BookingStatus.COMPLETED },
      }),
      prisma.booking.findMany({
        where: { studentId: userId },
        orderBy: { sessionDate: "desc" },
        take: 5,
        include: {
          tutor: { include: { user: true } },
          category: true,
        },
      }),
      prisma.review.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          tutor: { include: { user: true } },
        },
      }),
    ]);

  return {
    summary: {
      totalBookings,
      upcomingSessions,
      cancelledSessions,
      completedSessions,
    },
    recentBookings,
    recentReviews,
  };
};

const getTutorDashboard = async (userId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  const [totalSessions, upcomingSessions, completedSessions, averageRating, recentSessions, recentReviews] =
    await Promise.all([
      prisma.booking.count({ where: { tutorProfileId: tutor.id } }),
      prisma.booking.count({
        where: {
          tutorProfileId: tutor.id,
          status: BookingStatus.CONFIRMED,
          sessionDate: { gte: new Date() },
        },
      }),
      prisma.booking.count({
        where: { tutorProfileId: tutor.id, status: BookingStatus.COMPLETED },
      }),
      prisma.review.aggregate({
        where: { tutorProfileId: tutor.id },
        _avg: { rating: true },
      }),
      prisma.booking.findMany({
        where: { tutorProfileId: tutor.id },
        orderBy: { sessionDate: "desc" },
        take: 5,
        include: {
          student: true,
          category: true,
        },
      }),
      prisma.review.findMany({
        where: { tutorProfileId: tutor.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          student: true,
        },
      }),
    ]);

  return {
    summary: {
      totalSessions,
      upcomingSessions,
      completedSessions,
      averageRating: averageRating._avg.rating ?? 0,
    },
    recentSessions,
    recentReviews,
  };
};

const getModeratorDashboard = async () => {
  const [pendingReports, resolvedReports, hiddenReviews, flaggedTutorProfiles, latestReports, activityLog] =
    await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      prisma.review.count({ where: { isHidden: true } }),
      prisma.tutorProfile.count({ where: { isVerified: false } }),
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          reporter: true,
          moderator: true,
          review: true,
          tutorProfile: { include: { user: true } },
        },
      }),
      prisma.moderationAction.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          moderator: true,
          report: true,
          review: true,
          tutorProfile: { include: { user: true } },
        },
      }),
    ]);

  return {
    summary: {
      pendingReports,
      resolvedReports,
      hiddenReviews,
      flaggedTutorProfiles,
    },
    latestReports,
    activityLog,
  };
};

const getSupportDashboard = async () => {
  const [openTickets, resolvedTickets, pendingBookingIssues, urgentIssues, recentTickets, assistanceLog, contactRequests] =
    await Promise.all([
      prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } }),
      prisma.supportTicket.count({
        where: { status: SupportTicketStatus.RESOLVED },
      }),
      prisma.supportTicket.count({
        where: {
          type: { in: ["BOOKING_ISSUE", "CANCELLATION", "REFUND"] },
          status: { not: SupportTicketStatus.RESOLVED },
        },
      }),
      prisma.supportTicket.count({
        where: {
          priority: "URGENT",
          status: { not: SupportTicketStatus.RESOLVED },
        },
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: true,
          assignedTo: true,
          booking: true,
        },
      }),
      prisma.supportTicket.findMany({
        where: { status: SupportTicketStatus.RESOLVED },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          user: true,
          assignedTo: true,
        },
      }),
      prisma.contactRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          handledBy: true,
          user: true,
        },
      }),
    ]);

  return {
    summary: {
      openTickets,
      resolvedTickets,
      pendingBookingIssues,
      urgentIssues,
    },
    recentTickets,
    assistanceLog,
    contactRequests,
  };
};

export const dashboardService = {
  getStudentDashboard,
  getTutorDashboard,
  getModeratorDashboard,
  getSupportDashboard,
};
