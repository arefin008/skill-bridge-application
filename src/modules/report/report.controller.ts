import { NextFunction, Request, Response } from "express";
import {
  ModerationActionType,
  ReportStatus,
  ReportTargetType,
} from "../../../generated/prisma/enums";
import { reportService } from "./report.service";
import { sendSuccess } from "../../utils/apiResponse";

const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report = await reportService.createReport({
      reporterId: req.user!.id,
      targetType: req.body.targetType as ReportTargetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
      details: req.body.details,
    });

    return res
      .status(201)
      .json(sendSuccess(report, "Report submitted successfully"));
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await reportService.getMyReports(req.user!.id);
    return res.status(200).json(sendSuccess(reports, "My reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllReports = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await reportService.getAllReports();
    return res.status(200).json(sendSuccess(reports, "Reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getReportQueue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await reportService.getReportQueue(
      req.query.status as ReportStatus | undefined,
      req.query.targetType as ReportTargetType | undefined,
    );
    return res.status(200).json(sendSuccess(reports, "Report queue fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getModerationActivityLog = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activityLog = await reportService.getModerationActivityLog();
    return res
      .status(200)
      .json(sendSuccess(activityLog, "Moderation activity log fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const moderateReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report = await reportService.moderateReport(req.params.id as string, {
      moderatorId: req.user!.id,
      status: req.body.status as ReportStatus,
      decisionNote: req.body.decisionNote,
      actionType: req.body.actionType as ModerationActionType | undefined,
    });

    return res
      .status(200)
      .json(sendSuccess(report, "Report updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const reportController = {
  createReport,
  getMyReports,
  getAllReports,
  getReportQueue,
  getModerationActivityLog,
  moderateReport,
};
