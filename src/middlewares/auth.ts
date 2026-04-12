import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { UserRole, UserStatus } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: UserStatus;
        emailVerified: boolean;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email to access this resource.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        status: (session.user.status as UserStatus) || UserStatus.ACTIVE,
        emailVerified: session.user.emailVerified,
      };

      if (req.user.status !== UserStatus.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: "Your account is not active.",
        });
      }

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
export { UserRole, UserStatus };
