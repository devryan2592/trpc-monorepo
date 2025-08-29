"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { GalleryItemProps } from "../types";
import { Trash2, RefreshCw, AlertCircle } from "lucide-react";

const GalleryItem: FC<GalleryItemProps> = ({
  file,
  isSelected,
  selectionMode,
  onSelect,
  onDeselect,
  onDelete,
  onRefreshUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleClick = () => {
    if (isSelected) {
      onDeselect(file);
    } else {
      onSelect(file);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelect(file);
    } else {
      onDeselect(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(file.id);
  };

  const handleRefreshUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefreshUrl || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const newUrl = await onRefreshUrl(file.id);
      if (newUrl) {
        setImageError(false);
      }
    } catch (error) {
      console.error('Failed to refresh URL:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log("File Url", file.url);

  return (
    <div
      className={cn(
        "relative aspect-square w-full cursor-pointer transition-all duration-200 hover:scale-105 group",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={selectionMode === "single" ? handleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image display */}
      <div className="w-full h-full bg-neutral-500 rounded-md overflow-hidden relative">
        {file.url && file.mimeType && file.mimeType.startsWith("image/") && !imageError ? (
          <Image
            src={file.url}
            alt={file.fileName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={(e) => {
              console.error("Image failed to load:", file.url);
              setImageError(true);
            }}
          />
        ) : imageError ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-xs p-2 text-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div>Failed to load image</div>
            {onRefreshUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                onClick={handleRefreshUrl}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>Retry</>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white text-xs p-2 text-center">
            {file.fileName}
          </div>
        )}
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 rounded-md" />
      )}

      {/* Checkbox for multiple selection mode */}
      {selectionMode === "multiple" && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="bg-white border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}

      {/* Delete button - appears on hover */}
      {onDelete && (isHovered || isSelected) && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* File info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs rounded-b-md">
        <div className="truncate" title={file.fileName}>
          {file.fileName}
        </div>
        <div className="text-gray-300">
          {file.size ? (file.size / 1024).toFixed(1) + " KB" : "Unknown size"}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
