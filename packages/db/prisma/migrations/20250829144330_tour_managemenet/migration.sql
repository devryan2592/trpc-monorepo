-- CreateEnum
CREATE TYPE "public"."TourType" AS ENUM ('BUDGET', 'STANDARD', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "public"."Meals" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "public"."destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT,
    "bestSeasonStart" TEXT,
    "bestSeasonEnd" TEXT,
    "languages" TEXT[],
    "thumbnailId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "destinationId" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tours" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "tour_type" "public"."TourType",
    "price" DECIMAL(10,2) NOT NULL,
    "offerPrice" DECIMAL(10,2),
    "currency" TEXT,
    "thumbnailId" TEXT,
    "highlights" TEXT[],
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "terms" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tour_cities" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "tour_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tour_destinations" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "tour_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attractions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "duration" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "offerPrice" DECIMAL(10,2),
    "thumbnailId" TEXT,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "terms" TEXT[],
    "cityId" TEXT NOT NULL,

    CONSTRAINT "attractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "attractionId" TEXT,
    "tourId" TEXT,
    "destinationId" TEXT,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."day_itinerary_items" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "meals" "public"."Meals"[],
    "duration" INTEGER,

    CONSTRAINT "day_itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "alt_text" TEXT,
    "keywords" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tourId" TEXT,
    "attractionId" TEXT,
    "dayItineraryItemId" TEXT,
    "destinationId" TEXT,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinations_name_key" ON "public"."destinations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "public"."destinations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_thumbnailId_key" ON "public"."destinations"("thumbnailId");

-- CreateIndex
CREATE UNIQUE INDEX "city_destination_name_unique" ON "public"."cities"("destinationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "city_destination_slug_unique" ON "public"."cities"("destinationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tours_name_key" ON "public"."tours"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tours_slug_key" ON "public"."tours"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tours_thumbnailId_key" ON "public"."tours"("thumbnailId");

-- CreateIndex
CREATE INDEX "tour_cities_tourId_cityId_idx" ON "public"."tour_cities"("tourId", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_city_unique" ON "public"."tour_cities"("tourId", "cityId");

-- CreateIndex
CREATE INDEX "tour_destinations_tourId_destinationId_idx" ON "public"."tour_destinations"("tourId", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_destination_unique" ON "public"."tour_destinations"("tourId", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "attractions_name_key" ON "public"."attractions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "attractions_slug_key" ON "public"."attractions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attractions_thumbnailId_key" ON "public"."attractions"("thumbnailId");

-- CreateIndex
CREATE INDEX "attractions_id_idx" ON "public"."attractions"("id");

-- CreateIndex
CREATE INDEX "day_itinerary_items_tourId_idx" ON "public"."day_itinerary_items"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "day_itinerary_items_tourId_dayNumber_key" ON "public"."day_itinerary_items"("tourId", "dayNumber");

-- AddForeignKey
ALTER TABLE "public"."destinations" ADD CONSTRAINT "destinations_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tours" ADD CONSTRAINT "tours_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_cities" ADD CONSTRAINT "tour_cities_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "public"."tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_cities" ADD CONSTRAINT "tour_cities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_destinations" ADD CONSTRAINT "tour_destinations_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "public"."tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tour_destinations" ADD CONSTRAINT "tour_destinations_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attractions" ADD CONSTRAINT "attractions_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "public"."tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."day_itinerary_items" ADD CONSTRAINT "day_itinerary_items_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "public"."tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "public"."tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_dayItineraryItemId_fkey" FOREIGN KEY ("dayItineraryItemId") REFERENCES "public"."day_itinerary_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
