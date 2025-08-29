"use client";

import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { ImageEditDialogProps, ImageSEOData } from "../types";
import Image from "next/image";

const ImageEditDialog: FC<ImageEditDialogProps> = ({
  file,
  isOpen,
  onClose,
  onSave,
}) => {
  const [seoData, setSeoData] = useState<ImageSEOData>({
    fileName: file.fileName,
    alt: "",
    keywords: "",
  });

  useEffect(() => {
    if (isOpen) {
      setSeoData({
        fileName: file.fileName,
        alt: "",
        keywords: "",
      });
    }
  }, [isOpen, file.fileName]);

  const handleSave = () => {
    onSave(file, seoData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        variant="fullscreen"
        className="sm:max-w-[425px] h-auto max-h-max my-auto mx-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Image SEO</DialogTitle>
          <DialogDescription>
            Update the SEO information for this image.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image preview */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
              {file.url ? (
                <Image
                  src={file.url}
                  alt={file.fileName}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-sm text-gray-500">
                  {file.fileName}
                </div>
              )}
            </div>
          </div>

          {/* File name (readonly) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right">
              Filename
            </Label>
            <Input
              id="filename"
              value={seoData.fileName}
              readOnly
              className="col-span-3 bg-muted"
            />
          </div>

          {/* Alt text */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="alt" className="text-right">
              Alt Text
            </Label>
            <Input
              id="alt"
              value={seoData.alt}
              onChange={(e) =>
                setSeoData((prev) => ({ ...prev, alt: e.target.value }))
              }
              placeholder="Describe the image..."
              className="col-span-3"
            />
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="keywords" className="text-right pt-2">
              Keywords
            </Label>
            <Textarea
              id="keywords"
              value={seoData.keywords}
              onChange={(e) =>
                setSeoData((prev) => ({ ...prev, keywords: e.target.value }))
              }
              placeholder="Enter keywords separated by commas..."
              className="col-span-3 min-h-[80px]"
            />
          </div>

          {/* File info */}
          <div className="text-sm text-muted-foreground space-y-1">
            {file.size && <div>Size: {(file.size / 1024).toFixed(1)} KB</div>}
            {file.mimeType && <div>Type: {file.mimeType}</div>}
            {file.bucketName && <div>Bucket: {file.bucketName}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditDialog;
