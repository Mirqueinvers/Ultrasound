import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";
import { normalizeSearchText } from "../utils/search.js";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(1, "Логин обязателен"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  name: z.string().min(1, "Имя обязательно"),
  organization: z.string().optional().nullable(),
});

const loginSchema = z.object({
  username: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

const profileSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  username: z.string().min(1, "Логин обязателен"),
  organization: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
});

function publicUser(user: {
  id: string;
  username: string;
  name: string;
  organization: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    organization: user.organization,
    created_at: user.createdAt,
    last_login: user.lastLogin,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });
    if (existing) {
      res.status(400).json({ error: "Пользователь с таким логином уже существует" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        organization: data.organization || null,
        searchText: data.name ? normalizeSearchText(data.name) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Регистрация успешна",
      userId: user.id,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username: data.username } });
    if (!user) {
      res.status(400).json({ error: "Неверный логин или пароль" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: "Неверный логин или пароль" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      message: "Вход выполнен успешно",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

router.patch("/profile", authMiddleware, async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!existingUser) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const userWithSameUsername = await prisma.user.findFirst({
      where: { username: data.username, id: { not: req.userId! } },
      select: { id: true },
    });
    if (userWithSameUsername) {
      res.status(400).json({ error: "Этот логин уже используется другим пользователем" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: data.name,
        username: data.username,
        organization: data.organization || null,
        searchText: data.name ? normalizeSearchText(data.name) : null,
      },
    });

    res.json({ success: true, message: "Профиль успешно обновлён", user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.patch("/password", authMiddleware, async (req, res, next) => {
  try {
    const data = passwordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: "Неверный текущий пароль" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Пароль успешно изменён" });
  } catch (err) {
    next(err);
  }
});

export default router;