// File: /server/Routes/Auth.ts
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      assignedSites: user.assignedSites,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
  res.json({ token, user });
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
