import {
  ModerationActionType,
  ModerationStatus,
  ReportStatus,
  ReportTargetType,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

interface ModerateReportInput {
  moderatorId: string;
  status: ReportStatus;
  decisionNote?: string;
  actionType?: ModerationActionType;
}

const createReport = async (data: CreateReportInput) => {
  if (data.targetType === ReportTargetType.REVIEW) {
    const review = await prisma.review.findUnique({
      where: { id: data.targetId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    return prisma.report.create({
      data: {
        reporterId: data.reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        details: data.details,
        reviewId: review.id,
      },
    });
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: data.targetId },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  return prisma.report.create({
    data: {
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details,
      tutorProfileId: tutorProfile.id,
    },
  });
};

const getMyReports = async (reporterId: string) => {
  return prisma.report.findMany({
    where: { reporterId },
    orderBy: { createdAt: "desc" },
    include: {
      review: true,
      tutorProfile: {
        include: {
          user: true,
        },
      },
      moderator: true,
    },
  });
};

const getAllReports = async () => {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      moderator: true,
      review: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true,
            },
          },
        },
      },
      tutorProfile: {
        include: {
          user: true,
          tutorCategories: {
            include: { category: true },
          },
        },
      },
      moderationActions: {
        include: {
          moderator: true,
        },
      },
    },
  });
};

const getReportQueue = async (
  status?: ReportStatus,
  targetType?: ReportTargetType,
) => {
  return prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(targetType ? { targetType } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      review: true,
      tutorProfile: {
        include: {
          user: true,
        },
      },
      moderationActions: {
        include: {
          moderator: true,
        },
      },
    },
  });
};

const getModerationActivityLog = async () => {
  return prisma.moderationAction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      moderator: true,
      report: true,
      review: true,
      tutorProfile: {
        include: {
          user: true,
        },
      },
    },
  });
};

const moderateReport = async (reportId: string, data: ModerateReportInput) => {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: {
        review: true,
        tutorProfile: true,
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const updatedReport = await tx.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        decisionNote: data.decisionNote,
        moderatorId: data.moderatorId,
      },
    });

    if (data.actionType === ModerationActionType.HIDE_REVIEW && report.reviewId) {
      await tx.review.update({
        where: { id: report.reviewId },
        data: {
          isHidden: true,
          moderationStatus: ModerationStatus.HIDDEN,
        },
      });
    }

    if (data.actionType === ModerationActionType.APPROVE_REVIEW && report.reviewId) {
      await tx.review.update({
        where: { id: report.reviewId },
        data: {
          isHidden: false,
          moderationStatus: ModerationStatus.APPROVED,
        },
      });
    }

    if (
      data.actionType === ModerationActionType.FLAG_TUTOR_PROFILE &&
      report.tutorProfileId
    ) {
      await tx.tutorProfile.update({
        where: { id: report.tutorProfileId },
        data: { isVerified: false },
      });
    }

    if (
      data.actionType === ModerationActionType.CLEAR_TUTOR_PROFILE &&
      report.tutorProfileId
    ) {
      await tx.tutorProfile.update({
        where: { id: report.tutorProfileId },
        data: { isVerified: true },
      });
    }

    if (data.actionType) {
      await tx.moderationAction.create({
        data: {
          reportId,
          moderatorId: data.moderatorId,
          actionType: data.actionType,
          note: data.decisionNote,
          reviewId: report.reviewId,
          tutorProfileId: report.tutorProfileId,
        },
      });
    }

    return updatedReport;
  });
};

export const reportService = {
  createReport,
  getMyReports,
  getAllReports,
  getReportQueue,
  getModerationActivityLog,
  moderateReport,
};
