/**
 * Настройка тестовой среды.
 * Перед загрузкой приложения переключаем DATABASE_URL на тестовую БД.
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://ultrasound:ultrasound_password@localhost:5432/ultrasound_test";