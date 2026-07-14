"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CartPanel } from "@/features/sales/components/CartPanel";
import { MenuGrid } from "@/features/sales/components/MenuGrid";
import { useCart } from "@/features/sales/hooks/useCart";
import { useMenu } from "@/features/sales/hooks/useMenu";
import { salesService } from "@/services/salesService";
import type { PaymentMethod, SaleChannel } from "@/types";
import { toast } from "@/utils/toast";

export function SalesContent() {
  const { recipes, loading } = useMenu();
  const { firebaseUser } = useAuth();
  const cart = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout(paymentMethod: PaymentMethod, channel: SaleChannel) {
    if (cart.lines.length === 0) return;
    setCheckingOut(true);
    try {
      await salesService.checkout({
        items: cart.lines.map((l) => ({
          recipeId: l.recipeId,
          recipeName: l.recipeName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          unitCost: l.unitCost,
        })),
        discount: cart.discount,
        serviceCharge: cart.serviceCharge,
        deliveryFee: cart.deliveryFee,
        paymentMethod,
        channel,
        actorEmail: firebaseUser?.email ?? "unknown",
      });
      toast.success("Order saved.");
      cart.clear();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save order.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      <div className="flex-1">
        <h1 className="mb-4 text-2xl font-semibold text-[var(--color-text)]">Sales</h1>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <MenuGrid recipes={recipes} onSelect={cart.addRecipe} />
        )}
      </div>

      <div className="w-full shrink-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:w-96">
        <CartPanel
          lines={cart.lines}
          onIncrement={cart.increment}
          onDecrement={cart.decrement}
          onRemove={cart.removeLine}
          discount={cart.discount}
          onDiscountChange={cart.setDiscount}
          serviceCharge={cart.serviceCharge}
          onServiceChargeChange={cart.setServiceCharge}
          deliveryFee={cart.deliveryFee}
          onDeliveryFeeChange={cart.setDeliveryFee}
          subtotal={cart.subtotal}
          total={cart.total}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
        />
      </div>
    </div>
  );
}
