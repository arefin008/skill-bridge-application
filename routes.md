# Backend Routes

Base router mounts are defined in `src/app.ts`.

## App-Level Routes

- `GET /`
  Source: `src/app.ts`
  Purpose: Health/welcome response.

- `GET|POST|PUT|PATCH|DELETE /api/auth/*`
  Source: `src/app.ts`
  Handler: `toNodeHandler(auth)` from Better Auth.
  Purpose: Better Auth routes for sign-up, sign-in, session, sign-out, verification, and social auth callbacks.

## Folder: `src/modules/auth`

Router file: `src/modules/auth/auth.routes.ts`
Mount path: `/api/auth`

- `GET /api/auth/me`
  Auth: `STUDENT`, `TUTOR`, `ADMIN`, `MODERATOR`, `SUPPORT_MANAGER`
  Controller: `authController.getCurrentUser`

## Folder: `src/modules/user`

Router file: `src/modules/user/user.routes.ts`
Mount path: `/api/users`

- `GET /api/users/me`
  Auth: All authenticated roles
  Controller: `userController.getMyProfile`

- `PATCH /api/users/me`
  Auth: All authenticated roles
  Controller: `userController.updateMyProfile`

## Folder: `src/modules/admin`

Router file: `src/modules/admin/admin.routes.ts`
Mount path: `/api/admin`

- `GET /api/admin/stats`
  Auth: `ADMIN`
  Controller: `adminController.getPlatformStats`

- `GET /api/admin/users`
  Auth: `ADMIN`
  Controller: `adminController.getAllUsers`

- `GET /api/admin/tutors`
  Auth: `ADMIN`
  Controller: `adminController.getAllTutors`

- `POST /api/admin/staff`
  Auth: `ADMIN`
  Controller: `adminController.createStaffUser`

- `PATCH /api/admin/tutors/:id/verify`
  Auth: `ADMIN`
  Controller: `adminController.updateTutorVerification`

- `PATCH /api/admin/users/:id`
  Auth: `ADMIN`
  Controller: `adminController.updateUserStatus`

## Folder: `src/modules/dashboard`

Router file: `src/modules/dashboard/dashboard.routes.ts`
Mount path: `/api/dashboard`

- `GET /api/dashboard/student`
  Auth: `STUDENT`
  Controller: `dashboardController.getStudentDashboard`

- `GET /api/dashboard/tutor`
  Auth: `TUTOR`
  Controller: `dashboardController.getTutorDashboard`

- `GET /api/dashboard/moderator`
  Auth: `MODERATOR`
  Controller: `dashboardController.getModeratorDashboard`

- `GET /api/dashboard/support`
  Auth: `SUPPORT_MANAGER`
  Controller: `dashboardController.getSupportDashboard`

## Folder: `src/modules/availability`

Router file: `src/modules/availability/availability.routes.ts`
Mount path: `/api/availability`

- `POST /api/availability/`
  Auth: `TUTOR`
  Controller: `availabilityController.createAvailability`

- `GET /api/availability/`
  Auth: `TUTOR`
  Controller: `availabilityController.getMyAvailability`

- `DELETE /api/availability/:id`
  Auth: `TUTOR`
  Controller: `availabilityController.deleteAvailability`

## Folder: `src/modules/booking`

Router file: `src/modules/booking/booking.routes.ts`
Mount path: `/api/bookings`

- `POST /api/bookings/`
  Auth: `STUDENT`, `ADMIN`
  Controller: `bookingController.createBooking`

- `GET /api/bookings/`
  Auth: `ADMIN`
  Controller: `bookingController.getAllBookings`

- `GET /api/bookings/me`
  Auth: `STUDENT`
  Controller: `bookingController.getMyBookings`

- `PATCH /api/bookings/:id/cancel`
  Auth: `STUDENT`
  Controller: `bookingController.cancelMyBooking`

- `GET /api/bookings/tutor/me`
  Auth: `TUTOR`
  Controller: `bookingController.getTutorSessions`

- `PATCH /api/bookings/:id/complete`
  Auth: `STUDENT`, `TUTOR`
  Controller: `bookingController.completeSession`

## Folder: `src/modules/category`

Router file: `src/modules/category/category.routes.ts`
Mount path: `/api/categories`

- `GET /api/categories/`
  Auth: Public
  Controller: `categoryController.getCategories`

- `POST /api/categories/`
  Auth: `ADMIN`
  Controller: `categoryController.createCategory`

- `PATCH /api/categories/:id`
  Auth: `ADMIN`
  Controller: `categoryController.updateCategory`

## Folder: `src/modules/review`

Router file: `src/modules/review/review.routes.ts`
Mount path: `/api/reviews`

- `POST /api/reviews/`
  Auth: `STUDENT`
  Controller: `reviewController.createReview`

- `GET /api/reviews/me`
  Auth: `STUDENT`
  Controller: `reviewController.getMyReviews`

- `GET /api/reviews/tutor/me`
  Auth: `TUTOR`
  Controller: `reviewController.getTutorReviews`

## Folder: `src/modules/ai`

Router file: `src/modules/ai/ai.routes.ts`
Mount path: `/api/ai`

- `POST /api/ai/chat`
  Auth: Public
  Controller: `aiController.chat`

- `POST /api/ai/sentiment`
  Auth: Public
  Controller: `aiController.classifyReviewSentiment`

## Folder: `src/modules/report`

Router file: `src/modules/report/report.routes.ts`
Mount path: `/api/reports`

- `POST /api/reports/`
  Auth: `STUDENT`, `TUTOR`
  Controller: `reportController.createReport`

- `GET /api/reports/me`
  Auth: `STUDENT`, `TUTOR`
  Controller: `reportController.getMyReports`

- `GET /api/reports/`
  Auth: `ADMIN`, `MODERATOR`
  Controller: `reportController.getAllReports`

- `GET /api/reports/queue`
  Auth: `ADMIN`, `MODERATOR`
  Controller: `reportController.getReportQueue`

- `GET /api/reports/activity-log`
  Auth: `ADMIN`, `MODERATOR`
  Controller: `reportController.getModerationActivityLog`

- `PATCH /api/reports/:id`
  Auth: `ADMIN`, `MODERATOR`
  Controller: `reportController.moderateReport`

## Folder: `src/modules/support`

Router file: `src/modules/support/support.routes.ts`
Mount path: `/api/support`

- `POST /api/support/tickets`
  Auth: `STUDENT`, `TUTOR`
  Controller: `supportController.createSupportTicket`

- `GET /api/support/tickets/me`
  Auth: `STUDENT`, `TUTOR`
  Controller: `supportController.getMyTickets`

- `GET /api/support/tickets`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.getAllTickets`

- `GET /api/support/tickets/issues`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.getBookingIssues`

- `PATCH /api/support/tickets/:id`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.updateTicket`

- `POST /api/support/contact`
  Auth: Public
  Controller: `supportController.createContactRequest`

- `GET /api/support/contact`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.getAllContactRequests`

- `GET /api/support/assistance-log`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.getAssistanceLog`

- `PATCH /api/support/contact/:id`
  Auth: `SUPPORT_MANAGER`, `ADMIN`
  Controller: `supportController.updateContactRequest`

## Folder: `src/modules/tutor`

Router file: `src/modules/tutor/tutor.routes.ts`
Mount path: `/api/tutors`

- `POST /api/tutors/`
  Auth: `TUTOR`
  Controller: `tutorController.createTutorProfile`

- `GET /api/tutors/`
  Auth: Public
  Controller: `tutorController.getAllTutors`

- `GET /api/tutors/my-profile`
  Auth: `TUTOR`
  Controller: `tutorController.getMyProfile`

- `PUT /api/tutors/profile`
  Auth: `TUTOR`
  Controller: `tutorController.updateTutorProfile`

- `GET /api/tutors/recommendations`
  Auth: Public, with optional session-based personalization
  Controller: `aiController.getRecommendations`

- `GET /api/tutors/:id/review-insights`
  Auth: Public
  Controller: `aiController.getReviewInsights`

- `GET /api/tutors/:id`
  Auth: Public
  Controller: `tutorController.getTutorById`
