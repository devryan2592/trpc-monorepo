"use client";
import { FC, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import DestinationForm from "../forms/destination-form";
import {
  CreateDestinationFormValues,
  UpdateDestinationFormValues,
  Destination,
  CreateDestinationInput,
  UpdateDestinationInput,
} from "@/types/destination";
import {
  useCreateDestination,
  useUpdateDestination,
} from "@/hooks/use-destinations";
import { toast } from "sonner";

interface DestinationDialogProps {
  mode?: "create" | "edit";
  initialData?: Destination;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const DestinationDialog: FC<DestinationDialogProps> = ({
  mode = "create",
  initialData,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  hideTrigger = false,
}) => {
  const createMutation = useCreateDestination();
  const updateMutation = useUpdateDestination();

  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  const handleSubmit = async (
    data: CreateDestinationFormValues | UpdateDestinationFormValues
  ): Promise<void> => {
    if (mode === "create") {
      // Convert form data to tRPC input format
      const createData: CreateDestinationInput = {
        name: data.name || "",
        content: data.content || undefined,
        featured: data.featured,
        currency: data.currency || undefined,
        bestSeasonStart: data.bestSeasonStart || undefined,
        bestSeasonEnd: data.bestSeasonEnd || undefined,
        languages: data.languages || [],
        cities: data.cities?.map((cityName) => ({ name: cityName })) || [],
        thumbnail: data.thumbnail ? {
          bucketName: data.thumbnail.bucketName,
          fileName: data.thumbnail.fileName,
          altText: data.thumbnail.altText,
        } : undefined,
        images: data.images?.map((img) => ({
          bucketName: img.bucketName,
          fileName: img.fileName,
          altText: img.altText,
        })) || [],
        faqs: data.faqs?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })) || [],
      };
      await createMutation.mutateAsync(createData);
    } else if (mode === "edit" && initialData) {
      // Convert form data to tRPC input format
      const updateData: Partial<UpdateDestinationInput> = {
        name: data.name,
        content: data.content || undefined,
        featured: data.featured,
        currency: data.currency || undefined,
        bestSeasonStart: data.bestSeasonStart || undefined,
        bestSeasonEnd: data.bestSeasonEnd || undefined,
        languages: data.languages || [],
        cities: data.cities?.map((cityName) => ({ name: cityName })) || [],
        thumbnail: data.thumbnail ? {
          bucketName: data.thumbnail.bucketName,
          fileName: data.thumbnail.fileName,
          altText: data.thumbnail.altText,
        } : null,
        images: data.images?.map((img) => ({
          bucketName: img.bucketName,
          fileName: img.fileName,
          altText: img.altText,
        })) || [],
        faqs: data.faqs?.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })) || [],
      };
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: updateData,
      });
    }
  };

  const handleError = (error: unknown) => {
    console.error("Error submitting destination:", error);
    // Toast notifications are handled by the hooks
    // Don't close dialog on error - this is handled by the form component
  };

  const wrappedHandleSubmit = async (
    data: CreateDestinationFormValues | UpdateDestinationFormValues
  ): Promise<void> => {
    try {
      await handleSubmit(data);
    } catch (error) {
      handleError(error);
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  if (mode === "create") {
    return (
      <DestinationForm
        mode="create"
        trigger={hideTrigger ? undefined : <Button>Create Destination</Button>}
        title="Create Destination"
        description="Create a new destination"
        onSubmit={wrappedHandleSubmit}
        isLoading={createMutation.isPending}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    );
  }

  if (mode === "edit") {
    return (
      <DestinationForm
        mode="edit"
        initialData={initialData}
        trigger={hideTrigger ? undefined : <Button variant="outline">Edit Destination</Button>}
        title="Edit Destination"
        description="Update the destination details"
        onSubmit={wrappedHandleSubmit}
        isLoading={updateMutation.isPending}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    );
  }

  return null;
};

export default DestinationDialog;
