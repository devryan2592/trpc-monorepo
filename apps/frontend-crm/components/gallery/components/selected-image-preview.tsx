"use client";

import { FC, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Edit, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { SelectedImagePreviewProps } from "../types";

const SelectedImagePreview: FC<SelectedImagePreviewProps> = ({
  selectedFiles,
  onEdit,
  onRemove,
}) => {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  if (selectedFiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No images selected</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedFiles.map((file) => (
        <div
          key={file.id}
          className="relative h-16 aspect-square border rounded-md overflow-hidden group"
          onMouseEnter={() => setHoveredFile(file.id)}
          onMouseLeave={() => setHoveredFile(null)}
        >
          {/* Image preview */}
          <div
            className={cn(
              "w-full h-full bg-neutral-200",
              file.url && "bg-cover bg-center"
            )}
            style={{
              backgroundImage: file.url ? `url(${file.url})` : undefined,
            }}
          >
            {!file.url && (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">
                {file.fileName.substring(0, 8)}...
              </div>
            )}
          </div>

          {/* Hover overlay with actions */}
          {hoveredFile === file.id && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1">
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0"
                  onClick={() => onEdit(file)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onRemove && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                  onClick={() => onRemove(file)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* File name tooltip */}
          <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-muted-foreground truncate">
            {file.fileName}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectedImagePreview;
