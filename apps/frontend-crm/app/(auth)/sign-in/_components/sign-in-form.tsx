"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { SignInRequest, SignInRequestType } from "@workspace/trpc/schemas/auth";
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

export function SignInForm() {
  const router = useRouter();

  const form = useForm<SignInRequestType>({
    resolver: zodResolver(SignInRequest),
    defaultValues: {
      email: "test@test.com",
      password: "testing123",
    },
  });

  const {
    formState: { isSubmitting },
    setError,
  } = form;

  async function onSubmit(values: SignInRequestType) {
    try {
      const response = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setError("root.apiError", {
          message: response.error.message || "Failed to sign in",
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("root.apiError", {
        message: "An unexpected error occurred. Please try again.",
      });
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root?.apiError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {form.formState.errors.root.apiError.message}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          <a
            href="/reset-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
