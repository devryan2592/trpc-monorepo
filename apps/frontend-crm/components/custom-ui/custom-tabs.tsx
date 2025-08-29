"use client";

import { FC, ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const CustomTabs: FC<CustomTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tab Navigation */}
      <div className="whitespace-nowrap min-h-12 h-12 shrink-0 mx-2 overflow-hidden">
        <div className="flex h-full items-center bg-accent overflow-x-auto px-1 custom-scrollbar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center justify-center group hover:bg-background h-[80%] transition-colors",
                activeTab === tab.id && "bg-background"
              )}
              onClick={() => onTabChange(tab.id)}
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

      {/* Tab Content */}
      <div className="flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "transition-opacity duration-200",
              activeTab === tab.id ? "block" : "hidden"
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomTabs;
export type { Tab, CustomTabsProps };
