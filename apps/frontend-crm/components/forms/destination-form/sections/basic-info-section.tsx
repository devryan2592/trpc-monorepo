"use client";

import { FC } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { MapPin, X, ImageIcon, Plus } from "lucide-react";
import { CreateDestinationFormValues } from "@/schemas/destination-form-schema";
import ArrayInput from "@/components/custom-ui/array-input";
import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile } from "@/components/gallery/types";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "NPR", label: "Nepalese Rupee (NPR)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "THB", label: "Thai Baht (THB)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const BasicInfoSection: FC = () => {
  const { control } = useFormContext<CreateDestinationFormValues>();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="">
          <CardTitle className="">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Name *</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Enter destination name"
                      {...field}
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
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter destination description"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <div className="min-h-[12px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Cities and Currency in grid layout */}
          {/* Cities Section */}
          <FormField
            control={control}
            name="cities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Cities</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <ArrayInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Enter city name"
                      displayValue={false}
                    />

                    {/* Display cities as badges */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {field.value &&
                        field.value.length > 0 &&
                        field.value.map((city, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1 max-w-fit"
                          >
                            <MapPin className="h-3 w-3" />
                            {city}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCities =
                                  field.value?.filter((_, i) => i !== index) ||
                                  [];
                                field.onChange(newCities);
                              }}
                              className="h-auto p-0 ml-1 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                </FormControl>
                <div className="min-h-[12px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Currency Section */}
          <FormField
            control={control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "USD"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-h-[12px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={control}
              name="bestSeasonStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Season Start</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="min-h-[12px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bestSeasonEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Season End</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="min-h-[12px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Thumbnail Selection */}
          <FormField
            control={control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 mt-2">
                  <ImageIcon className="h-4 w-4" />
                  Thumbnail Image
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <div className="border border-border rounded-md p-4 bg-background min-h-[120px]">
                      <div className="flex flex-wrap gap-3">
                        {/* Open Gallery Button */}
                        <ImageGallery
                          selectionMode="single"
                          initialSelectedFiles={
                            field.value ? [field.value] : []
                          }
                          onSelectionChange={(
                            selectedFiles: SelectedFile[]
                          ) => {
                            field.onChange(
                              selectedFiles.length > 0 ? selectedFiles[0] : null
                            );
                          }}
                          trigger={
                            <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors">
                              <div className="text-center">
                                <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">
                                  Add
                                </span>
                              </div>
                            </div>
                          }
                        />

                        {/* Selected Thumbnail */}
                        {field.value && (
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                              <img
                                src={
                                  field.value.url ||
                                  `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=thumbnail&image_size=square`
                                }
                                alt={field.value.fileName || "Thumbnail"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => field.onChange(null)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
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

          <FormField
            control={control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 sm:gap-0">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm sm:text-base">
                    Featured Destination
                  </FormLabel>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Mark this destination as featured to highlight it on the
                    website.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};
