import express, { Request, Response, Router } from "express";
import Visitor from "../models/Visitor";
import {
  authenticate,
  authorizeRoles,
  AuthRequest,
} from "../middleware/authMiddleware";

const router: Router = express.Router();

// ✅ GET all visitors (optionally filtered by site via query param)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const siteId = req.query.siteId;
  const filter = siteId ? { site: siteId } : {};
  const visitors = await Visitor.find(filter);
  res.json(visitors);
});

// ✅ POST create new visitor
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json(visitor);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ✅ GET single visitor
router.get(
  "/single/:id",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const visitor = await Visitor.findById(req.params.id);
      if (!visitor) {
        res.status(404).json({ message: "Visitor not found" });
        return;
      }
      res.json(visitor);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ✅ PUT update visitor
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const updated = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// ✅ DELETE remove visitor
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  await Visitor.findByIdAndDelete(req.params.id);
  res.json({ message: "Visitor deleted" });
});

//
// ✅ NEW ROUTES FOR GUARD INTERACTIONS
//

// PATCH approve a visitor (by guard)
router.patch(
  "/approve/:id",
  authenticate,
  authorizeRoles("guard"),
  async (req: AuthRequest, res: Response) => {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      res.status(404).json({ message: "Visitor not found" });
      return;
    }

    visitor.status = "checked-in";
    visitor.approvedBy = req.user?.name || "Guard";
    visitor.approvalTime = new Date();
    visitor.updatedAt = new Date();

    await visitor.save();
    res.json(visitor);
  }
);

// PATCH reject a visitor (by guard)
router.patch(
  "/reject/:id",
  authenticate,
  authorizeRoles("guard"),
  async (req: AuthRequest, res: Response) => {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      res.status(404).json({ message: "Visitor not found" });
      return;
    }

    visitor.status = "rejected";
    visitor.rejectionReason = req.body.reason || "No reason provided";
    visitor.approvedBy = req.user?.name || "Guard";
    visitor.approvalTime = new Date();
    visitor.updatedAt = new Date();

    await visitor.save();
    res.json(visitor);
  }
);

// PATCH check-out visitor
router.patch(
  "/checkout/:id",
  authenticate,
  authorizeRoles("guard"),
  async (req: AuthRequest, res: Response) => {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      res.status(404).json({ message: "Visitor not found" });
      return;
    }

    visitor.status = "checked-out";
    visitor.checkOutTime = new Date();
    visitor.updatedAt = new Date();

    await visitor.save();
    res.json(visitor);
  }
);

export default router;
