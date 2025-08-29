"use client";

import DataTable from "@/components/data-table";
import { Card } from "@workspace/ui/components/card";
import { FC, useEffect, useState } from "react";
import { columns } from "./columns";
import { Itinerary } from "@/types/itinerary";
import { useQuery } from "@tanstack/react-query";

interface ItineraryDataTableProps {
  // Add your props here
  children?: React.ReactNode;
}

const ItineraryDataTable: FC<ItineraryDataTableProps> = ({ children }) => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["itineraries"],
    queryFn: () => [],
  });

  useEffect(() => {
    if (data) {
      setItineraries(data);
    }
  }, [data]);

  return (
    <DataTable data={itineraries} columns={columns} isLoading={isLoading} />
  );
};

export default ItineraryDataTable;
