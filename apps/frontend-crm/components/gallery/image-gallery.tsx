"use client";

import { FC, useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import GalleryItem from "./components/gallery-item";
import SelectedImagePreview from "./components/selected-image-preview";
import ImageEditDialog from "./components/image-edit-dialog";
import {
  ImageGalleryProps,
  SelectedFile,
  GalleryFile,
  ImageSEOData,
} from "./types";
import { useTRPC } from "@/trpc/client";
import {
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Trash, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { post, del, get } from "@/lib/fetch-wrapper";
import { getImageUrl } from "@/actions/image-gallery-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";

// Type definition for ImageGalleryFolder
type ImageGalleryFolder = {
  id: string;
  name: string;
  bucketName: string;
  createdAt: Date;
  updatedAt: Date;
  imageFiles?: any[];
};

const ImageGallery: FC<ImageGalleryProps> = ({
  selectionMode = "single",
  onSelectionChange,
  initialSelectedFiles = [],
  files = [],
  maxSelections,
  allowEdit = true,
  trigger,
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [editingFile, setEditingFile] = useState<SelectedFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateFolderPopoverOpen, setIsCreateFolderPopoverOpen] =
    useState(false);
  const [folderFiles, setFolderFiles] = useState<GalleryFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // URL cache to avoid redundant API calls with localStorage persistence
  const [urlCache, setUrlCache] = useState<Map<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("gallery-url-cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          return new Map(Object.entries(parsed));
        }
      } catch (error) {
        console.warn("Failed to load URL cache from localStorage:", error);
      }
    }
    return new Map();
  });
  const [urlErrors, setUrlErrors] = useState<Set<string>>(new Set());

  // tRPC queries
  const { data: foldersData, isLoading: isLoadingFolders } = useQuery(
    trpc.imageGallery.getFolders.queryOptions()
  );

  const folders = foldersData?.folders || [];

  // Mutations for REST API calls
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await post("/image-gallery/folders", { name });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.imageGallery.getFolders.queryKey(),
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await del(`/image-gallery/folders/${folderId}`);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.imageGallery.getFolders.queryKey(),
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await del(`/image-gallery/files/${fileId}`);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      if (selectedFolder) {
        queryClient.invalidateQueries({
          queryKey: trpc.imageGallery.getFilesByFolderId.queryKey({
            id: selectedFolder,
          }),
        });
      }
    },
  });

  // Get files for selected folder using tRPC
  const { data: filesData, isLoading: isLoadingFilesQuery } = useQuery(
    trpc.imageGallery.getFilesByFolderId.queryOptions(
      { id: selectedFolder! },
      { enabled: !!selectedFolder }
    )
  );

  // Memoized gallery files with URLs to prevent unnecessary re-renders
  const galleryFiles = useMemo(() => {
    const baseFiles = files.length > 0 ? files : folderFiles;
    return baseFiles.map((file) => ({
      ...file,
      url: urlCache.get(file.id) || file.url || undefined,
      hasError: urlErrors.has(file.id),
    }));
  }, [files, folderFiles, urlCache, urlErrors]);

  // Memoized file statistics
  const fileStats = useMemo(() => {
    const totalFiles = galleryFiles.length;
    const filesWithUrls = galleryFiles.filter((f) => f.url).length;
    const filesWithErrors = galleryFiles.filter((f) => f.hasError).length;

    return {
      total: totalFiles,
      loaded: filesWithUrls,
      errors: filesWithErrors,
      pending: totalFiles - filesWithUrls - filesWithErrors,
    };
  }, [galleryFiles]);

  // Track URL loading state
  const isLoadingUrls = fileStats.pending > 0;

  // Auto-select first folder when folders are loaded
  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0]?.id || null);
    } else if (folders.length === 0 && selectedFolder) {
      // Clear selected folder if no folders exist
      setSelectedFolder(null);
      setFolderFiles([]);
    }
  }, [folders, selectedFolder]);

  // Persist URL cache to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && urlCache.size > 0) {
      try {
        const cacheObject = Object.fromEntries(urlCache);
        localStorage.setItem("gallery-url-cache", JSON.stringify(cacheObject));
      } catch (error) {
        console.warn("Failed to save URL cache to localStorage:", error);
      }
    }
  }, [urlCache]);

  // Clean up old cache entries (older than 1 hour)
  useEffect(() => {
    const cleanupCache = () => {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("gallery-url-cache-timestamps");
          if (cached) {
            const timestamps = JSON.parse(cached);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;

            const validEntries = Object.entries(timestamps).filter(
              ([_, timestamp]) => now - (timestamp as number) < oneHour
            );

            if (validEntries.length !== Object.keys(timestamps).length) {
              const validIds = new Set(validEntries.map(([id]) => id));
              const newCache = new Map();

              urlCache.forEach((url, id) => {
                if (validIds.has(id)) {
                  newCache.set(id, url);
                }
              });

              setUrlCache(newCache);
              localStorage.setItem(
                "gallery-url-cache-timestamps",
                JSON.stringify(Object.fromEntries(validEntries))
              );
            }
          }
        } catch (error) {
          console.warn("Failed to cleanup URL cache:", error);
        }
      }
    };

    cleanupCache();
    const interval = setInterval(cleanupCache, 5 * 60 * 1000); // Clean every 5 minutes
    return () => clearInterval(interval);
  }, [urlCache]);

  // Update folderFiles when filesData changes
  useEffect(() => {
    if (filesData?.files) {
      const transformFiles = async () => {
        setIsLoadingFiles(true);
        try {
          // First, transform files without URLs for immediate display
          const initialFiles: GalleryFile[] = filesData.files.map((file) => ({
            id: file.id,
            fileName: file.fileName,
            bucketName: file.bucketName,
            mimeType: file.mimeType || undefined,
            size: file.size || undefined,
            url: urlCache.get(file.id) || "",
            isSelected: false,
          }));

          setFolderFiles(initialFiles);

          // Then fetch URLs for images that don't have cached URLs
          const imagesToFetch = filesData.files.filter(
            (file) =>
              file.mimeType?.startsWith("image/") &&
              !urlCache.has(file.id) &&
              !urlErrors.has(file.id)
          );

          if (imagesToFetch.length > 0) {
            // Batch fetch URLs with controlled concurrency
            const batchSize = 5;
            for (let i = 0; i < imagesToFetch.length; i += batchSize) {
              const batch = imagesToFetch.slice(i, i + batchSize);

              const urlPromises = batch.map(async (file) => {
                try {
                  const urlResponse = await getImageUrl(file.id);

                  console.log(`URL response for file ${file.id}:`, urlResponse);

                  let url: string | undefined;

                  if (urlResponse.status === "success" && urlResponse.data) {
                    url = urlResponse.data.data.url;
                  }

                  if (url) {
                    return {
                      fileId: file.id,
                      url: url,
                      error: null,
                    };
                  } else {
                    console.error(
                      `No URL found in response for file ${file.id}:`,
                      urlResponse
                    );
                    throw new Error(
                      `No URL returned. Response: ${JSON.stringify(urlResponse)}`
                    );
                  }
                } catch (error) {
                  console.error(
                    `Failed to fetch URL for file ${file.id}:`,
                    error
                  );
                  return { fileId: file.id, url: null, error: error as Error };
                }
              });

              const results = await Promise.allSettled(urlPromises);

              // Update cache and files with fetched URLs
              const newUrlCache = new Map(urlCache);
              const newUrlErrors = new Set(urlErrors);

              results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                  const { fileId, url, error } = result.value;
                  if (url) {
                    newUrlCache.set(fileId, url);
                  } else if (error) {
                    newUrlErrors.add(fileId);
                  }
                } else {
                  const batchItem = batch[index];
                  if (batchItem) {
                    const fileId = batchItem.id;
                    newUrlErrors.add(fileId);
                  }
                }
              });

              setUrlCache(newUrlCache);
              setUrlErrors(newUrlErrors);

              // Update files with new URLs
              setFolderFiles((prev) =>
                prev.map((file) => ({
                  ...file,
                  url: newUrlCache.get(file.id) || file.url,
                }))
              );
            }
          }
        } catch (error) {
          console.error("Error transforming files:", error);
          toast.error("Failed to load images");
        } finally {
          setIsLoadingFiles(false);
        }
      };

      transformFiles();
    } else {
      setFolderFiles([]);
      setIsLoadingFiles(false);
    }
  }, [filesData, urlCache, urlErrors]);

  // Function to refresh URL for a specific file with debouncing
  const refreshFileUrl = useCallback(
    async (fileId: string) => {
      try {
        // Store timestamp for cache cleanup
        if (typeof window !== "undefined") {
          try {
            const timestamps = JSON.parse(
              localStorage.getItem("gallery-url-cache-timestamps") || "{}"
            );
            timestamps[fileId] = Date.now();
            localStorage.setItem(
              "gallery-url-cache-timestamps",
              JSON.stringify(timestamps)
            );
          } catch (error) {
            console.warn("Failed to store cache timestamp:", error);
          }
        }

        const urlResponse = await get<{ url: string }>(
          `/image-gallery/files/${fileId}/url`
        );

        if (urlResponse.data !== null && urlResponse.data?.url) {
          const newUrlCache = new Map(urlCache);
          newUrlCache.set(fileId, urlResponse.data.url);
          setUrlCache(newUrlCache);

          // Remove from error set if it was there
          const newUrlErrors = new Set(urlErrors);
          newUrlErrors.delete(fileId);
          setUrlErrors(newUrlErrors);

          // Update the file in the list
          setFolderFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? { ...file, url: urlResponse.data?.url }
                : file
            )
          );

          return urlResponse.data.url;
        }
      } catch (error) {
        console.error(`Failed to refresh URL for file ${fileId}:`, error);
        const newUrlErrors = new Set(urlErrors);
        newUrlErrors.add(fileId);
        setUrlErrors(newUrlErrors);
      }
      return null;
    },
    [urlCache, urlErrors]
  );

  // Clear URL cache when folder changes
  useEffect(() => {
    if (selectedFolder) {
      // Keep cache but clear errors for new folder
      setUrlErrors(new Set());
    }
  }, [selectedFolder]);

  // Initialize selected files and update when initialSelectedFiles changes
  useEffect(() => {
    setSelectedFiles(initialSelectedFiles);
  }, [initialSelectedFiles]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const result = (await createFolderMutation.mutateAsync(
        newFolderName.trim()
      )) as any;
      if (result?.success && result?.data?.folder) {
        setSelectedFolder(result.data.folder.id);
        toast.success("Folder created successfully");
      }
      setNewFolderName("");
      setIsCreateFolderPopoverOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) {
      toast.error("No folder selected");
      return;
    }

    if (galleryFiles.length > 0) {
      toast.error(
        "Cannot delete folder with files. Please delete all files first."
      );
      return;
    }

    const folderToDelete = selectedFolder;
    const remainingFolders = folders.filter(
      (folder) => folder.id !== folderToDelete
    );

    // Optimistically update the UI immediately
    setSelectedFolder(
      remainingFolders.length > 0 ? remainingFolders[0]?.id || null : null
    );
    setFolderFiles([]);

    try {
      await deleteFolderMutation.mutateAsync(folderToDelete);
      console.log("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
      // Revert optimistic update on error
      setSelectedFolder(folderToDelete);
    }
  };

  const handleFileSelect = (file: GalleryFile) => {
    let newSelectedFiles: SelectedFile[];

    if (selectionMode === "single") {
      newSelectedFiles = [file];
      setSelectedFiles(newSelectedFiles);
    } else {
      const isAlreadySelected = selectedFiles.some((f) => f.id === file.id);
      if (!isAlreadySelected) {
        if (maxSelections && selectedFiles.length >= maxSelections) {
          return; // Don't add if max selections reached
        }
        newSelectedFiles = [...selectedFiles, file];
        setSelectedFiles(newSelectedFiles);
      } else {
        return;
      }
    }

    // Notify parent component
    onSelectionChange?.(newSelectedFiles);
  };

  const handleFileDeselect = (file: GalleryFile) => {
    const newSelectedFiles = selectedFiles.filter((f) => f.id !== file.id);
    setSelectedFiles(newSelectedFiles);
    onSelectionChange?.(newSelectedFiles);
  };

  const handleEditFile = (file: SelectedFile) => {
    setEditingFile(file);
  };

  const handleRemoveFile = (file: SelectedFile) => {
    const newSelectedFiles = selectedFiles.filter((f) => f.id !== file.id);
    setSelectedFiles(newSelectedFiles);
    onSelectionChange?.(newSelectedFiles);
  };

  const handleSaveEdit = (file: SelectedFile, seoData: ImageSEOData) => {
    // Update the file with SEO data - in a real app, this would save to backend
    console.log("Saving SEO data for file:", file.id, seoData);
    setEditingFile(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedFolder) {
      toast.error("Please select files and a folder");
      return;
    }

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folderId", selectedFolder);

      const response = await post("/image-gallery/files/multiple", formData);

      if (response.error) {
        throw response.error;
      }

      const result = response.data as any;
      if (result && result.success) {
        // Invalidate queries to refresh the file list
        if (selectedFolder) {
          queryClient.invalidateQueries({
            queryKey: trpc.imageGallery.getFilesByFolderId.queryKey({
              id: selectedFolder,
            }),
          });
        }
        toast.success(`Successfully uploaded ${fileArray.length} file(s)`);
      } else {
        throw new Error(result?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (fileId: string) => {
    if (!selectedFolder) return;

    try {
      await deleteFileMutation.mutateAsync(fileId);

      // Remove from local state
      setFolderFiles((prev) => prev.filter((f) => f.id !== fileId));

      // Remove from selected files if it was selected
      const newSelectedFiles = selectedFiles.filter((f) => f.id !== fileId);
      setSelectedFiles(newSelectedFiles);
      onSelectionChange?.(newSelectedFiles);

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const isFileSelected = (fileId: string) => {
    return selectedFiles.some((f) => f.id === fileId);
  };

  console.log("selectedFolder", selectedFolder);
  console.log("folders", folders);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {trigger || <Button>Open Gallery</Button>}
        </DialogTrigger>
        <DialogContent className="p-0 max-w-7xl mx-auto" variant="fullscreen">
          <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
            <DialogTitle className="px-6 text-base">Image Gallery</DialogTitle>
            <DialogDescription className="px-6 text-sm text-muted-foreground">
              Select an image from the gallery
            </DialogDescription>
            {/* Folder selection in header */}
            <div className="px-6 pt-3 flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex flex-row gap-2">
                <Select
                  value={selectedFolder || ""}
                  onValueChange={setSelectedFolder}
                >
                  <SelectTrigger className="min-w-[180px] w-full">
                    <SelectValue
                      placeholder={
                        isLoadingFolders
                          ? "Loading folders..."
                          : folders.length === 0
                            ? "No folders available"
                            : "Select folder"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!selectedFolder || folders.length === 0 ? (
                      <SelectItem value="no-folders" disabled>
                        No folders available
                      </SelectItem>
                    ) : (
                      folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover
                        open={isCreateFolderPopoverOpen}
                        onOpenChange={setIsCreateFolderPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={createFolderMutation.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className={cn(useIsMobile() ? "w-64" : "w-80")}
                          align={useIsMobile() ? "end" : "start"}
                        >
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Create New Folder
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Enter a name for the new folder.
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="folder-name">Name</Label>
                                <Input
                                  id="folder-name"
                                  placeholder="Folder name"
                                  className="col-span-2 h-8"
                                  value={newFolderName}
                                  onChange={(e) =>
                                    setNewFolderName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleCreateFolder();
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={handleCreateFolder}
                                  disabled={
                                    createFolderMutation.isPending ||
                                    !newFolderName.trim()
                                  }
                                >
                                  {createFolderMutation.isPending
                                    ? "Creating..."
                                    : "Create"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create new folder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete Folder Button - Only Appear when any folder is selected and folders exist */}
                {selectedFolder && folders.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={handleDeleteFolder}
                          disabled={deleteFolderMutation.isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete selected folder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || !selectedFolder}
                />
                <Button
                  variant="outline"
                  className="sm:min-w-24 w-full"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  disabled={
                    isUploading || !selectedFolder || folders.length === 0
                  }
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable image grid */}
          <div className="flex-1 overflow-hidden ">
            <ScrollArea className="h-full">
              {isLoadingFiles || isLoadingFilesQuery ? (
                <div className="flex flex-col items-center justify-center h-full mt-4 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <div className="text-lg font-medium">Loading images...</div>
                    <div className="text-sm text-muted-foreground">
                      {isLoadingFiles
                        ? "Fetching image URLs..."
                        : "Loading file list..."}
                    </div>
                  </div>
                </div>
              ) : !selectedFolder ? (
                <div className="flex items-center justify-center h-full mt-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Please select a folder to view images
                    </p>
                  </div>
                </div>
              ) : galleryFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full mt-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-medium">No images found</div>
                    <div className="text-sm text-muted-foreground">
                      This folder is empty. Upload some images to get started.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="upload-input-empty"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("upload-input-empty")?.click()
                      }
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Images"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {/* URL fetching progress indicator */}
                  {isLoadingUrls && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">
                          Fetching image URLs... ({fileStats.loaded}/
                          {fileStats.total})
                          {fileStats.errors > 0 &&
                            ` (${fileStats.errors} failed)`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {galleryFiles.map((file) => (
                      <GalleryItem
                        key={file.id}
                        file={file}
                        isSelected={isFileSelected(file.id)}
                        selectionMode={selectionMode}
                        onSelect={handleFileSelect}
                        onDeselect={handleFileDeselect}
                        onDelete={handleDeleteImage}
                        onRefreshUrl={refreshFileUrl}
                      />
                    ))}
                  </div>

                  {/* Error summary */}
                  {fileStats.errors > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {fileStats.errors} image
                          {fileStats.errors > 1 ? "s" : ""} failed to load.
                          Click the retry button on individual images to try
                          again.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 py-4 border-t border-border shrink-0">
            {/* Selected images preview */}
            <div className="flex-1 min-h-[80px]">
              <div className="mb-2">
                <span className="text-sm font-medium">
                  Selected Images ({selectedFiles.length}
                  {maxSelections ? `/${maxSelections}` : ""})
                </span>
              </div>
              <SelectedImagePreview
                selectedFiles={selectedFiles}
                onEdit={allowEdit ? handleEditFile : undefined}
                onRemove={handleRemoveFile}
              />
            </div>
            <Separator orientation="vertical" className="hidden sm:block" />
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="min-w-24">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="button"
                  className="min-w-24"
                  disabled={selectedFiles.length === 0}
                >
                  Select ({selectedFiles.length})
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>

          {/* Image Edit Dialog */}
          {editingFile && (
            <ImageEditDialog
              file={editingFile}
              isOpen={!!editingFile}
              onClose={() => setEditingFile(null)}
              onSave={handleSaveEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
