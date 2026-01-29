import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";
import { tutorRouter } from "./modules/tutor/tutor.routes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/tutor", tutorRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Skill Bridge Application!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
