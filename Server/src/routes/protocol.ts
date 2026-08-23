import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const overridesSchema = z.object({
  printOverrides: z.record(z.string()),
});

// GET /api/researches/:id/protocol — протокол по исследованию
router.get("/researches/:id/protocol", async (req, res, next) => {
  try {
    const research = await prisma.research.findUnique({
      where: { id: req.params.id },
      include: {
        studies: { orderBy: { createdAt: "asc" } },
        printOverrides: true,
      },
    });

    if (!research) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }

    const studies: Record<string, unknown> = {};
    for (const study of research.studies) {
      studies[study.studyType] = study.studyData;
    }

    const printOverrides: Record<string, string> = {};
    for (const o of research.printOverrides) {
      printOverrides[o.blockId] = o.blockText;
    }

    res.json({
      researchId: research.id,
      studies,
      printOverrides,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/researches/:id/protocol/overrides — сохранение шаблонов
router.put("/researches/:id/protocol/overrides", async (req, res, next) => {
  try {
    const data = overridesSchema.parse(req.body);

    const existing = await prisma.research.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }

    const entries = Object.entries(data.printOverrides)
      .filter(([blockId]) => blockId.trim())
      .map(([blockId, blockText]) => [blockId.trim(), typeof blockText === "string" ? blockText : String(blockText ?? "")] as const);

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.printBlockOverride.deleteMany({ where: { researchId: req.params.id } });

      for (const [blockId, blockText] of entries) {
        await tx.printBlockOverride.create({
          data: {
            researchId: req.params.id,
            blockId,
            blockText,
            updatedAt: now,
          },
        });
      }
    });

    res.json({ success: true, message: "Шаблоны протоколов успешно сохранены." });
  } catch (err) {
    next(err);
  }
});

export default router;