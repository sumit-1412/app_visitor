// File: /server/routes/sites.ts
import express, { Request, Response, Router, NextFunction } from "express";
import Site from "../models/Site";
import {
  authenticate,
  authorizeRoles,
  AuthRequest,
} from "../middleware/authMiddleware";

const router: Router = express.Router();

// Safe wrapper to match Express types
const superadminOnly = (req: Request, res: Response, next: NextFunction) => {
  authorizeRoles("superadmin")(req as AuthRequest, res, next);
};

// GET all sites (superadmin only)
router.get(
  "/",
  authenticate,
  superadminOnly,
  async (req: AuthRequest, res: Response) => {
    const sites = await Site.find();
    res.json(sites);
  }
);

// POST create new site (superadmin only)
router.post(
  "/",
  authenticate,
  superadminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const site = await Site.create(req.body);
      res.status(201).json(site);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
