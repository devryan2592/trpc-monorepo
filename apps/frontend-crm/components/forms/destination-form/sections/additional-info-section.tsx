"use client";

import { FC, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
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
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Plus, X, Languages, HelpCircle } from "lucide-react";
import { CreateDestinationFormValues } from "@/schemas/destination-form-schema";

const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Nepali",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Russian",
  "Dutch",
  "Swedish",
];

export const AdditionalInfoSection: FC = () => {
  const { control, watch, setValue } = useFormContext<CreateDestinationFormValues>();
  const [newLanguage, setNewLanguage] = useState("");

  const languages = watch("languages") || [];

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faqs",
  });

  const addLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      setValue("languages", [...languages, language], { shouldValidate: true });
    }
    setNewLanguage("");
  };

  const removeLanguage = (languageToRemove: string) => {
    setValue(
      "languages",
      languages.filter((lang) => lang !== languageToRemove),
      { shouldValidate: true }
    );
  };

  const addFaq = () => {
    appendFaq({
      question: "",
      answer: "",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Languages Section */}
      <Card>
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          {/* Current Languages */}
          {languages.length > 0 && (
            <div className="space-y-2">
              <FormLabel>Selected Languages</FormLabel>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {language}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeLanguage(language)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Language */}
          <div className="space-y-3">
            <FormLabel>Add Language</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Enter language"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage(newLanguage);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addLanguage(newLanguage)}
                disabled={!newLanguage || languages.includes(newLanguage)}
                className="mt-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Languages */}
            <div className="space-y-2">
              <FormLabel className="text-sm text-muted-foreground">
                Common Languages
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.filter(
                  (lang) => !languages.includes(lang)
                ).map((language) => (
                  <Button
                    key={language}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addLanguage(language)}
                    className="h-7 text-xs"
                  >
                    {language}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs Section */}
      <Card>
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
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
                <div
                  key={field.id}
                  className="border rounded-lg p-3 sm:p-4 space-y-3"
                >
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
                            <Input
                              placeholder="Enter the question"
                              {...field}
                            />
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
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
