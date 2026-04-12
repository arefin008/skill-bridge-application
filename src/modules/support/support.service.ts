import {
  ContactRequestStatus,
  SupportTicketStatus,
  SupportTicketType,
  TicketPriority,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateSupportTicketInput {
  userId: string;
  subject: string;
  message: string;
  type?: SupportTicketType;
  priority?: TicketPriority;
  bookingId?: string;
}

interface UpdateSupportTicketInput {
  assignedToId?: string;
  status?: SupportTicketStatus;
  priority?: TicketPriority;
  resolutionNote?: string;
}

interface CreateContactRequestInput {
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface UpdateContactRequestInput {
  handledById: string;
  status: ContactRequestStatus;
  responseNote?: string;
}

const createSupportTicket = async (data: CreateSupportTicketInput) => {
  return prisma.supportTicket.create({
    data: {
      userId: data.userId,
      subject: data.subject,
      message: data.message,
      type: data.type ?? SupportTicketType.GENERAL,
      priority: data.priority ?? TicketPriority.MEDIUM,
      bookingId: data.bookingId,
    },
    include: {
      user: true,
      booking: true,
    },
  });
};

const getMyTickets = async (userId: string) => {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: true,
      booking: true,
    },
  });
};

const getAllTickets = async () => {
  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

const getBookingIssues = async () => {
  return prisma.supportTicket.findMany({
    where: {
      type: {
        in: ["BOOKING_ISSUE", "CANCELLATION", "REFUND"],
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

const updateTicket = async (ticketId: string, data: UpdateSupportTicketInput) => {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data,
    include: {
      user: true,
      assignedTo: true,
      booking: true,
    },
  });
};

const createContactRequest = async (data: CreateContactRequestInput) => {
  return prisma.contactRequest.create({
    data,
  });
};

const getAllContactRequests = async () => {
  return prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      handledBy: true,
    },
  });
};

const getAssistanceLog = async () => {
  return prisma.supportTicket.findMany({
    where: {
      status: SupportTicketStatus.RESOLVED,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: true,
    },
  });
};

const updateContactRequest = async (
  id: string,
  data: UpdateContactRequestInput,
) => {
  return prisma.contactRequest.update({
    where: { id },
    data,
    include: {
      user: true,
      handledBy: true,
    },
  });
};

export const supportService = {
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
