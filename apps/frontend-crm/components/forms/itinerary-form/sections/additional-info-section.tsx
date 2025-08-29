"use client";

import { FC, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Plus,
  X,
  HelpCircle,
  CheckCircle,
  XCircle,
  FileText,
  Star,
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CreateItineraryFormValues } from "@/types/itinerary";
import CustomTabs, { Tab } from "@/components/custom-ui/custom-tabs";
import ArrayInput from "@/components/custom-ui/array-input";
import { cn } from "@/lib/utils";

export const AdditionalInfoSection: FC = ({}) => {
  const { control, watch, setValue, getValues } =
    useFormContext<CreateItineraryFormValues>();
  const [activeTab, setActiveTab] = useState("highlights");

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: control,
    name: "faqs",
  });

  const watchedHighlights = watch("highlights") || [];
  const watchedInclusions = watch("inclusions") || [];
  const watchedExclusions = watch("exclusions") || [];
  const watchedTerms = watch("terms") || [];

  const addFaq = () => {
    appendFaq({ question: "", answer: "" });
  };

  // Tab content components
  const HighlightsTab = () => (
    <div className="p-4">
      <FormField
        control={control}
        name="highlights"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Tour Highlights
            </FormLabel>
            <FormControl>
              <ArrayInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Add a tour highlight"
              />
            </FormControl>
            <div className="min-h-[12px]">
                          <FormMessage />
                        </div>
          </FormItem>
        )}
      />
    </div>
  );

  const InclusionsTab = () => (
    <div className="p-4">
      <FormField
        control={control}
        name="inclusions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              What&apos;s Included
            </FormLabel>
            <FormControl>
              <ArrayInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Add an inclusion"
              />
            </FormControl>
            <div className="min-h-[12px]">
               <FormMessage />
             </div>
          </FormItem>
        )}
      />
    </div>
  );

  const ExclusionsTab = () => (
    <div className="p-4">
      <FormField
        control={control}
        name="exclusions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              What&apos;s Not Included
            </FormLabel>
            <FormControl>
              <ArrayInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Add an exclusion"
              />
            </FormControl>
            <div className="min-h-[12px]">
                <FormMessage />
              </div>
          </FormItem>
        )}
      />
    </div>
  );

  const TermsTab = () => (
    <div className="p-4">
      <FormField
        control={control}
        name="terms"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </FormLabel>
            <FormControl>
              <ArrayInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Add a term or condition"
              />
            </FormControl>
            <div className="min-h-[12px]">
                 <FormMessage />
               </div>
          </FormItem>
        )}
      />
    </div>
  );

  const FaqsTab = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium">Frequently Asked Questions</span>
        </div>
      </div>

      {faqFields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No FAQs added yet</p>
          <p className="text-sm">
            Add frequently asked questions about this destination
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">FAQ {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaq(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <FormField
                  control={control}
                  name={`faqs.${index}.question`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the question" {...field} />
                      </FormControl>
                      <div className="min-h-[12px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`faqs.${index}.answer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the answer"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-[12px]">
                            <FormMessage />
                          </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addFaq}
        className="w-full mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>
    </div>
  );

  const tabs: Tab[] = [
    {
      id: "highlights",
      label: "Highlights",
      content: <HighlightsTab />,
    },
    {
      id: "inclusions",
      label: "Inclusions",
      content: <InclusionsTab />,
    },
    {
      id: "exclusions",
      label: "Exclusions",
      content: <ExclusionsTab />,
    },
    {
      id: "terms",
      label: "Terms",
      content: <TermsTab />,
    },
    {
      id: "faqs",
      label: "FAQs",
      content: <FaqsTab />,
    },
  ];

  return (
    <Card className="flex-1 w-[95%] sm:w-full py-1 ">
      <CardContent className="p-0 m-0">
        <div className="whitespace-nowrap min-h-12 h-12 shrink-0 overflow-hidden">
          <div className="flex h-full items-center bg-accent overflow-x-auto custom-scrollbar gap-1 px-1 mx-1">
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

        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn("p-6", activeTab === tab.id ? "block" : "hidden")}
          >
            {tab.content}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
