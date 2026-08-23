import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const router = Router();

interface StatisticsData {
  totalPatients: number;
  totalResearches: number;
  totalStudies: number;
  researchesInPeriod: number;
  patientsInPeriod: number;
  studiesInPeriod: number;
  paymentStats: { oms: number; paid: number };
  studiesByType: Record<string, number>;
  monthlyResearches: { month: string; count: number }[];
  recentActivity: { date: string; patientName: string; studyType: string }[];
  doctorsStats: { doctorName: string; patientCount: number; researchCount: number }[];
  paidStudiesDetail: { studyType: string; count: number }[];
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long" });
}

function formatStudyType(studyType: string): string {
  return studyType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// GET /api/statistics?from=&to=&doctor=
router.get("/", async (req, res, next) => {
  try {
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const doctor = typeof req.query.doctor === "string" ? req.query.doctor : undefined;

    const whereResearch: Prisma.ResearchWhereInput = {};
    if (from && to) {
      whereResearch.researchDate = { gte: from, lte: to };
    }
    if (doctor) {
      whereResearch.doctorName = doctor;
    }

    const [
      totalPatients,
      totalResearches,
      totalStudies,
      researchesInPeriod,
      patientsInPeriod,
      studiesInPeriod,
      omsStudies,
      paidStudies,
      studiesByTypeRows,
      recentActivities,
      doctorsStatsRows,
      paidStudiesDetailRows,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.research.count(),
      prisma.researchStudy.count(),
      from && to ? prisma.research.count({ where: whereResearch }) : 0,
      from && to
        ? prisma.research
            .groupBy({ by: ["patientId"], where: whereResearch })
            .then((rows) => rows.length)
        : 0,
      from && to
        ? prisma.researchStudy.count({ where: { research: whereResearch } })
        : 0,
      prisma.researchStudy.count({
        where: { research: { ...whereResearch, paymentType: "oms" } },
      }),
      prisma.researchStudy.count({
        where: { research: { ...whereResearch, paymentType: "paid" } },
      }),
      prisma.researchStudy.groupBy({
        by: ["studyType"],
        where: { research: { ...whereResearch, paymentType: "oms" } },
        _count: { studyType: true },
      }),
      prisma.research.findMany({
        where: whereResearch,
        select: {
          researchDate: true,
          patient: { select: { lastName: true, firstName: true, middleName: true } },
          studies: { select: { studyType: true } },
        },
        orderBy: [{ researchDate: "desc" }, { createdAt: "desc" }],
        take: 20,
      }),
      prisma.research.groupBy({
        by: ["doctorName"],
        where: whereResearch,
        _count: { _all: true },
      }),
      prisma.researchStudy.groupBy({
        by: ["studyType"],
        where: { research: { ...whereResearch, paymentType: "paid" } },
        _count: { studyType: true },
      }),
    ]);

    // Группировка исследований по месяцам (strftime('%Y-%m') → slice)
    const rawMonthly = await prisma.research.groupBy({
      by: ["researchDate"],
      _count: { _all: true },
    });
    const monthMap = new Map<string, number>();
    for (const r of rawMonthly) {
      const month = r.researchDate.slice(0, 7); // YYYY-MM
      monthMap.set(month, (monthMap.get(month) || 0) + r._count._all);
    }
    const monthlyResearches: { month: string; count: number }[] = [];
    for (const [month, count] of monthMap) {
      monthlyResearches.push({ month: formatMonth(month), count });
    }
    monthlyResearches.sort((a, b) => a.month.localeCompare(b.month, "ru"));

    // Недавняя активность (как в Desktop: исследования + пациенты)
    const recentActivity: StatisticsData["recentActivity"] = [];
    for (const r of recentActivities) {
      for (const study of r.studies) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.researchDate)) continue;
        recentActivity.push({
          date: r.researchDate,
          patientName: `${r.patient.lastName} ${r.patient.firstName} ${r.patient.middleName || ""}`.trim(),
          studyType: formatStudyType(study.studyType),
        });
      }
    }
    recentActivity.sort((a, b) => b.date.localeCompare(a.date));
    recentActivity.splice(20);

    const studiesByType: Record<string, number> = {};
    for (const row of studiesByTypeRows) {
      studiesByType[row.studyType] = row._count.studyType;
    }

    const doctorsStats: StatisticsData["doctorsStats"] = doctorsStatsRows
      .map((row) => ({
        doctorName: row.doctorName || "Не указан",
        researchCount: row._count._all,
        patientCount: 0,
      }))
      .sort((a, b) => b.researchCount - a.researchCount);

    // Точный patientCount для каждого врача
    for (const stat of doctorsStats) {
      const doctorRows = await prisma.research.groupBy({
        by: ["patientId"],
        where: {
          ...whereResearch,
          doctorName: stat.doctorName === "Не указан" ? null : stat.doctorName,
        },
      });
      stat.patientCount = doctorRows.length;
    }

    const paidStudiesDetail: StatisticsData["paidStudiesDetail"] = paidStudiesDetailRows
      .map((row) => ({
        studyType: formatStudyType(row.studyType),
        count: row._count.studyType,
      }))
      .sort((a, b) => b.count - a.count);

    const data: StatisticsData = {
      totalPatients,
      totalResearches,
      totalStudies,
      researchesInPeriod,
      patientsInPeriod,
      studiesInPeriod,
      paymentStats: { oms: omsStudies, paid: paidStudies },
      studiesByType,
      monthlyResearches,
      recentActivity,
      doctorsStats,
      paidStudiesDetail,
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;