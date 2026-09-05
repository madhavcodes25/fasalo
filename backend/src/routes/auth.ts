import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { store } from "../db/store.js";
import { signToken, requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import type { UserRole } from "../models/index.js";

const router = Router();
const VALID_ROLES: UserRole[] = ["farmer", "fpo", "consumer", "bulk_buyer"];

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function publicUser(u: { id: string; name: string; email: string; role: UserRole; phone?: string; farmSizeAcres?: number; village?: string; kycVerified?: boolean; createdAt: string; updatedAt: string }) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    farmSizeAcres: u.farmSizeAcres,
    village: u.village,
    kycVerified: u.kycVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

/** POST /api/auth/signup — register a new farmer/consumer/buyer */
router.post(
  "/signup",
  async (req: Request, res: Response) => {
    const { name, email, password, role, ...rest } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = store.createUser({ name, email, passwordHash, role, ...rest });
      const token = signToken(user);
      res.status(201).json({ token, user: publicUser(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not create user";
      res.status(409).json({ error: message });
    }
  },
);

/** POST /api/auth/login — authenticate and receive a JWT */
router.post(
  "/login",
  async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  },
);

/** GET /api/auth/me — authenticated user profile */
router.get("/me", requireAuth(), (req: AuthenticatedRequest, res) => {
  const user = store.findUserById(req.user!.id);
  if (!user) return res.status(401).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;
