import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const uploadDir = path.resolve(process.cwd(), "backend", "uploads");
const upload = multer({ dest: uploadDir });

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

const modelMap = {
  profiles: "user",
  topics: "topic",
  quizzes: "quiz",
  quiz_questions: "quizQuestion",
  quiz_attempts: "quizAttempt",
  challenges: "challenge",
  challenge_progress: "challengeProgress",
  badges: "badge",
  user_badges: "userBadge",
  eco_actions: "ecoAction",
  products: "product",
  orders: "order",
  order_items: "orderItem",
};

const toClientUser = (user) => ({
  id: user.id,
  username: user.username,
  full_name: user.fullName,
  email: user.email,
  role: user.role.toLowerCase(),
  avatar_url: user.avatarUrl,
  total_points: user.totalPoints,
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});

const toCamel = (value) => {
  if (Array.isArray(value)) return value.map(toCamel);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      toCamel(val),
    ]),
  );
};

const toSnake = (value) => {
  if (Array.isArray(value)) return value.map(toSnake);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
      toSnake(val),
    ]),
  );
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  return next();
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role = "student", full_name } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      fullName: full_name ?? null,
      role: String(role).toUpperCase(),
    },
  });
  return res.status(201).json({ user: toClientUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token, user: toClientUser(user) });
});

app.get("/api/auth/me", auth, async (req, res) => {
  return res.json({ user: toClientUser(req.user) });
});

app.post("/api/uploads/eco-actions", auth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Missing file" });
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url: fileUrl });
});

app.get("/api/reports", auth, async (_req, res) => {
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);
  return res.json({ users, products, orders });
});

app.get("/api/users", auth, requireRole("ADMIN"), async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(users.map(toClientUser));
});

app.get("/api/:resource", auth, async (req, res) => {
  const delegateName = modelMap[req.params.resource];
  if (!delegateName) return res.status(404).json({ message: "Unknown resource" });
  const data = await prisma[delegateName].findMany();
  if (delegateName === "user") return res.json(data.map(toClientUser));
  return res.json(toSnake(data));
});

app.get("/api/:resource/:id", auth, async (req, res) => {
  const delegateName = modelMap[req.params.resource];
  if (!delegateName) return res.status(404).json({ message: "Unknown resource" });
  const data = await prisma[delegateName].findUnique({ where: { id: req.params.id } });
  if (!data) return res.status(404).json({ message: "Not found" });
  if (delegateName === "user") return res.json(toClientUser(data));
  return res.json(toSnake(data));
});

app.post("/api/:resource", auth, async (req, res) => {
  const delegateName = modelMap[req.params.resource];
  if (!delegateName) return res.status(404).json({ message: "Unknown resource" });
  const data = await prisma[delegateName].create({ data: toCamel(req.body) });
  if (delegateName === "user") return res.status(201).json(toClientUser(data));
  return res.status(201).json(toSnake(data));
});

app.put("/api/:resource/:id", auth, async (req, res) => {
  const delegateName = modelMap[req.params.resource];
  if (!delegateName) return res.status(404).json({ message: "Unknown resource" });
  const data = await prisma[delegateName].update({ where: { id: req.params.id }, data: toCamel(req.body) });
  if (delegateName === "user") return res.json(toClientUser(data));
  return res.json(toSnake(data));
});

app.delete("/api/:resource/:id", auth, async (req, res) => {
  const delegateName = modelMap[req.params.resource];
  if (!delegateName) return res.status(404).json({ message: "Unknown resource" });
  await prisma[delegateName].delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

app.listen(PORT, () => {
  // biome-ignore lint/suspicious/noConsole: backend startup log
  console.log(`Backend running on http://localhost:${PORT}`);
});
