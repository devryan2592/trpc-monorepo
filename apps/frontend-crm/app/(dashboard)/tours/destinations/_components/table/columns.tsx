"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import {
  Star,
  MapPin,
  Calendar,
  Languages,
} from "lucide-react";
import { Destination } from "@/types/destination";
import { ActionsCell } from "./actions";



export const columns: ColumnDef<Destination>[] = [
  {
    accessorKey: "name",
    header: "Destination Name",
    cell: ({ row }) => {
      const destination = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{destination.name}</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {destination.content}
          </span>
        </div>
      );
    },
    size: 250,
    minSize: 250,
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => {
      const featured = row.getValue("featured") as boolean;
      return featured ? (
        <Badge variant="primary" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          Featured
        </Badge>
      ) : (
        <Badge variant="secondary">Regular</Badge>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => {
      const currency = row.getValue("currency") as string;
      return (
        <Badge variant="outline" className="uppercase">
          {currency || "N/A"}
        </Badge>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "bestSeasonStart",
    header: "Best Season",
    cell: ({ row }) => {
      const start = row.getValue("bestSeasonStart") as string;
      const end = row.original.bestSeasonEnd;
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {start && end ? `${start} - ${end}` : start || end || "N/A"}
          </span>
        </div>
      );
    },
    size: 150,
    minSize: 150,
  },
  {
    accessorKey: "languages",
    header: "Languages",
    cell: ({ row }) => {
      const languages = row.getValue("languages") as string[];
      return (
        <div className="flex items-center gap-1">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {languages?.slice(0, 2).map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
            {languages?.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{languages.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      );
    },
    size: 180,
    minSize: 180,
  },
  {
    accessorKey: "cities",
    header: "Cities",
    cell: ({ row }) => {
      const cities = row.getValue("cities") as Array<{
        id?: string;
        name: string;
      }>;
      return (
        <div className="flex flex-wrap gap-1">
          {cities?.slice(0, 2).map((city, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {city.name}
            </Badge>
          ))}
          {cities?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{cities.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
    size: 200,
    minSize: 200,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
        </div>
      );
    },
    size: 120,
    minSize: 120,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell destination={row.original} />,
    size: 50,
    minSize: 50,
  },
];
