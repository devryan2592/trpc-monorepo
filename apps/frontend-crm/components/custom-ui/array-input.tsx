"use client";

import { FC, useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  displayValue?: boolean;
}

const ArrayInput: FC<ArrayInputProps> = ({
  value = [],
  onChange,
  placeholder = "Add an item",
  className,
  disabled = false,
  displayValue = true,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!inputValue.trim() || disabled) return;

    const newValue = [...value, inputValue.trim()];
    onChange(newValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      // Clear the input value after submission
    }
  };

  const handleRemove = (index: number) => {
    if (disabled) return;

    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input with submit button */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled}
          size="icon"
          className="px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Items container - hidden when empty */}
      {displayValue && value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">{item}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="text-muted-foreground hover:text-destructive h-auto p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArrayInput;
export type { ArrayInputProps };
