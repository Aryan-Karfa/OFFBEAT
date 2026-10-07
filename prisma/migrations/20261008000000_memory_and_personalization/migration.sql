-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('TASTE', 'EXPERIENCE', 'TIME_PREFERENCE', 'PACE', 'CATEGORY_AFFINITY', 'DESTINATION_AFFINITY', 'PLACE_AFFINITY', 'ALTERNATIVE_PREFERENCE', 'TAKE_HOME_PREFERENCE', 'ITINERARY_PREFERENCE');

-- CreateEnum
CREATE TYPE "MemorySource" AS ENUM ('EXPLICIT', 'INFERRED', 'INTERACTION', 'ITINERARY', 'ALTERNATIVE', 'TAKE_HOME', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MemoryConfidence" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "MemoryEventType" AS ENUM ('TASTE_SELECTED', 'EXPERIENCE_SELECTED', 'PLACE_VIEWED', 'PLACE_EXPLORED', 'ALTERNATIVE_SELECTED', 'ITINERARY_CREATED', 'ITINERARY_STOP_KEPT', 'ITINERARY_STOP_SWAPPED', 'TAKE_HOME_VIEWED', 'TAKE_HOME_SELECTED', 'CATEGORY_SELECTED');

-- CreateTable
CREATE TABLE "traveler_memories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "MemoryType" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "source" "MemorySource" NOT NULL DEFAULT 'INFERRED',
    "confidence" "MemoryConfidence" NOT NULL DEFAULT 'MODERATE',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "evidence_count" INTEGER NOT NULL DEFAULT 1,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "user_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "traveler_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "memory_id" TEXT,
    "event_type" "MemoryEventType" NOT NULL,
    "subject_type" TEXT,
    "subject_id" TEXT,
    "signal_key" TEXT NOT NULL,
    "signal_value" TEXT NOT NULL,
    "weight_delta" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveler_memory_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "memory_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traveler_memory_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "traveler_memories_user_id_type_key_key" ON "traveler_memories"("user_id", "type", "key");

-- CreateIndex
CREATE INDEX "traveler_memories_user_id_idx" ON "traveler_memories"("user_id");

-- CreateIndex
CREATE INDEX "traveler_memories_user_id_type_idx" ON "traveler_memories"("user_id", "type");

-- CreateIndex
CREATE INDEX "traveler_memories_user_id_user_visible_idx" ON "traveler_memories"("user_id", "user_visible");

-- CreateIndex
CREATE INDEX "memory_events_user_id_idx" ON "memory_events"("user_id");

-- CreateIndex
CREATE INDEX "memory_events_event_type_idx" ON "memory_events"("event_type");

-- CreateIndex
CREATE INDEX "memory_events_created_at_idx" ON "memory_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "traveler_memory_settings_user_id_key" ON "traveler_memory_settings"("user_id");

-- CreateIndex
CREATE INDEX "traveler_memory_settings_user_id_idx" ON "traveler_memory_settings"("user_id");

-- AddForeignKey
ALTER TABLE "traveler_memories" ADD CONSTRAINT "traveler_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_events" ADD CONSTRAINT "memory_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_events" ADD CONSTRAINT "memory_events_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "traveler_memories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler_memory_settings" ADD CONSTRAINT "traveler_memory_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
