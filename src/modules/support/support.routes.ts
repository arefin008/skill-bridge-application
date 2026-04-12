import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { supportController } from "./support.controller";

const router = Router();

router.post(
  "/tickets",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  supportController.createSupportTicket,
);
router.get(
  "/tickets/me",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  supportController.getMyTickets,
);
router.get(
  "/tickets",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.getAllTickets,
);
router.get(
  "/tickets/issues",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.getBookingIssues,
);
router.patch(
  "/tickets/:id",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.updateTicket,
);

router.post("/contact", supportController.createContactRequest);
router.get(
  "/contact",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.getAllContactRequests,
);
router.get(
  "/assistance-log",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.getAssistanceLog,
);
router.patch(
  "/contact/:id",
  auth(UserRole.SUPPORT_MANAGER, UserRole.ADMIN),
  supportController.updateContactRequest,
);

export const supportRouter = router;
