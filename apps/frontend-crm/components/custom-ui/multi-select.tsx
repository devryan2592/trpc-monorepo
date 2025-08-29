import React, { useState, useMemo } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@workspace/ui/components/command";
import { Badge } from "@workspace/ui/components/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface MultiSelectProps<T> {
  items: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  onChange?: (selected: T[]) => void;
  selectedItems?: T[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
}

function MultiSelect<T extends { id: string }>({
  items,
  getLabel,
  getValue,
  onChange,
  selectedItems,
  label,
  placeholder = "Search...",
  disabled = false,
  isSubmitting = false,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<T[]>(selectedItems || []);

  React.useEffect(() => {
    setSelected(selectedItems || []);
  }, [selectedItems]);

  const availableItems = useMemo(
    () =>
      items.filter(
        (item) => !selected.some((s) => getValue(s) === getValue(item))
      ),
    [items, selected, getValue]
  );

  const handleSelect = (item: T) => {
    if (!selected.some((s) => getValue(s) === getValue(item))) {
      const newSelected = [...selected, item];
      setSelected(newSelected);
      if (onChange) {
        onChange(newSelected);
      }
      setOpen(false);
    }
  };

  const handleRemove = (item: T) => {
    const newSelected = selected.filter((s) => getValue(s) !== getValue(item));
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "relative w-full justify-between ",
              disabled && "opacity-50 cursor-not-allowed",
              isSubmitting && "cursor-not-allowed"
            )}
            disabled={disabled || isSubmitting}
          >
            {selected.length === 0 && (
              <span className="text-sm">Please select {label || "items"}</span>
            )}
            {selected.length > 0 && (
              <span className="text-sm">
                {selected.length} {label || "items"} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="PopoverContent p-0">
          <Command>
            <CommandInput placeholder={placeholder} disabled={disabled} />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {availableItems.map((item) => (
                  <CommandItem
                    key={getValue(item)}
                    onSelect={() => {
                      handleSelect(item);
                    }}
                    disabled={disabled}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.some((s) => getValue(s) === getValue(item))
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {getLabel(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {selected.map((field, index) => (
          <Badge
            key={getValue(field)}
            variant="outline"
            className="gap-0 rounded-md px-2 py-1"
          >
            {getLabel(field)}
            <button
              className="text-xs focus-visible:border-ring focus-visible:ring-ring/50 text-foreground/60 hover:text-foreground -my-[5px] -ms-0.5 -me-2 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
              onClick={() => handleRemove(field)}
              aria-label="Delete"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default MultiSelect;
