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
  createDestinationFormSchema,
  updateDestinationFormSchema,
  CreateDestinationFormValues,
  UpdateDestinationFormValues,
} from "@/schemas/destination-form-schema";
import {
  Destination,
} from "@/types/destination";
import {
  BasicInfoSection,
  AdditionalInfoSection,
  GallerySection,
} from "./sections";
import { Tab } from "@/components/custom-ui/custom-tabs";
import { cn } from "@workspace/ui/lib/utils";

interface DestinationFormProps {
  mode?: "create" | "edit";
  initialData?: Destination;
  onSubmit: (
    data: CreateDestinationFormValues | UpdateDestinationFormValues
  ) => Promise<void>;
  isLoading?: boolean;
  trigger?: ReactNode;
  title: string;
  description: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const initialDestination: CreateDestinationFormValues = {
  name: "",
  content: null,
  featured: false,
  currency: "USD",
  bestSeasonStart: null,
  bestSeasonEnd: null,
  languages: [],
  cities: [],
  thumbnail: null,
  images: [],
  faqs: [],
};

const DestinationForm: FC<DestinationFormProps> = ({
  mode = "create",
  initialData,
  onSubmit,
  isLoading = false,
  trigger,
  title,
  description,
  open,
  onOpenChange,
}) => {
  const isEditMode = mode === "edit";
  const schema = isEditMode
    ? updateDestinationFormSchema
    : createDestinationFormSchema;
  const [activeTab, setActiveTab] = useState("basic-info");

  // Convert Destination to form values
  const convertDestinationToFormValues = (
    destination: Destination
  ): UpdateDestinationFormValues => {
    return {
      id: destination.id,
      name: destination.name,
      content: destination.content,
      featured: destination.featured,
      currency: destination.currency,
      bestSeasonStart: destination.bestSeasonStart,
      bestSeasonEnd: destination.bestSeasonEnd,
      languages: destination.languages || [],
      cities: destination.cities?.map((city: any) => city.name || city) || [],
      thumbnail: destination.thumbnail
        ? {
            id: destination.thumbnail.id,
            fileName: destination.thumbnail.fileName || "",
            bucketName: destination.thumbnail.bucketName || "",
            altText: destination.thumbnail.altText || undefined,
            url: destination.thumbnail.url || undefined,
          }
        : null,
      images:
        destination.images?.map((img) => ({
          id: img.id,
          fileName: img.fileName || "",
          bucketName: img.bucketName || "",
          altText: img.altText || undefined,
          url: img.url || undefined,
        })) || [],
      faqs:
        destination.faqs?.map((faq) => ({
          id: faq.id,
          question: faq.question || "",
          answer: faq.answer || "",
        })) || [],
    };
  };

  const form = useForm<
    CreateDestinationFormValues | UpdateDestinationFormValues
  >({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? initialData
        ? convertDestinationToFormValues(initialData)
        : initialDestination
      : initialDestination,
  });

  // Reset form when mode or initialData changes
  useEffect(() => {
    if (isEditMode && initialData) {
      const formValues = convertDestinationToFormValues(initialData);
      form.reset(formValues);
    } else if (!isEditMode) {
      form.reset(initialDestination);
    }
  }, [mode, initialData, form, isEditMode]);

  const handleSubmit = async (
    data: CreateDestinationFormValues | UpdateDestinationFormValues
  ) => {
    try {
      await onSubmit(data);
      // Only close dialog on successful submission
      onOpenChange?.(false);
    } catch (error) {
      // Keep dialog open on error
      console.error("Form submission failed:", error);
    }
  };

  console.log("form", form.getValues());

  const tabs: Tab[] = [
    {
      id: "basic-info",
      label: "Basic Information",
      content: <BasicInfoSection />,
    },
    {
      id: "additional-info",
      label: "Additional Information",
      content: <AdditionalInfoSection />,
    },
    {
      id: "gallery",
      label: "Gallery",
      content: <GallerySection />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
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
              id="destination-form"
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
            form="destination-form"
            className="min-w-24"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {isLoading || form.formState.isSubmitting ? (
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

export default DestinationForm;
