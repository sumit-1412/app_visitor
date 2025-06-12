// File: /server/routes/hosts.ts
import express, { Request, Response, Router } from "express";
import Host from "../models/Host";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router: Router = express.Router();

// GET all hosts for a site
router.get(
  "/:siteId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const hosts = await Host.find({ site: req.params.siteId });
    res.json(hosts);
  }
);

// POST create new host
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const host = await Host.create(req.body);
    res.status(201).json(host);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// PUT update host
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const updated = await Host.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// DELETE host
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  await Host.findByIdAndDelete(req.params.id);
  res.json({ message: "Host deleted" });
});

export default router;
