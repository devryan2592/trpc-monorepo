"use client";

import DataTable from "@/components/data-table";
import { FC, useState } from "react";
import { columns } from "./columns";
import { useDestinations } from "@/hooks/use-destinations";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface DestinationDataTableProps {
  children?: React.ReactNode;
}

const DestinationDataTable: FC<DestinationDataTableProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useDestinations(debouncedSearchQuery);

  const destinations = data?.destinations || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-destructive">
          Error loading destinations: {error.message}
        </div>
      )}
      
      <DataTable 
        data={destinations} 
        columns={columns} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default DestinationDataTable;