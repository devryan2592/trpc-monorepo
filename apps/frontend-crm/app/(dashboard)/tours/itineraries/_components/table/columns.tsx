"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Itinerary } from "@/types/itinerary";

// Actions cell component for itinerary operations
const ActionsCell = ({ itinerary }: { itinerary: Itinerary }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleView = () => {
    router.push(`/tours/itineraries/${itinerary.id}`);
  };

  const handleEdit = () => {
    router.push(`/tours/itineraries/${itinerary.id}/edit`);
  };

  const handleDelete = async () => {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Itinerary>[] = [
  {
    accessorKey: "name",
    header: "Tour Name",
    cell: ({ row }) => {
      const itinerary = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{itinerary.name}</span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {itinerary.content}
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
    accessorKey: "tour_category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("tour_category") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {category?.replace("-", " ") || "N/A"}
        </Badge>
      );
    },
    size: 120,
    minSize: 120,
  },
  {
    accessorKey: "tour_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("tour_type") as string;
      const getTypeColor = (type: string) => {
        switch (type) {
          case "luxury":
            return "bg-purple-100 text-purple-800";
          case "premium":
            return "bg-blue-100 text-blue-800";
          case "standard":
            return "bg-green-100 text-green-800";
          case "budget":
            return "bg-orange-100 text-orange-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };
      return (
        <Badge className={`capitalize ${getTypeColor(type || "")}`}>
          {type || "N/A"}
        </Badge>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{duration} days</span>
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: "actual_price",
    header: "Price",
    cell: ({ row }) => {
      const actualPrice = row.getValue("actual_price") as number;
      const offerPrice = row.original.offerPrice;
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {offerPrice ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-600">
                  ${offerPrice?.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${actualPrice?.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-medium">${actualPrice?.toFixed(2)}</span>
            )}
          </div>
          {offerPrice && (
            <Badge variant="destructive" className="text-xs w-fit">
              {Math.round(((actualPrice - offerPrice) / actualPrice) * 100)}%
              OFF
            </Badge>
          )}
        </div>
      );
    },
    size: 150,
    minSize: 150,
  },
  {
    accessorKey: "destinations",
    header: "Destinations",
    cell: ({ row }) => {
      const destinations = row.getValue("destinations") as Array<{
        destinationId: string;
        name: string;
      }>;
      return (
        <div className="flex flex-wrap gap-1">
          {destinations?.slice(0, 2).map((dest, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {dest.name}
            </Badge>
          ))}
          {destinations?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{destinations.length - 2} more
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
    cell: ({ row }) => <ActionsCell itinerary={row.original} />,
    size: 50,
    minSize: 50,
  },
];
