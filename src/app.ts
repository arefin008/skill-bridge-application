import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";
import { tutorRouter } from "./modules/tutor/tutor.routes";
import { bookingRouter } from "./modules/booking/booking.routes";
import { categoryRouter } from "./modules/category/category.routes";
import { availabilityRouter } from "./modules/availability/availability.routes";
import { reviewRouter } from "./modules/review/review.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { reportRouter } from "./modules/report/report.routes";
import { supportRouter } from "./modules/support/support.routes";
import { userRouter } from "./modules/user/user.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { aiRouter } from "./modules/ai/ai.routes";

const app: Application = express();
const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRouter);
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/tutors", tutorRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/reports", reportRouter);
app.use("/api/support", supportRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Skill Bridge Application!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
