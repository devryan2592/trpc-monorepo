"use client";
import { FC } from "react";
import { Button } from "@workspace/ui/components/button";
import ItineraryForm from "../forms/itinerary-form";
import {
  CreateItineraryFormValues,
  UpdateItineraryFormValues,
  Itinerary,
} from "@/types/itinerary";

interface ItineraryDialogProps {
  mode?: "create" | "edit";
  initialData?: Itinerary;
}

const ItineraryDialog: FC<ItineraryDialogProps> = ({
  mode = "create",
  initialData,
}) => {
  const handleSubmit = (
    data: CreateItineraryFormValues | UpdateItineraryFormValues
  ) => {
    console.log("handleSubmit", data);
  };
  if (mode === "create") {
    return (
      <ItineraryForm
        mode="create"
        trigger={<Button>Create Itinerary</Button>}
        title="Create Itinerary"
        description="Create a new itinerary"
        onSubmit={handleSubmit}
      />
    );
  }

  if (mode === "edit") {
    return (
      <ItineraryForm
        mode="edit"
        initialData={initialData}
        trigger={<Button variant="outline">Edit Itinerary</Button>}
        title="Edit Itinerary"
        description="Update the itinerary details"
        onSubmit={handleSubmit}
      />
    );
  }

  return null;
};

export default ItineraryDialog;
