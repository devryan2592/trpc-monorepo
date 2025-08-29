"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { SignUpRequest, SignUpRequestType } from "@workspace/trpc/schemas/auth";
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

export function SignUpForm() {
  const router = useRouter();

  const form = useForm<SignUpRequestType>({
    resolver: zodResolver(SignUpRequest),
    defaultValues: {
      name: "test",
      email: "test@test.com",
      password: "testing123",
      confirmPassword: "testing123",
    },
  });

  const {
    formState: { isSubmitting },
    setError,
  } = form;

  async function onSubmit(values: SignUpRequestType) {
    try {
      const response = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setError("root.apiError", {
          message: response.error.message || "Failed to sign up",
        });
      } else {
        // router.push("/admin-dashboard/sign-in");
        console.log("Auth response", response);
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
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              control={form.control}
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
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
