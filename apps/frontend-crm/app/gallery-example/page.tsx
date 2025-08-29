"use client";

import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile, SelectionMode } from "@/components/gallery/types";

export default function GalleryExamplePage() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [maxSelections, setMaxSelections] = useState<number | undefined>(
    undefined
  );

  const handleSelectionChange = useCallback((files: SelectedFile[]) => {
    setSelectedFiles(files);
    console.log("Selected files changed:", files);
  }, []);

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => (prev === "single" ? "multiple" : "single"));
    setSelectedFiles([]); // Clear selections when changing mode
  };

  const setMultipleWithLimit = () => {
    setSelectionMode("multiple");
    setMaxSelections(3);
    setSelectedFiles([]);
  };

  const clearSelections = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Image Gallery Component Example</h1>
        <p className="text-muted-foreground">
          Demonstration of the reusable ImageGallery component with different
          configurations
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Controls</CardTitle>
          <CardDescription>
            Configure the gallery behavior and test different modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectionMode === "single" ? "primary" : "outline"}
              onClick={() => {
                setSelectionMode("single");
                setMaxSelections(undefined);
                setSelectedFiles([]);
              }}
            >
              Single Selection
            </Button>
            <Button
              variant={
                selectionMode === "multiple" && !maxSelections
                  ? "primary"
                  : "outline"
              }
              onClick={toggleSelectionMode}
            >
              Multiple Selection
            </Button>
            <Button
              variant={
                selectionMode === "multiple" && maxSelections
                  ? "primary"
                  : "outline"
              }
              onClick={setMultipleWithLimit}
            >
              Multiple (Max 3)
            </Button>
            <Button variant="destructive" onClick={clearSelections}>
              Clear Selections
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">Mode: {selectionMode}</Badge>
            {maxSelections && (
              <Badge variant="outline">Max: {maxSelections}</Badge>
            )}
            <Badge variant="primary">Selected: {selectedFiles.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Component */}
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>
            Click images to select them. In multiple mode, use checkboxes. Hover
            over selected images in the footer to edit or remove them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGallery
            selectionMode={selectionMode}
            onSelectionChange={handleSelectionChange}
            initialSelectedFiles={selectedFiles}
            maxSelections={maxSelections}
            allowEdit={true}
          />
        </CardContent>
      </Card>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
            <CardDescription>
              Files selected from the gallery component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{file.fileName}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.fileName} • {((file.size ?? 0) / 1024).toFixed(1)}{" "}
                      KB • {file.mimeType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Bucket: {file.bucketName} • ID: {file.id}
                    </div>
                  </div>
                  {file.url && (
                    <div className="w-16 h-16 border rounded overflow-hidden">
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Example Code */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use the ImageGallery component in your code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile } from "@/components/gallery/types";

function MyComponent() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  const handleSelectionChange = (files: SelectedFile[]) => {
    setSelectedFiles(files);
    // Handle the selected files
  };

  return (
    <ImageGallery
      selectionMode="multiple"  // or "single"
      onSelectionChange={handleSelectionChange}
      maxSelections={5}  // optional
      allowEdit={true}   // optional, default true
      files={myFiles}    // optional, uses mock data if not provided
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
