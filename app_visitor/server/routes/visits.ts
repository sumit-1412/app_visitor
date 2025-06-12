import express, { Response } from "express";
import Visit from "../models/Visit";
import {
  authenticate,
  authorizeRoles,
  AuthRequest,
} from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/visits?status=&siteId=&page=&limit=&from=&to=
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "superadmin", "guard"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, siteId, page = 1, limit = 10, from, to } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (siteId) filters.site = siteId;
      if (from || to) {
        filters.checkInTime = {};
        if (from) filters.checkInTime.$gte = new Date(from as string);
        if (to) filters.checkInTime.$lte = new Date(to as string);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
        Visit.find(filters)
          .sort({ checkInTime: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Visit.countDocuments(filters),
      ]);

      res.json({
        data,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  }
);

// PATCH /api/visits/:id/approve — Only admin or guard
router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("admin", "guard"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const visit = await Visit.findByIdAndUpdate(
        req.params.id,
        {
          status: "checked-in",
          approvedBy: req.user?._id,
          approvalNote: req.body.approvalNote || "",
        },
        { new: true }
      );

      if (!visit) {
        res.status(404).json({ message: "Visit not found" });
        return;
      }

      res.json(visit);
    } catch (err) {
      res.status(500).json({ message: "Failed to approve visitor" });
    }
  }
);

// PATCH /api/visits/:id/reject — Only admin or guard
router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("admin", "guard"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const visit = await Visit.findByIdAndUpdate(
        req.params.id,
        {
          status: "rejected",
          approvedBy: req.user?._id,
          approvalNote: req.body.approvalNote || "",
        },
        { new: true }
      );

      if (!visit) {
        res.status(404).json({ message: "Visit not found" });
        return;
      }

      res.json(visit);
    } catch (err) {
      res.status(500).json({ message: "Failed to reject visitor" });
    }
  }
);

// PATCH /api/visits/:id — Inline edit (Only admin or guard)
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin", "guard"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!visit) {
        res.status(404).json({ message: "Visit not found" });
        return;
      }

      res.json(visit);
    } catch (err) {
      res.status(500).json({ message: "Failed to update visit" });
    }
  }
);

export default router;
