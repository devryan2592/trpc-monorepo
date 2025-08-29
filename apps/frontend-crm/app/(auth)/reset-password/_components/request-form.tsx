"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import {
  ResetPasswordRequestRequest,
  ResetPasswordRequestRequestType,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

enum ResetStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export function RequestForm() {
  // Form for requesting password reset
  const requestForm = useForm<ResetPasswordRequestRequestType>({
    resolver: zodResolver(ResetPasswordRequestRequest),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting, isSubmitSuccessful },
    setError,
  } = requestForm;

  // Handle request password reset form submission
  async function onRequestSubmit(values: ResetPasswordRequestRequestType) {
    try {
      // Using the requestPasswordReset method from better-auth
      const response = await authClient.requestPasswordReset({
        email: values.email,
      });

      if (response.error) {
        setError("root.apiError", {
          message: response.error.message || "Failed to send reset email",
        });
      } else {
        requestForm.reset();
      }
    } catch (error) {
      setError("root.apiError", {
        message: "An unexpected error occurred. Please try again.",
      });
      console.error(error);
    }
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requestForm.formState.errors.root?.apiError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {requestForm.formState.errors.root.apiError.message}
          </div>
        )}
        {isSubmitSuccessful && (
          <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
            Password reset link has been sent to your email address. Please
            check your inbox.
          </div>
        )}
        <Form {...requestForm}>
          <form
            onSubmit={requestForm.handleSubmit(onRequestSubmit)}
            className="space-y-4"
          >
            <FormField
              control={requestForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </>
  );
}
