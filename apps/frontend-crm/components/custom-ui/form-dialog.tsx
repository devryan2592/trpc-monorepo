"use client";

import { FC, ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

interface FormDialogProps {
  // Add your props here
  title: string;
  description: string;
  trigger: ReactNode;
  children: ReactNode;
}

const FormDialog: FC<FormDialogProps> = ({
  title,
  description,
  trigger,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="p-0 max-w-7xl mx-auto" variant="fullscreen">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">{title}</DialogTitle>
          <DialogDescription className="px-6 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="overflow-hidden overflow-y-auto">
          {children}
        </DialogContent>
        <DialogFooter className="gap-2 px-6 py-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="min-w-24">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" className="min-w-24">
              Ok
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
