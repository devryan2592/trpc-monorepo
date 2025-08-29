"use client";

import ImageGallery from "@/components/gallery/image-gallery";
import { Button } from "@workspace/ui/components/button";

export default function GalleryTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Image Gallery Test</h1>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          This page demonstrates the image gallery with folder management functionality.
        </p>
        <ImageGallery
          selectionMode="multiple"
          maxSelections={5}
          trigger={<Button>Open Gallery</Button>}
          onSelectionChange={(files) => {
            console.log('Selected files:', files);
          }}
        />
      </div>
    </div>
  );
}