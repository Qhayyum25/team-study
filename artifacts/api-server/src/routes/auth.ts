import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  const user = users[0];
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session.userId = user.id;
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/auth/logout", (req, res) => {
  req.session.userId = undefined;
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = users[0];
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
