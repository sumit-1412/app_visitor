// File: /server/routes/settings.ts
import express, { Request, Response, Router } from "express";
import Settings from "../models/Settings";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router: Router = express.Router();

// GET settings for a site
router.get(
  "/:siteId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const settings = await Settings.findOne({ site: req.params.siteId });
    res.json(settings);
  }
);

// POST (create or update) settings for a site
router.post(
  "/:siteId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const updated = await Settings.findOneAndUpdate(
        { site: req.params.siteId },
        { ...req.body, site: req.params.siteId },
        { upsert: true, new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;
