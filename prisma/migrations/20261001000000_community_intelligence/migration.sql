-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('HIDDEN_PLACE', 'LOCAL_BUSINESS', 'RESTAURANT', 'PHOTO_SPOT', 'BEST_TIME', 'CROWD_TIP', 'TRAVEL_TIP', 'LOCAL_SPECIALTY', 'TAKE_HOME', 'EXPERIENCE', 'ALTERNATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'TEXT', 'EXTERNAL_REFERENCE');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('AGREE', 'USEFUL', 'CONFIRM');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INCORRECT', 'OUTDATED', 'DUPLICATE', 'SPAM', 'MISLEADING', 'INAPPROPRIATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateTable
CREATE TABLE "community_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "place_id" TEXT,
    "destination_id" TEXT,
    "type" "SubmissionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_evidence" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "source" TEXT,
    "content" TEXT,
    "media_url" TEXT,
    "external_reference" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_supports" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "SupportType" NOT NULL DEFAULT 'USEFUL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_reports" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "submission_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_submissions_user_id_idx" ON "community_submissions"("user_id");

-- CreateIndex
CREATE INDEX "community_submissions_place_id_idx" ON "community_submissions"("place_id");

-- CreateIndex
CREATE INDEX "community_submissions_destination_id_idx" ON "community_submissions"("destination_id");

-- CreateIndex
CREATE INDEX "community_submissions_type_idx" ON "community_submissions"("type");

-- CreateIndex
CREATE INDEX "community_submissions_status_idx" ON "community_submissions"("status");

-- CreateIndex
CREATE INDEX "community_submissions_created_at_idx" ON "community_submissions"("created_at");

-- CreateIndex
CREATE INDEX "submission_evidence_submission_id_idx" ON "submission_evidence"("submission_id");

-- CreateIndex
CREATE INDEX "submission_evidence_type_idx" ON "submission_evidence"("type");

-- CreateIndex
CREATE UNIQUE INDEX "submission_supports_submission_id_user_id_type_key" ON "submission_supports"("submission_id", "user_id", "type");

-- CreateIndex
CREATE INDEX "submission_supports_submission_id_idx" ON "submission_supports"("submission_id");

-- CreateIndex
CREATE INDEX "submission_supports_user_id_idx" ON "submission_supports"("user_id");

-- CreateIndex
CREATE INDEX "submission_reports_submission_id_idx" ON "submission_reports"("submission_id");

-- CreateIndex
CREATE INDEX "submission_reports_user_id_idx" ON "submission_reports"("user_id");

-- CreateIndex
CREATE INDEX "submission_reports_status_idx" ON "submission_reports"("status");

-- AddForeignKey
ALTER TABLE "community_submissions" ADD CONSTRAINT "community_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_submissions" ADD CONSTRAINT "community_submissions_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_submissions" ADD CONSTRAINT "community_submissions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_evidence" ADD CONSTRAINT "submission_evidence_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "community_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_supports" ADD CONSTRAINT "submission_supports_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "community_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_supports" ADD CONSTRAINT "submission_supports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_reports" ADD CONSTRAINT "submission_reports_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "community_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_reports" ADD CONSTRAINT "submission_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
