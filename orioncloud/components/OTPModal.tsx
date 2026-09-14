"use client";

import React, { useState } from "react";
import {useRouter} from "next/navigation"
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// The verification UI can use these props when it is implemented.
const OtpModal = ({
  email,
  accountId,
}: {
  accountId: string | null;
  email: string;
}) => {
    const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!accountId) {
      setErrorMessage("Missing account information. Please sign in again.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      //call API to verify OTP
      const sessionId = await verifySecret({ accountId, password });

      if(sessionId)
      {
        router.push("/");
      }
    } catch (error) {
      console.log("failed to verify OTP", error);
      setErrorMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await sendEmailOTP({email});
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent
        className="w-[calc(100%-2rem)] gap-7 rounded-2xl border-t-4 border-brand bg-gray-50 p-6 text-gray-900 shadow-xl data-[size=default]:max-w-md data-[size=default]:sm:max-w-md"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle className="w-full text-center text-2xl font-semibold tracking-tight">
            Check your email
          </AlertDialogTitle>
          <AlertDialogDescription className="w-full text-center leading-relaxed text-gray-600">
            Enter the verification code sent to
            <span className="mt-1 block break-all font-medium text-gray-900">
              {email}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <InputOTP
          maxLength={6}
          value={password}
          onChange={setPassword}
          aria-label="Verification code"
          disabled={isLoading}
          containerClassName="w-full justify-center"
        >
          <InputOTPGroup className="w-full justify-center gap-2 sm:gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-8 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-brand shadow-sm transition-colors data-[active=true]:border-brand data-[active=true]:ring-brand/25 sm:h-14 sm:w-11"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <AlertDialogFooter className="mx-0 mb-0 gap-3 rounded-none border-gray-200 bg-transparent px-0 pb-0 pt-5">
          <AlertDialogCancel className="h-11 flex-1 border-gray-300 bg-gray-200 font-medium text-gray-900 hover:bg-gray-300">
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || password.length !== 6 || !accountId}
            className="h-11 flex-1 bg-gray-900 font-semibold text-gray-50 hover:bg-gray-700"
          >
            {isLoading ? "Verifying..." : "Continue"}
          </Button>
        </AlertDialogFooter>
        <div className="flex flex-wrap items-center justify-center gap-x-2 text-sm text-gray-600">
          <span>Didn&apos;t get a code?</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
            onClick={handleResendOtp}
            disabled={isLoading}
          >
            Click to resend
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
