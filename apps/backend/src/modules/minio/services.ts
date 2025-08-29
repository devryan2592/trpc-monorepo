import { minioClient } from "../../config/minio";
import { CustomMulterFile } from "../image-gallery/types";

// Check and create bucket
export const checkAndCreateBucket = async (bucketName: string) => {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);

    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
  } catch (error) {
    console.log(`Error creating bucket ${bucketName}:`, error);
    throw error;
  }
};

// Delete Bucket
export const deleteBucket = async (bucketName: string) => {
  try {
    const bucketObjects = await minioClient.listObjectsV2(bucketName);
    for await (const obj of bucketObjects) {
      console.log(`Deleting object ${obj.name} from bucket ${bucketName}`);
      await minioClient.removeObject(bucketName, obj.name);
    }
    await minioClient.removeBucket(bucketName);
    console.log(`Bucket ${bucketName} deleted successfully`);
  } catch (error) {
    console.log(`Error deleting bucket ${bucketName}:`, error);
    throw error;
  }
};

// Upload File (using multer disk storage)
export const uploadFile = async (
  bucketname: string,
  filename: string,
  file: CustomMulterFile
) => {
  console.log("Uploading file to bucket", bucketname);

  try {
    const response = await minioClient.fPutObject(
      bucketname,
      filename,
      file.path,
      {
        "Content-Type": file.mimetype,
        "Content-Size": file.size,
      }
    );
    console.log("File uploaded successfully", response);
    return response;
  } catch (error) {
    console.log("Error uploading file", error);
  }
};

// Delete File
export const deleteFile = async (bucketName: string, fileName: string) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    console.log(
      `File ${fileName} deleted successfully from bucket ${bucketName}`
    );
  } catch (error) {
    console.log(
      `Error deleting file ${fileName} from bucket ${bucketName}:`,
      error
    );
    throw error;
  }
};

// Get File URL
export const getFileUrl = async (
  bucketName: string,
  fileName: string,
  expires: number = 60 * 60 * 24
) => {
  try {
    const url = minioClient.presignedGetObject(bucketName, fileName, expires);
    console.log(`File ${fileName} URL: ${url}`);
    return url;
  } catch (error) {
    console.log(
      `Error getting file ${fileName} URL from bucket ${bucketName}:`,
      error
    );
    throw error;
  }
};
