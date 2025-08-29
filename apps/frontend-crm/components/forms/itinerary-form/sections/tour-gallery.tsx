"use client";

import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { Images, Plus, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { CreateItineraryFormValues } from "@/types/itinerary";
import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile } from "@/components/gallery/types";

export const TourGallerySection: FC = () => {
  const { control, getValues, setValue } =
    useFormContext<CreateItineraryFormValues>();

  const removeImage = (imageIndex: number) => {
    const currentImages = getValues("images") || [];
    setValue(
      "images",
      currentImages.filter((_, i) => i !== imageIndex)
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent>
          <FormField
            control={control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Tour Gallery
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Always visible bordered container */}
                    <div className="border border-border rounded-md p-4 bg-background ">
                      <div className="flex items-center flex-wrap gap-3">
                        {/* Open Gallery Button */}
                        <ImageGallery
                          selectionMode="multiple"
                          maxSelections={20}
                          initialSelectedFiles={field.value || []}
                          onSelectionChange={(
                            selectedFiles: SelectedFile[]
                          ) => {
                            field.onChange(selectedFiles);
                          }}
                          trigger={
                            <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center hover:border-muted-foreground/50 transition-colors cursor-pointer group">
                              <div className="text-center">
                                <Plus className="h-6 w-6 mx-auto text-muted-foreground group-hover:text-muted-foreground/80" />
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  Add
                                </span>
                              </div>
                            </div>
                          }
                        />

                        {/* Selected Images */}
                        {field.value && field.value.length > 0 ? (
                          field.value.map((image, imageIndex) => (
                            <div
                              key={imageIndex}
                              className="relative h-20 w-20 group"
                            >
                              <div className="absolute -top-2 -right-2 group-hover:flex hidden transition-all duration-200 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(imageIndex);
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-1 shadow-md transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              <img
                                src={image.url || ""}
                                alt={image.altText || ""}
                                className="h-full w-full object-cover rounded-md group-hover:opacity-75 transition-opacity"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Images className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm">No images selected</p>
                            <p className="text-xs">
                              Click `Add` to select tour images
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};
