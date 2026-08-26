import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  deployToken: process.env.DEPLOY_TOKEN || "",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://ultrasound:ultrasound_password@localhost:5432/ultrasound",
};

export function requireJwtSecret(): string {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me-to-a-long-random-string") {
    throw new Error(
      'JWT_SECRET не задан. Скопируйте .env.example в .env и задайте секрет.'
    );
  }
  return process.env.JWT_SECRET;
}