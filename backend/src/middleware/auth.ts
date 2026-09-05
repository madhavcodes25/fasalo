/**
 * Authentication middleware.
 *
 * Verifies a JWT bearer token from the `Authorization` header, validates it
 * against the store, and attaches the authenticated user to `req.user`.
 *
 * Demo-only: token signing uses a single shared secret from JWT_SECRET
 * (default `dev-insecure-change-me`). In production this should be rotated and
 * managed via a secrets manager.
 */
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { type UserRole, store } from "../db/store.js";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: UserRole; name: string };
}

const JWT_EXPIRES_IN = "7d";

export function signToken(user: { id: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function requireAuth(allowedRoles?: UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authorization header missing" });
      return;
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string; role: UserRole; name: string };
      const user = store.findUserById(payload.id);
      if (!user) {
        res.status(401).json({ error: "Invalid user" });
        return;
      }
      if (user.kycVerified === false) {
        // NOTE: KYC gating is a Phase 2 concern; for Phase 1 we keep this optional.
        // We do NOT block here to keep the demo flow simple.
      }
      req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      if (allowedRoles && !allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient role" });
        return;
      }
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

/** Convenience: requireAuth restricted to farmer/FPO roles. */
export const requireFarmer = () => requireAuth(["farmer", "fpo"]);
/** Convenience: requireAuth restricted to consumer/bulk-buyer roles. */
export const requireBuyer = () => requireAuth(["consumer", "bulk_buyer"]);
