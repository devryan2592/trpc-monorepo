"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@workspace/ui/components/card";

import { RequestForm } from "./request-form";
import { ConfirmForm } from "./confirm-form";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isConfirmMode, setIsConfirmMode] = useState<boolean>(false);

  // Check if we have a token and set the mode accordingly
  useEffect(() => {
    if (token) {
      setIsConfirmMode(true);
    } else {
      setIsConfirmMode(false);
    }
  }, [token]);

  return (
    <Card className="w-full max-w-md mx-auto">
      {isConfirmMode ? <ConfirmForm token={token!} /> : <RequestForm />}
    </Card>
  );
}
