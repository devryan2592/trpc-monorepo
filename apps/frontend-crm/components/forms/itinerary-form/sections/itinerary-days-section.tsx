"use client";

import { FC, useState, useRef } from "react";
import { UseFormReturn, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Calendar, Clock, Images } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { CreateItineraryFormValues } from "@/types/itinerary";
import { MEAL_OPTIONS } from "@/types/itinerary";
import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile } from "@/components/gallery/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const ItineraryDaysSection: FC = ({}) => {
  const { control, getValues, setValue } =
    useFormContext<CreateItineraryFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "itinerary",
  });

  const addDay = () => {
    const nextDayNumber = fields.length + 1;
    append({
      dayNumber: nextDayNumber,
      title: "",
      content: "",
      meals: [],
      duration: undefined,
      images: [],
    });
  };

  const removeDay = (index: number) => {
    remove(index);
    // Update day numbers for remaining days
    const currentItinerary = getValues("itinerary") || [];
    currentItinerary.forEach((_, idx) => {
      if (idx > index) {
        setValue(`itinerary.${idx - 1}.dayNumber`, idx);
      }
    });
  };

  const removeImage = (dayIndex: number, imageIndex: number) => {
    const currentImages = getValues(`itinerary.${dayIndex}.images`) || [];
    setValue(
      `itinerary.${dayIndex}.images`,
      currentImages.filter((_, i) => i !== imageIndex)
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day-by-Day Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No itinerary days added yet.</p>
              <p className="text-sm">Click `Add Day` to add your first day.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {fields.map((field, index) => (
                <div className="border" key={field.id}>
                  <AccordionItem
                    key={field.id}
                    value={`day-${index}`}
                    className=""
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Day {index + 1}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getValues(`itinerary.${index}.duration`) && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {getValues(`itinerary.${index}.duration`)}h
                            </Badge>
                          )}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDay(index);
                            }}
                            className="border p-1 border-destructive/10 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={control}
                            name={`itinerary.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day Title *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter day title"
                                    {...field}
                                  />
                                </FormControl>
                                <div className="min-h-[12px]">
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`itinerary.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (hours)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : undefined
                                      )
                                    }
                                  />
                                </FormControl>
                                <div className="min-h-[12px]">
                                    <FormMessage />
                                  </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={control}
                          name={`itinerary.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the activities for this day"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <div className="min-h-[12px]">
                                        <FormMessage />
                                      </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`itinerary.${index}.meals`}
                          render={() => (
                            <FormItem>
                              <FormLabel>Meals Included</FormLabel>
                              <div className="flex flex-wrap gap-4">
                                {MEAL_OPTIONS.map((meal) => (
                                  <FormField
                                    key={meal.value}
                                    control={control}
                                    name={`itinerary.${index}.meals`}
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={meal.value}
                                          className="flex flex-row items-start space-x-3 space-y-0 mt-1"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                meal.value
                                              )}
                                              onCheckedChange={(checked) => {
                                                const currentMeals =
                                                  field.value || [];
                                                if (checked) {
                                                  field.onChange([
                                                    ...currentMeals,
                                                    meal.value,
                                                  ]);
                                                } else {
                                                  field.onChange(
                                                    currentMeals.filter(
                                                      (m) => m !== meal.value
                                                    )
                                                  );
                                                }
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {meal.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="min-h-[12px]">
                                            <FormMessage />
                                          </div>
                            </FormItem>
                          )}
                        />

                        {/* Images Section */}
                        <FormField
                          control={control}
                          name={`itinerary.${index}.images`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 mt-2">
                                <Images className="h-4 w-4" />
                                Images
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  <div className="border border-border rounded-md p-4 bg-background">
                                    <div className="flex items-center flex-wrap gap-3">
                                      {/* Open Gallery Button */}
                                      <ImageGallery
                                        selectionMode="multiple"
                                        maxSelections={10}
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
                                      {field.value &&
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
                                                  removeImage(
                                                    index,
                                                    imageIndex
                                                  );
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
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                              <div className="min-h-[12px]">
                                                    <FormMessage />
                                                  </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addDay}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
