-- CreateEnum
CREATE TYPE "TimeObservationType" AS ENUM ('OPENING_TIME', 'CLOSING_TIME', 'BEST_TIME', 'SUNRISE_TIME', 'SUNSET_TIME', 'LOW_CROWD_TIME', 'COMMUNITY_RECOMMENDED_TIME');

-- CreateEnum
CREATE TYPE "ObservationSource" AS ENUM ('EXTERNAL', 'COMMUNITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('WEEKDAY', 'WEEKEND', 'ANY');

-- CreateEnum
CREATE TYPE "CrowdLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'MONSOON', 'AUTUMN', 'WINTER', 'ANY', 'UNKNOWN');

-- CreateTable
CREATE TABLE "time_observations" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "TimeObservationType" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "day_type" "DayType" NOT NULL DEFAULT 'ANY',
    "observation" TEXT,
    "source" "ObservationSource" NOT NULL DEFAULT 'COMMUNITY',
    "confidence" DOUBLE PRECISION DEFAULT 0.8,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "time_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_observations" (
    "id" TEXT NOT NULL,
    "place_id" TEXT,
    "destination_id" TEXT,
    "user_id" TEXT,
    "level" "CrowdLevel" NOT NULL,
    "time_start" TEXT,
    "time_end" TEXT,
    "day_type" "DayType" NOT NULL DEFAULT 'ANY',
    "season" "Season" NOT NULL DEFAULT 'ANY',
    "observation" TEXT,
    "source" "ObservationSource" NOT NULL DEFAULT 'COMMUNITY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "crowd_observations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_observations_place_id_idx" ON "time_observations"("place_id");
CREATE INDEX "time_observations_type_idx" ON "time_observations"("type");
CREATE INDEX "time_observations_day_type_idx" ON "time_observations"("day_type");
CREATE INDEX "time_observations_expires_at_idx" ON "time_observations"("expires_at");

-- CreateIndex
CREATE INDEX "crowd_observations_place_id_idx" ON "crowd_observations"("place_id");
CREATE INDEX "crowd_observations_destination_id_idx" ON "crowd_observations"("destination_id");
CREATE INDEX "crowd_observations_level_idx" ON "crowd_observations"("level");
CREATE INDEX "crowd_observations_day_type_idx" ON "crowd_observations"("day_type");
CREATE INDEX "crowd_observations_expires_at_idx" ON "crowd_observations"("expires_at");

-- AddForeignKey
ALTER TABLE "time_observations" ADD CONSTRAINT "time_observations_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_observations" ADD CONSTRAINT "time_observations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowd_observations" ADD CONSTRAINT "crowd_observations_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crowd_observations" ADD CONSTRAINT "crowd_observations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crowd_observations" ADD CONSTRAINT "crowd_observations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
