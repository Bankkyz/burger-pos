"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { buildPromptPayPayload } from "@/utils/promptpay";

export interface PromptPayQrProps {
  promptPayId: string;
  amount?: number;
  size?: number;
}

export function PromptPayQr({ promptPayId, amount, size = 200 }: PromptPayQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!promptPayId) return;
    let cancelled = false;
    QRCode.toDataURL(buildPromptPayPayload(promptPayId, amount), { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((error) => console.error("[PromptPayQr]", error));
    return () => {
      cancelled = true;
    };
  }, [promptPayId, amount, size]);

  if (!promptPayId) return null;

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-2)]" />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- client-generated data: URL, not an optimizable remote/static asset
  return <img src={dataUrl} alt="PromptPay QR code" width={size} height={size} className="rounded-[var(--radius-md)]" />;
}
