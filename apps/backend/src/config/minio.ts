import * as Minio from "minio";
import "dotenv/config"; // Make sure to load environment variables

if (
  !process.env.MINIO_ENDPOINT ||
  !process.env.MINIO_ACCESS_KEY ||
  !process.env.MINIO_SECRET_KEY
) {
  throw new Error("Minio environment variables are not set!");
}

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});
