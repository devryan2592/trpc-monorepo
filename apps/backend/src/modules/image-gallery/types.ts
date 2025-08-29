export type CustomMulterFile = Omit<Express.Multer.File, "buffer" | "stream">;

// API Response Types - simplified since we're using tRPC for database operations

export type CreateImageFolderResponseType = {
  folder: any; // Will be defined by tRPC
};

export type CreateImageFileResponseType = {
  file: any; // Will be defined by tRPC
};

export type CreateMultipleImageFileResponseType = {
  files: any[]; // Will be defined by tRPC
};
