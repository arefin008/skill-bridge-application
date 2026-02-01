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

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
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

app.get("/", (req, res) => {
  res.send("Welcome to the Skill Bridge Application!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
