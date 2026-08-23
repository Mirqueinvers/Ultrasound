import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const upsertSchema = z.object({
  userId: z.string().min(1),
  measurementId: z.string().min(1),
  targetStudyType: z.string().min(1),
  targetField: z.string().min(1),
  transform: z.string().default("number->string"),
  isEnabled: z.boolean().default(true),
});

function serializeMapping(m: {
  id: string;
  userId: string;
  measurementId: string;
  targetStudyType: string;
  targetField: string;
  transform: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: m.id,
    user_id: m.userId,
    measurement_id: m.measurementId,
    target_study_type: m.targetStudyType,
    target_field: m.targetField,
    transform: m.transform,
    is_enabled: m.isEnabled ? 1 : 0,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

type MappingInput = {
  userId: string;
  measurementId: string;
  targetStudyType: string;
  targetField: string;
  transform?: string;
};

function getDefaultMappings(userId: string): MappingInput[] {
  const defaults: Array<Omit<MappingInput, "userId">> = [
    // ОБП
    { measurementId: "Rad_Liver_L", targetStudyType: "obp", targetField: "liver.rightLobeAP" },
    { measurementId: "Rad_Liver_W", targetStudyType: "obp", targetField: "liver.leftLobeAP" },
    { measurementId: "Rad_GB_L", targetStudyType: "obp", targetField: "gallbladder.length" },
    { measurementId: "Rad_GB_W", targetStudyType: "obp", targetField: "gallbladder.width" },
    { measurementId: "Rad_GB_GBW", targetStudyType: "obp", targetField: "gallbladder.wallThickness" },
    { measurementId: "Rad_GB_CBD", targetStudyType: "obp", targetField: "gallbladder.commonBileDuct" },
    { measurementId: "Rad_Pancreas_PancHead", targetStudyType: "obp", targetField: "pancreas.head" },
    { measurementId: "Rad_Pancreas_PancBody", targetStudyType: "obp", targetField: "pancreas.body" },
    { measurementId: "Rad_Pancreas_PancTail", targetStudyType: "obp", targetField: "pancreas.tail" },
    { measurementId: "Rad_Spleen_L", targetStudyType: "obp", targetField: "spleen.length" },
    { measurementId: "Rad_Spleen_W", targetStudyType: "obp", targetField: "spleen.width" },
    { measurementId: "Rad_MPortalV_VDist", targetStudyType: "obp", targetField: "portalVein.diameter" },
    // Почки
    { measurementId: "Rad_Kidney_LL", targetStudyType: "kidneys", targetField: "leftKidney.length" },
    { measurementId: "Rad_Kidney_LW", targetStudyType: "kidneys", targetField: "leftKidney.width" },
    { measurementId: "Rad_Kidney_LH", targetStudyType: "kidneys", targetField: "leftKidney.parenchymaSize" },
    { measurementId: "Rad_Kidney_RL", targetStudyType: "kidneys", targetField: "rightKidney.length" },
    { measurementId: "Rad_Kidney_RW", targetStudyType: "kidneys", targetField: "rightKidney.width" },
    { measurementId: "Rad_Kidney_RH", targetStudyType: "kidneys", targetField: "rightKidney.parenchymaSize" },
    // Гинекология
    { measurementId: "GYN_UTERUS_LENGTH", targetStudyType: "gyn", targetField: "uterus.length" },
    { measurementId: "GYN_UTERUS_HEIGHT", targetStudyType: "gyn", targetField: "uterus.height" },
    { measurementId: "GYN_UTERUS_WIDTH", targetStudyType: "gyn", targetField: "uterus.width" },
    { measurementId: "GYN_UTERUS_VOL", targetStudyType: "gyn", targetField: "uterus.volume" },
    { measurementId: "GYN_UTERUS_EndoTh", targetStudyType: "gyn", targetField: "uterus.endometriumThickness" },
    { measurementId: "GYN_UTERUS_CervixW", targetStudyType: "gyn", targetField: "uterus.cervixWidth" },
    { measurementId: "GYN_RtOvary_LENGTH", targetStudyType: "gyn", targetField: "rightOvary.length" },
    { measurementId: "GYN_RtOvary_WIDTH", targetStudyType: "gyn", targetField: "rightOvary.width" },
    { measurementId: "GYN_LtOvary_LENGTH", targetStudyType: "gyn", targetField: "leftOvary.length" },
    { measurementId: "GYN_LtOvary_WIDTH", targetStudyType: "gyn", targetField: "leftOvary.width" },
    // Урология
    { measurementId: "Uro_Bladder_Length", targetStudyType: "uro", targetField: "bladder.length" },
    { measurementId: "Uro_Bladder_Height", targetStudyType: "uro", targetField: "bladder.height" },
    { measurementId: "Uro_Bladder_Width", targetStudyType: "uro", targetField: "bladder.width" },
    { measurementId: "Uro_Bladder_Volume", targetStudyType: "uro", targetField: "bladder.volume" },
    { measurementId: "Uro_ResVol_PostLength", targetStudyType: "uro", targetField: "bladder.residualLength" },
    { measurementId: "Uro_ResVol_PostHeight", targetStudyType: "uro", targetField: "bladder.residualHeight" },
    { measurementId: "Uro_ResVol_PostWidth", targetStudyType: "uro", targetField: "bladder.residualWidth" },
    { measurementId: "Uro_ResVol_PostVolume", targetStudyType: "uro", targetField: "bladder.residualVolume" },
    // Простата
    { measurementId: "Uro_Prostate_Length", targetStudyType: "uro", targetField: "prostate.length" },
    { measurementId: "Uro_Prostate_Height", targetStudyType: "uro", targetField: "prostate.height" },
    { measurementId: "Uro_Prostate_Width", targetStudyType: "uro", targetField: "prostate.width" },
    { measurementId: "Uro_Prostate_Volume", targetStudyType: "uro", targetField: "prostate.volume" },
    { measurementId: "Uro_TZ_Length", targetStudyType: "uro", targetField: "prostate.tzLength" },
    { measurementId: "Uro_PREDPSA_PREDPSA", targetStudyType: "uro", targetField: "prostate.predictedPSA" },
    // Щитовидка
    { measurementId: "Thyroid_Lobe_RL", targetStudyType: "thyroid", targetField: "rightLobe.length" },
    { measurementId: "Thyroid_Lobe_RH", targetStudyType: "thyroid", targetField: "rightLobe.height" },
    { measurementId: "Thyroid_Lobe_RW", targetStudyType: "thyroid", targetField: "rightLobe.width" },
    { measurementId: "Thyroid_Lobe_RVol", targetStudyType: "thyroid", targetField: "rightLobe.volume" },
    { measurementId: "Thyroid_Lobe_LL", targetStudyType: "thyroid", targetField: "leftLobe.length" },
    { measurementId: "Thyroid_Lobe_LH", targetStudyType: "thyroid", targetField: "leftLobe.height" },
    { measurementId: "Thyroid_Lobe_LW", targetStudyType: "thyroid", targetField: "leftLobe.width" },
    { measurementId: "Thyroid_Lobe_LVol", targetStudyType: "thyroid", targetField: "leftLobe.volume" },
    { measurementId: "Thyroid_Lobe_Isthmus", targetStudyType: "thyroid", targetField: "isthmusSize" },
  ];

  return defaults.map((d) => ({ ...d, userId }));
}

// GET /api/medison-mappings?userId=
router.get("/", async (req, res, next) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : "";
    if (!userId) {
      res.status(400).json({ error: "userId обязателен" });
      return;
    }

    const mappings = await prisma.medisonMapping.findMany({
      where: { userId },
      orderBy: [{ targetStudyType: "asc" }, { measurementId: "asc" }],
    });

    res.json(mappings.map(serializeMapping));
  } catch (err) {
    next(err);
  }
});

// POST /api/medison-mappings — upsert
router.post("/", async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);

    const existing = await prisma.medisonMapping.findFirst({
      where: {
        userId: data.userId,
        measurementId: data.measurementId,
        targetStudyType: data.targetStudyType,
      },
    });

    let mapping;
    if (existing) {
      mapping = await prisma.medisonMapping.update({
        where: { id: existing.id },
        data: {
          targetField: data.targetField,
          transform: data.transform,
          isEnabled: data.isEnabled,
        },
      });
    } else {
      mapping = await prisma.medisonMapping.create({
        data: {
          userId: data.userId,
          measurementId: data.measurementId,
          targetStudyType: data.targetStudyType,
          targetField: data.targetField,
          transform: data.transform,
          isEnabled: data.isEnabled,
        },
      });
    }

    res.status(existing ? 200 : 201).json({ success: true, id: mapping.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/medison-mappings/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.medisonMapping.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Маппинг не найден" });
      return;
    }
    await prisma.medisonMapping.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/medison-mappings/reset — сброс дефолтов
router.post("/reset", async (req, res, next) => {
  try {
    const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
    if (!userId) {
      res.status(400).json({ error: "userId обязателен" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const defaults = getDefaultMappings(userId);

    await prisma.$transaction(async (tx) => {
      await tx.medisonMapping.deleteMany({ where: { userId } });
      await tx.medisonMapping.createMany({
        data: defaults.map((d) => ({
          ...d,
          transform: "number->string",
          isEnabled: true,
        })),
      });
    });

    res.json({ success: true, inserted: defaults.length });
  } catch (err) {
    next(err);
  }
});

export default router;