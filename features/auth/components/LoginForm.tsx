"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  return z.object({
    email: z.string().email(t.auth.emailInvalid),
    password: z.string().min(6, t.auth.passwordMin),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function authErrorMessage(error: unknown, t: Translations): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return t.auth.errorInvalidCredential;
      case "auth/too-many-requests":
        return t.auth.errorTooManyRequests;
      case "auth/popup-closed-by-user":
        return t.auth.errorPopupClosed;
      default:
        return t.auth.errorGeneric;
    }
  }
  return t.auth.errorGeneric;
}

export function LoginForm() {
  const router = useRouter();
  const { status } = useAuth();
  const { t } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "forbidden") router.replace("/forbidden");
  }, [status, router]);

  async function onSubmit(values: FormValues) {
    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      toast.error(authErrorMessage(error, t));
    }
  }

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(authErrorMessage(error, t));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t.auth.email}
          type="email"
          autoComplete="email"
          placeholder={t.auth.emailPlaceholder}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t.auth.password}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
          {t.auth.signIn}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-sm text-[var(--color-text-muted)]">{t.auth.or}</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        loading={googleLoading}
        onClick={onGoogleSignIn}
        className="w-full"
      >
        {t.auth.continueWithGoogle}
      </Button>
    </div>
  );
}
