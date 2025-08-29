"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import {
  ResetPasswordConfirmRequest,
  ResetPasswordConfirmRequestType,
} from "@workspace/trpc/schemas/auth";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { authClient } from "@/lib/auth-client";
import { useFormState } from "react-hook-form";

interface ConfirmFormProps {
  token: string;
}

export function ConfirmForm({ token }: ConfirmFormProps) {
  const router = useRouter();

  // Form for confirming password reset
  const confirmForm = useForm<ResetPasswordConfirmRequestType>({
    resolver: zodResolver(ResetPasswordConfirmRequest),
    defaultValues: {
      password: "testing123",
      confirmPassword: "testing123",
      token,
    },
  });

  const {
    setError,
    formState: { isSubmitting },
  } = confirmForm;

  async function onConfirmSubmit(values: ResetPasswordConfirmRequestType) {
    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: values.password,
        token: values.token,
      });
      if (error) {
        setError("root.apiError", {
          message: error.message || "Failed to reset password",
        });
        console.log("Auth error", error);
      } else {
        console.log("Auth response", data);
        router.push("/sign-in");
      }
    } catch (error) {
      setError("root.apiError", {
        message: "Failed to reset password",
      });
      console.error(error);
    }
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* {isLoading && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Please wait while we reset your password
            </p>
          </div>
        )}

        {!isLoading && error === null && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Your password has been reset successfully. You will be redirected
              to the sign-in page shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-center text-destructive">{error}</p>
          </div>
        )} */}
        <ErrorMessage control={confirmForm.control} />

        <Form {...confirmForm}>
          <form
            onSubmit={confirmForm.handleSubmit(onConfirmSubmit)}
            className="space-y-4"
          >
            <FormField
              control={confirmForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={confirmForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {/* {!isLoading && error === null && ( */}
        <p className="text-center text-sm text-muted-foreground">
          If not redirected automatically,{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            click here
          </Link>{" "}
          to sign in.
        </p>
        {/* )} */}
      </CardFooter>
    </>
  );
}

const ErrorMessage = ({
  control,
}: {
  control: Control<ResetPasswordConfirmRequestType>;
}) => {
  const {
    errors: { root },
  } = useFormState({ control });

  return (
    root?.apiError?.message && (
      <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
        {root.apiError.message}
      </div>
    )
  );
};
