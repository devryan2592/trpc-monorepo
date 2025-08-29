"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

enum VerificationStatus {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.LOADING
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus(VerificationStatus.ERROR);
      setError("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        // Using the verifyEmail method from better-auth
        const response = await authClient.verifyEmail({
          query: {
            token,
          },
        });

        if (response.error) {
          setStatus(VerificationStatus.ERROR);
          setError(response.error.message || "Failed to verify email");
        } else {
          setStatus(VerificationStatus.SUCCESS);
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } catch (error) {
        setStatus(VerificationStatus.ERROR);
        setError("An unexpected error occurred. Please try again.");
        console.error(error);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {status === VerificationStatus.LOADING && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Please wait while we verify your email address
            </p>
          </div>
        )}

        {status === VerificationStatus.SUCCESS && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Your email has been verified successfully.
            </p>
          </div>
        )}

        {status === VerificationStatus.ERROR && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-center text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-2">
        {status === VerificationStatus.SUCCESS && (
          <p className="text-center text-sm text-muted-foreground">
            If not redirected automatically, <br />
            <Link href="/sign-in" className="text-primary hover:underline">
              click here
            </Link>{" "}
            to sign in.
          </p>
        )}

        {status === VerificationStatus.ERROR && (
          <Button variant="outline" onClick={() => router.push("/sign-in")}>
            Back to Sign In
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
