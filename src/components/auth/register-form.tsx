"use client";

import { useState, type FocusEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Orbit,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AUTH_REQUEST_ACCESS_NOTE,
  AUTH_SELF_SERVICE_NOTE,
  LOGIN_ROLE_CONTENT,
  LOGIN_ROLE_OPTIONS,
  SYNTRA_ACCESS_REQUEST_HREF,
  SYNTRA_BRAND_NAME,
} from "@/lib/auth/presentation";
import { getSafeCallbackUrl } from "@/lib/auth/routing";
import { registerWithEmailPassword } from "@/services/auth-service";
import type { LoginRole } from "@/types/auth";
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormValues,
  type RegisterInput,
} from "@/validations/auth";

const DEFAULT_REGISTER_VALUES: RegisterFormValues = {
  role: "STUDENT",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function normalizeSelectedRole(value: unknown): LoginRole {
  return value === "FACULTY" ? "FACULTY" : "STUDENT";
}

type RegisterFormProps = {
  callbackUrl?: string | null;
};

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues, undefined, RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: DEFAULT_REGISTER_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const activeRole = normalizeSelectedRole(
    useWatch({
      control,
      name: "role",
      defaultValue: DEFAULT_REGISTER_VALUES.role,
    }),
  );
  const roleContent = LOGIN_ROLE_CONTENT[activeRole];

  function clearErrorState() {
    if (formError) {
      setFormError(null);
    }
  }

  function focusInvalidField(fieldErrors: FieldErrors<RegisterFormValues>) {
    if (fieldErrors.name) {
      setFocus("name");
      return;
    }

    if (fieldErrors.email) {
      setFocus("email");
      return;
    }

    if (fieldErrors.password) {
      setFocus("password");
      return;
    }

    if (fieldErrors.confirmPassword) {
      setFocus("confirmPassword");
    }
  }

  function normalizeField(
    field: "email" | "password" | "confirmPassword",
    event: FocusEvent<HTMLInputElement>,
  ) {
    const nextValue =
      field === "email"
        ? event.target.value.trim().toLowerCase()
        : event.target.value.trim();

    setValue(field, nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: RegisterFormInput) {
    clearErrorState();

    const payload: RegisterInput = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: "STUDENT",
    };

    const result = await registerWithEmailPassword(payload, {
      callbackUrl: safeCallbackUrl,
    });

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    toast.success("Account created successfully.");
    router.replace(result.redirectTo);
  }

  function onInvalid(fieldErrors: FieldErrors<RegisterFormValues>) {
    clearErrorState();
    focusInvalidField(fieldErrors);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-10"
    >
      <Card className="w-full max-w-xl border-border/80 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-6 border-b border-border/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
                <Orbit className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {SYNTRA_BRAND_NAME}
                </p>
                <p className="text-sm text-muted-foreground">
                  Role-aware onboarding
                </p>
              </div>
            </div>

            <Badge variant={activeRole === "STUDENT" ? "secondary" : "outline"}>
              {activeRole === "STUDENT" ? "Self-service" : "Provisioned access"}
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {activeRole === "STUDENT" ? "Create your student workspace" : "Faculty access"}
            </p>
            <h1 className="text-balance text-3xl">
              Join Syntra with institution-ready onboarding
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {roleContent.description}
            </p>
          </div>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSwitcher
                ariaLabel="Select sign-up role"
                value={normalizeSelectedRole(field.value)}
                options={LOGIN_ROLE_OPTIONS}
                disabled={isSubmitting}
                onValueChange={(nextValue) => {
                  clearErrorState();
                  field.onChange(nextValue);
                }}
              />
            )}
          />
        </CardHeader>

        <CardContent className="pt-6">
          {activeRole === "FACULTY" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-muted/50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <ShieldCheck className="size-4 text-foreground" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Faculty accounts are provisioned by institution owners.
                    </p>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {AUTH_REQUEST_ACCESS_NOTE}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild className="w-full">
                  <a href={SYNTRA_ACCESS_REQUEST_HREF}>
                    Request faculty access
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Go to sign in</Link>
                </Button>
              </div>

              <p className="text-center text-xs leading-5 text-muted-foreground">
                Student onboarding remains self-service. Faculty, reviewers, and institution admins are provisioned through governed access controls.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
              {formError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {formError}
                </div>
              ) : null}

              <div className="space-y-5">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <AuthInputField
                      id="name"
                      name={field.name}
                      type="text"
                      label="Full name"
                      placeholder="Aarav Sharma"
                      autoComplete="name"
                      value={field.value}
                      onChange={(event) => {
                        clearErrorState();
                        field.onChange(event);
                      }}
                      onBlur={field.onBlur}
                      error={errors.name?.message}
                      inputRef={field.ref}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <AuthInputField
                      id="email"
                      name={field.name}
                      type="email"
                      label="College email"
                      placeholder={roleContent.emailPlaceholder}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      value={field.value}
                      onChange={(event) => {
                        clearErrorState();
                        field.onChange(event);
                      }}
                      onBlur={(event) => {
                        field.onBlur();
                        normalizeField("email", event);
                      }}
                      error={errors.email?.message}
                      inputRef={field.ref}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <AuthInputField
                      id="password"
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      placeholder="Use at least 8 characters"
                      autoComplete="new-password"
                      value={field.value}
                      onChange={(event) => {
                        clearErrorState();
                        field.onChange(event);
                      }}
                      onBlur={(event) => {
                        field.onBlur();
                        normalizeField("password", event);
                      }}
                      error={errors.password?.message}
                      inputRef={field.ref}
                      disabled={isSubmitting}
                      trailingContent={
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                          onClick={() => setShowPassword((current) => !current)}
                          disabled={isSubmitting}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      }
                    />
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <AuthInputField
                      id="confirm-password"
                      name={field.name}
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm password"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      value={field.value}
                      onChange={(event) => {
                        clearErrorState();
                        field.onChange(event);
                      }}
                      onBlur={(event) => {
                        field.onBlur();
                        normalizeField("confirmPassword", event);
                      }}
                      error={errors.confirmPassword?.message}
                      inputRef={field.ref}
                      disabled={isSubmitting}
                      trailingContent={
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          disabled={isSubmitting}
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      }
                    />
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Use your institution-issued email. Passwords must include at least one uppercase letter, one lowercase letter, and one number.
                </p>
              </div>

              <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create student account"
                )}
              </Button>

              <div className="space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    className="font-medium text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-muted-foreground"
                    href="/auth/login"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {AUTH_SELF_SERVICE_NOTE}
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}
