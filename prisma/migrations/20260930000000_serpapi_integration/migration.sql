-- CreateTable
CREATE TABLE "external_place_references" (
    "id" TEXT NOT NULL,
    "place_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'SERPAPI',
    "external_id" TEXT NOT NULL,
    "source_url" TEXT,
    "metadata" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_place_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_caches" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'SERPAPI',
    "query_hash" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_caches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_place_references_provider_external_id_key" ON "external_place_references"("provider", "external_id");

-- CreateIndex
CREATE INDEX "external_place_references_place_id_idx" ON "external_place_references"("place_id");

-- CreateIndex
CREATE INDEX "external_place_references_provider_idx" ON "external_place_references"("provider");

-- CreateIndex
CREATE INDEX "external_place_references_external_id_idx" ON "external_place_references"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "search_caches_query_hash_key" ON "search_caches"("query_hash");

-- CreateIndex
CREATE INDEX "search_caches_provider_idx" ON "search_caches"("provider");

-- CreateIndex
CREATE INDEX "search_caches_query_hash_idx" ON "search_caches"("query_hash");

-- CreateIndex
CREATE INDEX "search_caches_expires_at_idx" ON "search_caches"("expires_at");

-- AddForeignKey
ALTER TABLE "external_place_references" ADD CONSTRAINT "external_place_references_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
