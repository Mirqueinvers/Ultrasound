-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('oms', 'paid');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "search_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "date_of_birth" TEXT NOT NULL,
    "search_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researches" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "research_date" TEXT NOT NULL,
    "payment_type" "payment_type" NOT NULL,
    "organization" TEXT,
    "doctor_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "researches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_studies" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "study_type" TEXT NOT NULL,
    "study_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_block_overrides" (
    "research_id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "block_text" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_block_overrides_pkey" PRIMARY KEY ("research_id","block_id")
);

-- CreateTable
CREATE TABLE "medison_mappings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "target_study_type" TEXT NOT NULL,
    "target_field" TEXT NOT NULL,
    "transform" TEXT NOT NULL DEFAULT 'number->string',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medison_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_date" TEXT NOT NULL,
    "studies" JSONB NOT NULL,
    "department" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "max_patients_per_day" INTEGER NOT NULL DEFAULT 15,
    "work_days" JSONB NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "patients_last_name_first_name_middle_name_idx" ON "patients"("last_name", "first_name", "middle_name");

-- CreateIndex
CREATE INDEX "patients_date_of_birth_idx" ON "patients"("date_of_birth");

-- CreateIndex
CREATE INDEX "patients_search_text_idx" ON "patients"("search_text");

-- CreateIndex
CREATE INDEX "researches_patient_id_idx" ON "researches"("patient_id");

-- CreateIndex
CREATE INDEX "researches_research_date_idx" ON "researches"("research_date");

-- CreateIndex
CREATE INDEX "research_studies_research_id_idx" ON "research_studies"("research_id");

-- CreateIndex
CREATE INDEX "research_studies_study_type_idx" ON "research_studies"("study_type");

-- CreateIndex
CREATE INDEX "medison_mappings_user_id_idx" ON "medison_mappings"("user_id");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_idx" ON "appointments"("appointment_date");

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_studies" ADD CONSTRAINT "research_studies_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_block_overrides" ADD CONSTRAINT "print_block_overrides_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medison_mappings" ADD CONSTRAINT "medison_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateFunction: нормализация текста для поиска (ё→е, нижний регистр, только буквы/цифры)
CREATE FUNCTION normalize_text(input text) RETURNS text AS $$
  SELECT lower(regexp_replace(translate($1, 'ёЁ', 'еЕ'), '[^0-9а-я]', '', 'g'));
$$ LANGUAGE SQL IMMUTABLE;
