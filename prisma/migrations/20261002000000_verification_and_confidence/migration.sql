-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'COMMUNITY_SUPPORTED', 'COMMUNITY_VERIFIED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('COMMUNITY_SIGNAL', 'EVIDENCE_REVIEW', 'EXTERNAL_CORROBORATION', 'DETERMINISTIC_RULES', 'MANUAL_REVIEW');

-- CreateTable
CREATE TABLE "verification_records" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "method" "VerificationMethod" NOT NULL DEFAULT 'DETERMINISTIC_RULES',
    "reviewer" TEXT,
    "reasoning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confidence_records" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "evidence_count" INTEGER NOT NULL,
    "support_count" INTEGER NOT NULL,
    "contradiction_count" INTEGER NOT NULL,
    "external_corroboration" BOOLEAN NOT NULL DEFAULT false,
    "reasoning" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT 'confidence-v1',

    CONSTRAINT "confidence_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_records_submission_id_idx" ON "verification_records"("submission_id");

-- CreateIndex
CREATE INDEX "verification_records_status_idx" ON "verification_records"("status");

-- CreateIndex
CREATE INDEX "verification_records_method_idx" ON "verification_records"("method");

-- CreateIndex
CREATE INDEX "confidence_records_submission_id_idx" ON "confidence_records"("submission_id");

-- CreateIndex
CREATE INDEX "confidence_records_calculated_at_idx" ON "confidence_records"("calculated_at");

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "community_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidence_records" ADD CONSTRAINT "confidence_records_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "community_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
