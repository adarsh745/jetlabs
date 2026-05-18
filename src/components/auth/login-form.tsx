"use client";

import {
  startTransition,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSafeCallbackUrl } from "@/lib/auth/routing";
import { loginWithEmailPassword } from "@/services/auth-service";
import {
  type LoginField,
  type LoginInput,
  type LoginValidationErrors,
  validateLoginField,
  validateLoginInput,
} from "@/validations";

const EMPTY_LOGIN_INPUT: LoginInput = {
  email: "",
  password: "",
};

function getLoginReasonMessage(reason: string | null) {
  switch (reason) {
    case "expired":
      return "Your session expired. Please sign in again.";
    case "unauthorized":
      return "Please sign in to continue.";
    default:
      return null;
  }
}

function setFieldError(
  current: LoginValidationErrors,
  field: LoginField,
  error?: string,
) {
  if (!error) {
    const next = { ...current };
    delete next[field];
    return next;
  }

  return {
    ...current,
    [field]: error,
  };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const loginReason = getLoginReasonMessage(searchParams.get("reason"));
  const [formData, setFormData] = useState<LoginInput>(EMPTY_LOGIN_INPUT);
  const [errors, setErrors] = useState<LoginValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(loginReason);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function focusField(field: LoginField | null) {
    if (field === "email") {
      emailRef.current?.focus();
      return;
    }

    if (field === "password") {
      passwordRef.current?.focus();
    }
  }

  function handleChange(field: LoginField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setFormData((current) => ({
        ...current,
        [field]: nextValue,
      }));

      setErrors((current) => setFieldError(current, field));
      setFormError(null);
    };
  }

  function handleBlur(field: LoginField) {
    return () => {
      const nextData = {
        ...formData,
        [field]: formData[field].trim(),
      };

      setFormData(nextData);
      setErrors((current) =>
        setFieldError(current, field, validateLoginField(field, nextData)),
      );
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateLoginInput(formData);
    setFormData(validation.data);

    if (!validation.success) {
      setErrors(validation.errors);
      setFormError(null);
      focusField(validation.firstField);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const result = await loginWithEmailPassword(validation.data, {
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.message);

      if (
        result.code === "NETWORK_ERROR" ||
        result.code === "SERVER_ERROR" ||
        result.code === "UNKNOWN_ERROR"
      ) {
        toast.error(result.message);
      }

      if (result.code === "INVALID_CREDENTIALS") {
        passwordRef.current?.focus();
      }

      return;
    }

    toast.success("Signed in successfully.");
    startTransition(() => {
      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Sparkles className="size-5" />
          </div>
          <span className="font-medium">Syntra</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl leading-tight tracking-tight">
            Run real projects.
            <br />
            Publish real research.
          </h1>
          <p className="text-white/70">
            Syntra gives authenticated students, faculty, and admins one shared
            workspace for execution tracking, review workflows, and research
            delivery.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            <LoginStat
              icon={<BookOpen className="size-4" />}
              value="Protected"
              label="Workflows"
            />
            <LoginStat
              icon={<ShieldCheck className="size-4" />}
              value="Role-based"
              label="Access"
            />
            <LoginStat
              icon={<Sparkles className="size-4" />}
              value="Real"
              label="Sessions"
            />
          </div>
        </div>

        <p className="text-xs text-white/40">
          Access is determined by your account permissions after sign-in.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-border/70 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="mb-1 flex items-center gap-2 lg:hidden">
              <Sparkles className="size-5" />
              <span className="font-medium">Syntra</span>
            </div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your authorized account email and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formError}
                </div>
              ) : null}

              <AuthInputField
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="you@college.edu"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                error={errors.email}
                inputRef={emailRef}
                disabled={isSubmitting}
              />

              <AuthInputField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={errors.password}
                inputRef={passwordRef}
                disabled={isSubmitting}
                trailingContent={
                  <button
                    type="button"
                    className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none"
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

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Need access or password help? Contact your program administrator.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl">{value}</div>
    </div>
  );
}
