import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Некорректные данные",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Запись с такими данными уже существует" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Запись не найдена" });
      return;
    }
    res.status(400).json({ error: `Ошибка базы данных (${err.code})` });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
}