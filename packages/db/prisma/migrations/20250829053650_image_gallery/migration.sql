-- CreateTable
CREATE TABLE "public"."ImageGalleryFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageGalleryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_files" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "bucket_name" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageGalleryFolder_bucket_name_key" ON "public"."ImageGalleryFolder"("bucket_name");

-- AddForeignKey
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."ImageGalleryFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
