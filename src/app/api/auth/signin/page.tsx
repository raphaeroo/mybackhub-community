"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "~/components/loader";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    // Automatically redirect to SSO provider
    signIn("nsite", { callbackUrl });
  }, [callbackUrl]);

  return <Loader />
}