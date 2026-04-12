import { NextFunction, Request, Response } from "express";
import {
  ContactRequestStatus,
  SupportTicketStatus,
  SupportTicketType,
  TicketPriority,
} from "../../../generated/prisma/enums";
import { supportService } from "./support.service";
import { sendSuccess } from "../../utils/apiResponse";

const createSupportTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticket = await supportService.createSupportTicket({
      userId: req.user!.id,
      subject: req.body.subject,
      message: req.body.message,
      type: req.body.type as SupportTicketType | undefined,
      priority: req.body.priority as TicketPriority | undefined,
      bookingId: req.body.bookingId,
    });

    return res
      .status(201)
      .json(sendSuccess(ticket, "Support ticket created successfully"));
  } catch (error) {
    next(error);
  }
};

const getMyTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tickets = await supportService.getMyTickets(req.user!.id);
    return res.status(200).json(sendSuccess(tickets, "My tickets fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tickets = await supportService.getAllTickets();
    return res.status(200).json(sendSuccess(tickets, "Tickets fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getBookingIssues = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tickets = await supportService.getBookingIssues();
    return res.status(200).json(sendSuccess(tickets, "Booking issues fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticket = await supportService.updateTicket(req.params.id as string, {
      assignedToId: req.body.assignedToId ?? req.user!.id,
      status: req.body.status as SupportTicketStatus | undefined,
      priority: req.body.priority as TicketPriority | undefined,
      resolutionNote: req.body.resolutionNote,
    });

    return res
      .status(200)
      .json(sendSuccess(ticket, "Support ticket updated successfully"));
  } catch (error) {
    next(error);
  }
};

const createContactRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contactRequest = await supportService.createContactRequest({
      userId: req.user?.id,
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    return res
      .status(201)
      .json(sendSuccess(contactRequest, "Contact request submitted successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllContactRequests = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contactRequests = await supportService.getAllContactRequests();
    return res
      .status(200)
      .json(sendSuccess(contactRequests, "Contact requests fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getAssistanceLog = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assistanceLog = await supportService.getAssistanceLog();
    return res
      .status(200)
      .json(sendSuccess(assistanceLog, "Assistance log fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateContactRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contactRequest = await supportService.updateContactRequest(
      req.params.id as string,
      {
        handledById: req.user!.id,
        status: req.body.status as ContactRequestStatus,
        responseNote: req.body.responseNote,
      },
    );

    return res
      .status(200)
      .json(sendSuccess(contactRequest, "Contact request updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const supportController = {
  createSupportTicket,
  getMyTickets,
  getAllTickets,
  getBookingIssues,
  updateTicket,
  createContactRequest,
  getAllContactRequests,
  getAssistanceLog,
  updateContactRequest,
};
