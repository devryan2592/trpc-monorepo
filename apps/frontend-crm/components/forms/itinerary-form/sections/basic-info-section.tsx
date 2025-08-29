"use client";

import { FC, useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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
import {
  CreateItineraryFormValues,
  Destination,
  City,
} from "@/types/itinerary";
import { TOUR_TYPES, CURRENCY_OPTIONS } from "@/types/itinerary";
import MultiSelect from "@/components/custom-ui/multi-select";
import ImageGallery from "@/components/gallery/image-gallery";
import { SelectedFile } from "@/components/gallery/types";
import { ImageIcon, Plus, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// Mock API functions - replace with actual API calls
const fetchDestinations = async (): Promise<Destination[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock data with complete Destination type properties
  return [
    {
      id: "1",
      name: "Nepal",
      content: "Beautiful country in the Himalayas",
      featured: false,
      currency: "NPR",
      bestSeasonStart: "October",
      bestSeasonEnd: "May",
      languages: ["Nepali", "English"],
      cities: [],
      images: [],
      faqs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Thailand",
      content: "Land of smiles with beautiful beaches and temples",
      featured: true,
      currency: "THB",
      bestSeasonStart: "November",
      bestSeasonEnd: "March",
      languages: ["Thai", "English"],
      cities: [],
      images: [],
      faqs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "India",
      content: "Incredible India with diverse culture and heritage",
      featured: false,
      currency: "INR",
      bestSeasonStart: "October",
      bestSeasonEnd: "March",
      languages: ["Hindi", "English"],
      cities: [],
      images: [],
      faqs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

const fetchCitiesByDestinations = async (
  destinationIds: string[]
): Promise<City[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data with complete City type properties
  const allCities: City[] = [
    { id: "1", name: "Kathmandu", destinationId: "1" },
    { id: "2", name: "Pokhara", destinationId: "1" },
    { id: "3", name: "Chitwan", destinationId: "1" },
    { id: "4", name: "Bangkok", destinationId: "2" },
    { id: "5", name: "Phuket", destinationId: "2" },
    { id: "6", name: "Chiang Mai", destinationId: "2" },
    { id: "7", name: "Delhi", destinationId: "3" },
    { id: "8", name: "Mumbai", destinationId: "3" },
    { id: "9", name: "Goa", destinationId: "3" },
  ];

  // Filter cities based on selected destination IDs
  return allCities.filter((city) =>
    destinationIds.includes(city.destinationId || "")
  );
};

export const BasicInfoSection: FC = () => {
  const { control, watch, setValue } =
    useFormContext<CreateItineraryFormValues>();

  // Watch selected destinations to fetch cities
  const selectedDestinations = useMemo(
    () => watch("destinations") || [],
    [watch("destinations")]
  );
  const selectedDestinationIds = useMemo(
    () => selectedDestinations.map((dest) => dest.id),
    [selectedDestinations]
  );

  // Fetch destinations
  const {
    data: destinations = [],
    isLoading: isLoadingDestinations,
    error: destinationsError,
  } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch cities based on selected destinations
  const {
    data: availableCities = [],
    isLoading: isLoadingCities,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities", selectedDestinationIds],
    queryFn: () => fetchCitiesByDestinations(selectedDestinationIds),
    enabled: selectedDestinationIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Watch for destination changes and automatically remove cities from deselected destinations
  useEffect(() => {
    const currentCities = watch("cities") || [];
    if (currentCities.length > 0 && selectedDestinationIds.length > 0) {
      // Filter out cities that belong to destinations that are no longer selected
      const validCities = currentCities.filter((city) => {
        // If city has destinationId, check if that destination is still selected
        if (city.destinationId) {
          return selectedDestinationIds.includes(city.destinationId);
        }
        // If no destinationId, keep the city (fallback for data integrity)
        return true;
      });

      // Update cities if any were filtered out
      if (validCities.length !== currentCities.length) {
        setValue("cities", validCities, { shouldValidate: true });
      }
    } else if (selectedDestinationIds.length === 0) {
      // If no destinations are selected, clear all cities
      const currentCities = watch("cities");
      if (currentCities && currentCities.length > 0) {
        setValue("cities", [], { shouldValidate: true });
      }
    }
  }, [selectedDestinationIds, watch, setValue]);
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="">
          <CardTitle className="">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          {/* Featured Tour Switch - Moved to top */}

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Name *</FormLabel>
                  <FormControl>
                    <Input required placeholder="Enter tour name" {...field} />
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
                    placeholder="Enter tour description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <div className="min-h-[12px]">
                   <FormMessage />
                 </div>
              </FormItem>
            )}
          />

          {/* Destinations and Cities Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Destinations */}
              <div className="space-y-2">
                {destinationsError && (
                  <div className="text-sm text-destructive">
                    Error loading destinations: {destinationsError.message}
                  </div>
                )}
                <FormField
                  control={control}
                  name="destinations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Destinations</FormLabel>
                      <FormControl>
                        <MultiSelect<Pick<Destination, "id" | "name">>
                          items={destinations}
                          getLabel={(destination) => destination.name}
                          getValue={(destination) => destination.id}
                          onChange={field.onChange}
                          selectedItems={field.value || []}
                          label="destinations"
                          placeholder={
                            isLoadingDestinations
                              ? "Loading destinations..."
                              : "Search destinations..."
                          }
                          disabled={
                            isLoadingDestinations || !!destinationsError
                          }
                          isSubmitting={isLoadingDestinations}
                        />
                      </FormControl>
                      <div className="min-h-[12px]">
                     <FormMessage />
                   </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Cities */}
              <div className="space-y-2">
                {selectedDestinations.length === 0 && (
                  <div className="flex h-full sm:items-center ">
                    <p className="text-sm text-muted-foreground sm:pt-2">
                      Please select destinations first to see available cities.
                    </p>
                  </div>
                )}

                {citiesError && selectedDestinations.length > 0 && (
                  <div className="text-sm text-destructive">
                    Error loading cities: {citiesError.message}
                  </div>
                )}

                {selectedDestinations.length > 0 && (
                  <FormField
                    control={control}
                    name="cities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Cities</FormLabel>
                        <FormControl>
                          <MultiSelect<Pick<City, "id" | "name">>
                            items={availableCities}
                            getLabel={(city) => city.name}
                            getValue={(city) => city.id}
                            onChange={field.onChange}
                            selectedItems={field.value || []}
                            label="cities"
                            placeholder={
                              isLoadingCities
                                ? "Loading cities..."
                                : availableCities.length === 0 &&
                                  !isLoadingCities
                                ? "No cities available for selected destinations"
                                : "Search cities..."
                            }
                            disabled={
                              isLoadingCities ||
                              selectedDestinations.length === 0 ||
                              !!citiesError
                            }
                            isSubmitting={isLoadingCities}
                          />
                        </FormControl>
                        <div className="min-h-[12px]">
                       <FormMessage />
                     </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <FormField
              control={control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
              name="tourType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOUR_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
              name="offerPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                    Featured Tour
                  </FormLabel>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Mark this tour as featured to highlight it on the website.
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
