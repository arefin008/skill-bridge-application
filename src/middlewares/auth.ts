import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export enum UserRole {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        emailVerified: boolean;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get user session
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!", //not logged in
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email to access this resource.", //email not verified
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.", //role not authorized
        });
      }

      // If the user is a tutor, ensure they have a tutor profile
      // if (req.user.role === UserRole.TUTOR) {
      //   const profile = await prisma.tutorProfile.findUnique({
      //     where: { userId: req.user.id },
      //   });

      //   if (!profile) {
      //     await prisma.tutorProfile.create({
      //       data: {
      //         userId: req.user.id,
      //         bio: "",
      //         hourlyRate: 0,
      //         experience: 0,
      //       },
      //     });
      //   }
      // }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
