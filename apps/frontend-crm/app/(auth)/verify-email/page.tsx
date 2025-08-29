import { Metadata } from "next";

import { VerifyEmailForm } from "./_components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email | ST Holidays",
  description: "Verify your email address for ST Holidays",
};

export default function VerifyEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <VerifyEmailForm />
      </div>
    </div>
  );
}