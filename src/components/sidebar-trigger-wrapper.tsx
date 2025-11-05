"use client";
import { SidebarTrigger } from "@mybackhub/shared-sidebar/components/ui/sidebar";
import Image from "next/image";
import { useMe } from "~/Contexts/meContext";

export function SidebarTriggerWrapper() {
  const { isLoading, subscriptionType } = useMe();

  const isLightTicket = subscriptionType === 1;
  const isFree = !subscriptionType || subscriptionType <= 0;

  if (isLoading || isLightTicket || isFree) {
    return null;
  }

  return (
    <SidebarTrigger
      logo={<Image src="/mbh-logo.png" alt="Logo" width={179} height={32} />}
    />
  );
}
