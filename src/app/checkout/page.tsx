"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { authRequest } from "@/lib/auth";
import { getCurrentPrice, getVariantSummary } from "@/lib/cart";

type FulfillmentMethod = "PICKUP" | "DELIVERY";
type PaymentMethod = "CARD" | "PAY_ON_ARRIVAL";
type SubmittedOrder = {
  id: string;
  receiptEmail: string;
  items: {
    productId: string;
    productName: string;
    productImageUrl?: string;
    unitPrice: number;
    currency: string;
    quantity: number;
  }[];
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  contactPhone: string;
  notes: string;
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { token, user } = useAuth();
  const { convertPrice, formatPrice, formatSelectedAmount } = useCurrency();
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [pickupLocation, setPickupLocation] = useState("Campus Store");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardLast4 = cardNumber.replace(/\D/g, "").slice(-4);
  const guestEmailTrimmed = guestEmail.trim();
  const guestEmailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    guestEmailTrimmed,
  );
  const receiptEmail = user?.email ?? guestEmailTrimmed;
  const canSubmit =
    items.length > 0 &&
    !isSubmitting &&
    (user ? true : guestEmailTrimmed.length > 0 && guestEmailIsValid);
  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.id,
        productName: item.name,
        productImageUrl: item.image,
        unitPrice: getCurrentPrice(item.pricing),
        currency: item.pricing.currency,
        quantity: item.quantity,
      })),
    [items],
  );
  const checkoutItemsPayload = useMemo(
    () =>
      orderItems.map(
        ({ productId, productName, productImageUrl, unitPrice, quantity }) => ({
          productId,
          productName,
          productImageUrl,
          unitPrice,
          quantity,
        }),
      ),
    [orderItems],
  );
  const displayedSubtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          convertPrice(
            getCurrentPrice(item.pricing) * item.quantity,
            item.pricing.currency,
          ),
        0,
      ),
    [convertPrice, items],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (paymentMethod === "CARD" && cardLast4.length !== 4) {
      setError("Please enter valid card details.");
      return;
    }

    if (!user && !guestEmailIsValid) {
      setError("Please enter a valid email so we can send order details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutPath = token ? "/cart/checkout" : "/cart/guest-checkout";
      const checkoutDetails = {
        fulfillmentMethod,
        paymentMethod,
        pickupLocation: fulfillmentMethod === "PICKUP" ? pickupLocation : undefined,
        deliveryAddress:
          fulfillmentMethod === "DELIVERY" ? deliveryAddress : undefined,
        contactPhone,
        notes,
        cardholderName: paymentMethod === "CARD" ? cardholderName : undefined,
        cardLast4: paymentMethod === "CARD" ? cardLast4 : undefined,
      };
      const response = await authRequest<{
        order: { id: string };
        message?: string;
        receiptEmail?: string;
      }>(checkoutPath, {
        method: "POST",
        token,
        body: token
          ? {
              ...checkoutDetails,
              items: checkoutItemsPayload,
            }
          : {
              email: guestEmailTrimmed,
              ...checkoutDetails,
              items: checkoutItemsPayload,
            },
      });
      const usedReceiptEmail = response.receiptEmail ?? receiptEmail;
      clearCart();
      setSuccessMessage(`Order #${response.order.id} submitted successfully.`);
      setSubmittedOrder({
        id: response.order.id,
        receiptEmail: usedReceiptEmail,
        items: orderItems,
        fulfillmentMethod,
        paymentMethod,
        contactPhone,
        notes,
      });
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedOrder) {
    return (
      <section className="bg-surface py-12 md:py-16">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Order confirmed
            </p>
            <h1 className="mt-3 text-4xl font-black text-sgu-navy md:text-5xl">
              Thank you for your order!
            </h1>
            <p className="mt-4 text-base text-slate-700 md:text-lg">
              We sent your order details to{" "}
              <span className="font-bold text-sgu-navy">
                {submittedOrder.receiptEmail}
              </span>
              {user ? ` (logged in as ${user.email}).` : "."}
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-sgu-navy">
                Order #{submittedOrder.id}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {submittedOrder.fulfillmentMethod === "PICKUP"
                  ? "Pickup"
                  : "Delivery"}{" "}
                •{" "}
                {submittedOrder.paymentMethod === "CARD"
                  ? "Card payment"
                  : "Pay on arrival"}
              </p>
              {submittedOrder.contactPhone ? (
                <p className="mt-1 text-sm text-slate-600">
                  Contact: {submittedOrder.contactPhone}
                </p>
              ) : null}
              {submittedOrder.notes ? (
                <p className="mt-1 text-sm text-slate-600">
                  Notes: {submittedOrder.notes}
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-sgu-navy">Order details</h2>
              <div className="mt-4 space-y-3">
                {submittedOrder.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <p className="text-slate-700">
                      {item.productName} × {item.quantity}
                    </p>
                    <p className="font-bold text-sgu-navy">
                      {formatPrice(item.unitPrice * item.quantity, item.currency)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-black text-sgu-navy">
                <span>Total</span>
                <span>
                  {formatSelectedAmount(
                    submittedOrder.items.reduce(
                      (total, item) =>
                        total +
                        convertPrice(
                          item.unitPrice * item.quantity,
                          item.currency,
                        ),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/store"
                className="inline-flex w-full items-center justify-center rounded-xl bg-sgu-navy px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-sgu-turquoise sm:w-auto"
              >
                View store
              </Link>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-sgu-navy transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-8 sm:py-10 md:py-16">
      <div className="container-shell">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Checkout
          </p>
          <h1 className="mt-2 text-2xl font-bold text-sgu-navy sm:text-3xl">
            Complete your order
          </h1>
          <p className="mt-3 max-w-2xl text-sgu-gray">
            Choose pickup or delivery, then pay now by card or pay when you
            arrive.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]"
        >
          <div className="space-y-6">
            <div className="card-surface p-4 sm:p-6">
              <h2 className="text-xl font-bold text-sgu-navy">Fulfillment</h2>
              {!user ? (
                <label className="mt-5 block">
                  <span className="text-sm font-bold text-sgu-navy">
                    Email for order confirmation
                  </span>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                  />
                </label>
              ) : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(["PICKUP", "DELIVERY"] as const).map((method) => (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                      fulfillmentMethod === method
                        ? "border-sgu-turquoise bg-sgu-turquoise/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value={method}
                      checked={fulfillmentMethod === method}
                      onChange={() => setFulfillmentMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-bold text-sgu-navy">
                      {method === "PICKUP" ? "Pickup" : "Delivery"}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {method === "PICKUP"
                        ? "Collect your order at the campus store."
                        : "Have your order delivered on campus."}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {fulfillmentMethod === "PICKUP" ? (
                  <label className="block">
                    <span className="text-sm font-bold text-sgu-navy">
                      Pickup location
                    </span>
                    <select
                      value={pickupLocation}
                      onChange={(event) =>
                        setPickupLocation(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    >
                      <option>Campus Store</option>
                      <option>Student Center Desk</option>
                      <option>Library Pickup Point</option>
                    </select>
                  </label>
                ) : (
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-sgu-navy">
                      Delivery address
                    </span>
                    <textarea
                      required={fulfillmentMethod === "DELIVERY"}
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      rows={3}
                      placeholder="Dorm, building, room number, or campus office"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-bold text-sgu-navy">
                    Contact phone
                  </span>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                  />
                </label>
              </div>
            </div>

            <div className="card-surface p-4 sm:p-6">
              <h2 className="text-xl font-bold text-sgu-navy">Payment</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(["CARD", "PAY_ON_ARRIVAL"] as const).map((method) => (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                      paymentMethod === method
                        ? "border-sgu-turquoise bg-sgu-turquoise/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-bold text-sgu-navy">
                      {method === "CARD" ? "Card payment" : "Pay on arrival"}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {method === "CARD"
                        ? "Enter card details for this order."
                        : "Pay when you pick up or receive delivery."}
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === "CARD" ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-sgu-navy">
                      Cardholder name
                    </span>
                    <input
                      required={paymentMethod === "CARD"}
                      value={cardholderName}
                      onChange={(event) =>
                        setCardholderName(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-sgu-navy">
                      Card number
                    </span>
                    <input
                      required={paymentMethod === "CARD"}
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-sgu-navy">
                      Expiry
                    </span>
                    <input
                      required={paymentMethod === "CARD"}
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-sgu-navy">CVV</span>
                    <input
                      required={paymentMethod === "CARD"}
                      inputMode="numeric"
                      value={securityCode}
                      onChange={(event) => setSecurityCode(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-sgu-light-turquoise/30 p-4 text-sm font-semibold text-sgu-navy">
                  No card will be charged now. Bring your preferred payment
                  method when your order is ready.
                </p>
              )}
            </div>

            <div className="card-surface p-4 sm:p-6">
              <label className="block">
                <span className="text-sm font-bold text-sgu-navy">
                  Order notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Any pickup, delivery, or substitution notes"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-sgu-gray outline-none focus:border-sgu-turquoise"
                />
              </label>
            </div>
          </div>

          <aside className="card-surface h-fit p-4 sm:p-6 lg:sticky lg:top-[calc(var(--app-header-height)+1rem)]">
            <h2 className="text-xl font-bold text-sgu-navy">Order summary</h2>

            <div className="mt-5 space-y-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-wrap gap-3 border-b border-slate-100 pb-4 sm:flex-nowrap"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-bold text-sgu-navy">
                        {item.name}
                      </p>
                      {getVariantSummary(item.variantSelection) ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {getVariantSummary(item.variantSelection)}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-slate-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="ml-auto text-right font-bold text-sgu-navy">
                      {formatPrice(
                        getCurrentPrice(item.pricing) * item.quantity,
                        item.pricing.currency,
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Your cart is empty.
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between text-lg font-black text-sgu-navy">
              <span>Total</span>
              <span>{formatSelectedAmount(displayedSubtotal)}</span>
            </div>

            {user ? (
              <p className="mt-3 text-xs text-slate-500">
                Checking out as {user.email}
              </p>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Checking out as guest.{" "}
                <Link href="/account" className="font-semibold text-sgu-navy">
                  Sign in
                </Link>{" "}
                to save your details for next time.
              </p>
            )}

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-sgu-red">
                {error}
              </p>
            ) : null}

            {successMessage ? (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-xl bg-sgu-navy px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sgu-turquoise disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Submitting order..." : "Place order"}
            </button>

            <Link
              href="/store"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-sgu-navy transition-colors hover:bg-slate-50"
            >
              Continue shopping
            </Link>
          </aside>
        </form>
      </div>
    </section>
  );
}
