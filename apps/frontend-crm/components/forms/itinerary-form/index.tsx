"use client";

import { FC, useEffect, ReactNode, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";

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
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import {
  createItineraryFormSchema,
  updateItineraryFormSchema,
} from "@/schemas/itinerary-form-schema";
import {
  CreateItineraryFormValues,
  UpdateItineraryFormValues,
  Itinerary,
} from "@/types/itinerary";
import {
  BasicInfoSection,
  ItineraryDaysSection,
  AdditionalInfoSection,
} from "./sections";
import { Tab } from "@/components/custom-ui/custom-tabs";
import { cn } from "@workspace/ui/lib/utils";
import { TourGallerySection } from "./sections/tour-gallery";

interface ItineraryFormProps {
  mode?: "create" | "edit";
  initialData?: Itinerary;
  onSubmit: (
    data: CreateItineraryFormValues | UpdateItineraryFormValues
  ) => void;
  isLoading?: boolean;
  trigger: ReactNode;
  title: string;
  description: string;
}

const initialItinerary: Omit<Itinerary, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  content: "",
  featured: false,
  duration: 0,
  tourType: "BUDGET",
  price: 0,
  offerPrice: 0,
  currency: "USD",
  destinations: [],
  cities: [],
  thumbnail: undefined,
  images: [],
  highlights: [],
  inclusions: [],
  exclusions: [],
  terms: [],
  faqs: [],
  itinerary: [],
};

const ItineraryForm: FC<ItineraryFormProps> = ({
  mode = "create",
  initialData,
  onSubmit,
  trigger,
  title,
  description,
}) => {
  const isEditMode = mode === "edit";
  const schema = isEditMode
    ? updateItineraryFormSchema
    : createItineraryFormSchema;
  const [activeTab, setActiveTab] = useState("basic-info");

  const form = useForm<CreateItineraryFormValues | UpdateItineraryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? initialData : initialItinerary,
  });

  // Reset form when mode or initialData changes
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset(initialData);
    } else if (!isEditMode) {
      form.reset(initialItinerary);
    }
  }, [mode, initialData, form, isEditMode]);

  const handleSubmit = (
    data: CreateItineraryFormValues | UpdateItineraryFormValues
  ) => {
    onSubmit(data);
  };

  console.log("form", form.getValues());

  const tabs: Tab[] = [
    {
      id: "basic-info",
      label: "Basic Information",
      content: <BasicInfoSection />,
    },
    {
      id: "itinerary-days",
      label: "Itinerary Days",
      content: <ItineraryDaysSection />,
    },
    {
      id: "additional-info",
      label: "Additional Information",
      content: <AdditionalInfoSection />,
    },
    {
      id: "gallery",
      label: "Gallery",
      content: <TourGallerySection />,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        variant="fullscreen"
        className="p-0 h-full max-w-7xl max-h-[90vh] m-auto"
      >
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">{title}</DialogTitle>
          <DialogDescription className="px-6 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          {/* Tab Navigation Only */}
          <div className="whitespace-nowrap min-h-12 h-12 shrink-0 mx-2 overflow-hidden">
            <div className="flex h-full items-center bg-accent overflow-x-auto px-1 custom-scrollbar gap-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center justify-center group hover:bg-background h-[80%] transition-colors",
                    activeTab === tab.id && "bg-background"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium cursor-pointer px-3 transition-colors",
                      activeTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ScrollArea className="text-sm min-h-[60vh] max-h-[80vh] my-2 ps-6 pe-5 me-1 ">
            <form
              id="itinerary-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1"
            >
              {/* Tab Content Inside ScrollArea */}
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </form>
          </ScrollArea>
        </FormProvider>

        {/* Fixed Footer */}
        <DialogFooter className="mt-auto gap-2 px-6 py-4 border-t border-border shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="min-w-24">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="itinerary-form"
            className="min-w-24"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryForm;
