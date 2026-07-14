"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PAYMENT_METHODS, SALE_CHANNELS } from "@/constants";
import type { CartLine } from "@/features/sales/hooks/useCart";
import type { PaymentMethod, SaleChannel } from "@/types";
import { formatCurrency } from "@/utils/format";

export interface CartPanelProps {
  lines: CartLine[];
  onIncrement: (recipeId: string) => void;
  onDecrement: (recipeId: string) => void;
  onRemove: (recipeId: string) => void;
  discount: number;
  onDiscountChange: (value: number) => void;
  serviceCharge: number;
  onServiceChargeChange: (value: number) => void;
  deliveryFee: number;
  onDeliveryFeeChange: (value: number) => void;
  subtotal: number;
  total: number;
  onCheckout: (paymentMethod: PaymentMethod, channel: SaleChannel) => void;
  checkingOut: boolean;
}

export function CartPanel({
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  discount,
  onDiscountChange,
  serviceCharge,
  onServiceChargeChange,
  deliveryFee,
  onDeliveryFeeChange,
  subtotal,
  total,
  onCheckout,
  checkingOut,
}: CartPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [channel, setChannel] = useState<SaleChannel>("Walk-in");

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[var(--color-text-muted)]" />
        <h2 className="font-semibold text-[var(--color-text)]">Current Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {lines.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">Tap a menu item to add it.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.recipeId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{line.recipeName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{formatCurrency(line.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="secondary" size="icon" className="h-8 w-8" aria-label={`Decrease ${line.recipeName}`} onClick={() => onDecrement(line.recipeId)}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums text-[var(--color-text)]">{line.quantity}</span>
                  <Button variant="secondary" size="icon" className="h-8 w-8" aria-label={`Increase ${line.recipeName}`} onClick={() => onIncrement(line.recipeId)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text)]">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Remove ${line.recipeName}`} onClick={() => onRemove(line.recipeId)}>
                  <Trash2 className="h-3.5 w-3.5 text-[var(--color-danger)]" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="grid grid-cols-3 gap-2">
          <Input label="Discount" type="number" min={0} step="0.01" value={discount} onChange={(e) => onDiscountChange(Number(e.target.value) || 0)} />
          <Input label="Service" type="number" min={0} step="0.01" value={serviceCharge} onChange={(e) => onServiceChargeChange(Number(e.target.value) || 0)} />
          <Input label="Delivery" type="number" min={0} step="0.01" value={deliveryFee} onChange={(e) => onDeliveryFeeChange(Number(e.target.value) || 0)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select label="Payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value as SaleChannel)}>
            {SALE_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[var(--color-text)]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button size="lg" className="w-full" disabled={lines.length === 0} loading={checkingOut} onClick={() => onCheckout(paymentMethod, channel)}>
          Save Order
        </Button>
      </div>
    </div>
  );
}
