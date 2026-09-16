"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import * as z from "zod";
import OtpModal from "@/components/OTPModal";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email.")
      .email("Please enter a valid email address."),
    fullName:
      formType === "sign-up"
        ? z
            .string()
            .trim()
            .min(2, "Full name must be at least 2 characters.")
            .max(50, "Full name must be at most 50 characters.")
        : z.string().trim(),
  });
};

export default function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);

  // VALIDATION: Full name is required only on sign-up.
  const formSchema = authFormSchema(type);
  const [submitted, setSubmitted] = useState(false);
  const formId = `auth-form-${type}`;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // DEFAULT VALUES: Add a starting value for each new field here (usually "").
    defaultValues: { email: "", fullName: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || " ",
              email: values.email,
            })
          : await signInUser({ email: values.email });
      if (!user?.accountId) {
        setErrorMessage(
          user?.error ||
            "Unable to send a verification code. Please try again.",
        );
        return;
      }
      setAccountId(user.accountId);
    } catch {
      setErrorMessage(
        type === "sign-up"
          ? "Failed to create an account. Please try again."
          : "Failed to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        id={formId}
        className="w-full max-w-sm space-y-6"
        noValidate
        onChange={() => setSubmitted(false)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>
        {/* Sign Up Fields */}
        {type === "sign-up" && (
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-full-name`}>
                  Full name
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-full-name`}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  className="h-11"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${formId}-full-name-error` : undefined
                  }
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-full-name-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        )}

        {/* SHARED FIELDS: Controllers here appear on both sign-in and sign-up. */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
              <Input
                {...field}
                id={`${formId}-email`}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="h-11"
                aria-invalid={fieldState.invalid}
                aria-describedby={`${formId}-help${fieldState.invalid ? ` ${formId}-error` : ""}`}
              />
              <FieldDescription id={`${formId}-help`}>
                {type === "sign-up"
                  ? "Enter your email to create your Orion Cloud account."
                  : "Enter the email for your Orion Cloud account."}
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
        {/* SIGN-IN ONLY: Add future fields here inside type === "sign-in" && (...). */}

        {/* SHARED SUBMIT BUTTON: Keep this below all your fields. */}
        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </Button>

        {errorMessage && (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="body-2 flex flex-wrap justify-center gap-x-2 gap-y-1">
          <p>
            {type === "sign-in"
              ? "Don't have an account? "
              : "Already have an account? "}
          </p>
          <Link
            className="font-semibold"
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
          >
            {type === "sign-in" ? "Sign Up" : "Sign In"}
          </Link>
        </div>

        {submitted && (
          <p role="status" className="text-sm text-gray-600">
            Form validated. Account authentication is not connected yet.
          </p>
        )}
      </form>
      {accountId && (
        <OtpModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
}
