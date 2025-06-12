import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User"; // adjust if needed

// Extend Express Request to include `user`
export interface AuthRequest extends Request {
  user?: IUser & { _id: string };
}

// ✅ JWT Authentication Middleware
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser & { _id: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Role-Based Access Middleware (fixed return type)
export const authorizeRoles = (...allowedRoles: Array<IUser["role"]>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next();
  };
};

// ✅ Site-Level Access Middleware (fixed return type)
export const authorizeSiteAccess = (
  getSiteIdFromReq: (req: AuthRequest) => string
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    const userSites: string[] =
      req.user?.assignedSites?.map((site) => site.toString()) || [];
    const requestedSite = getSiteIdFromReq(req);

    if (userRole === "superadmin" || userSites.includes(requestedSite)) {
      next();
      return;
    }

    res.status(403).json({ message: "Site access denied" });
  };
};
