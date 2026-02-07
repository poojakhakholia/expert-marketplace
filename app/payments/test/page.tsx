"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TestPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ---------------- Load booking amount ---------------- */
  useEffect(() => {
    if (!bookingId) return;

    const loadBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("amount")
        .eq("id", bookingId)
        .single();

      if (error || !data) {
        alert("Failed to load booking");
        return;
      }

      setAmount(data.amount);
      setLoading(false);
    };

    loadBooking();
  }, [bookingId]);

  /* ---------------- Pay Now ---------------- */
  const payNow = async () => {
    if (!amount || !razorpayReady || !bookingId) {
      alert("Payment system not ready yet");
      return;
    }

    setProcessing(true);

    // 1. Create Razorpay order (✅ booking_id INCLUDED)
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        booking_id: bookingId,
      }),
    });

    if (!res.ok) {
      alert("Failed to create payment order");
      setProcessing(false);
      return;
    }

    const order = await res.json();

    // 2. Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount, // already in paise
      currency: "INR",
      name: "Callwithpro",
      description: "Expert Session",
      order_id: order.order_id,

      handler: async function (response: any) {
        console.log("RAZORPAY RESPONSE:", response);

        try {
          // 3. Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booking_id: bookingId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            alert("Payment succeeded but verification failed");
            setProcessing(false);
            return;
          }

          // 4. Redirect after success
          router.push("/account/orders");
        } catch (err) {
          console.error(err);
          alert("Unexpected error after payment");
          setProcessing(false);
        }
      },

      theme: {
        color: "#4B6EFF",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return <div className="p-10">Loading payment…</div>;
  }

  return (
    <>
      {/* Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <main className="p-10 max-w-xl">
        <h1 className="text-xl font-semibold mb-4">
          Test Razorpay Payment
        </h1>

        <p className="mb-6">
          Amount to pay: <strong>₹{amount}</strong>
        </p>

        <button
          onClick={payNow}
          disabled={!razorpayReady || processing}
          className={`px-6 py-3 rounded-lg text-white ${
            razorpayReady && !processing
              ? "bg-blue-600"
              : "bg-gray-400"
          }`}
        >
          {processing
            ? "Processing payment…"
            : razorpayReady
            ? `Pay ₹${amount}`
            : "Loading payment gateway…"}
        </button>
      </main>
    </>
  );
}
