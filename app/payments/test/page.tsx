"use client";

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* 🔹 helper: generate order code */
function generateOrderCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `A-${num}`;
}

/* 🔹 WRAPPER (required for useSearchParams) */
export default function TestPaymentPage() {
  return (
    <Suspense fallback={<div className="intella-page p-10">Loading payment…</div>}>
      <TestPaymentContent />
    </Suspense>
    );
  }

  /* 🔹 ACTUAL PAGE */
function TestPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* 🔹 Booking intent (from previous page) */
  const expertId = searchParams.get("expert_id");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const duration = Number(searchParams.get("duration"));

  const [amount, setAmount] = useState<number | null>(null);
  const [expert, setExpert] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* 🔹 NEW: Optional user message */
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const MAX_MESSAGE_LENGTH = 500;

  /* ---------------- Load expert + amount ---------------- */
  useEffect(() => {
    if (!expertId || !duration) return;

    const loadExpert = async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("user_id, fee_15, fee_30, fee_45, fee_60")
        .eq("user_id", expertId)
        .single();

      if (error || !data) {
        alert("Failed to load expert pricing");
        return;
      }

      const price =
        duration === 15
          ? data.fee_15
          : duration === 30
          ? data.fee_30
          : duration === 45
          ? data.fee_45
          : duration === 60
          ? data.fee_60
          : 0;

      setExpert(data);
      setAmount(price);
      setLoading(false);
    };

    loadExpert();
  }, [expertId, duration]);

  /* ---------------- Mark abandoned booking ---------------- */
  const markAbandoned = async (bookingId: string) => {
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: "abandoned",
        cancelled_by: "system",
      })
      .eq("id", bookingId);
  };

  /* ---------------- Pay Now ---------------- */
  const payNow = async () => {
    if (!amount && amount !== 0) return;
    if (!razorpayReady || processing) return;

    setProcessing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to continue");
        return;
      }

      /* 1️⃣ Create booking ONLY NOW */
      const orderCode = generateOrderCode();
      const isFree = amount === 0;

      const { data: booking, error: bookingErr } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          expert_id: expertId,
          booking_date: date,
          start_time: time,
          duration_minutes: duration,
          amount,
          order_code: orderCode,

          // ✅ NEW FIELD
          user_message: userMessage?.trim() || null,

          // ✅ VALID STATUS ONLY
          status: "pending_confirmation",
          payment_status: isFree ? "confirmed" : "pending",
        })
        .select("id")
        .single();

      if (bookingErr || !booking) {
        alert("Failed to create booking");
        return;
      }

      const bookingId = booking.id;

      /* 2️⃣ Free booking → confirm via server */
      if (isFree) {
        await fetch("/api/bookings/confirm-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
        });

        router.push("/account/orders");
        return;
      }

      /* 3️⃣ Create Razorpay order */
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
        return;
      }

      const order = await res.json();

      /* 4️⃣ Razorpay checkout */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Intella",
        description: "Expert Session",
        order_id: order.order_id,

        handler: async function (response: any) {
          try {
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
              return;
            }

            router.push("/account/orders");
          } catch (err) {
            console.error(err);
            alert("Unexpected error after payment");
          }
        },

        /* 🔒 HANDLE ABANDONMENT */
        modal: {
          ondismiss: async () => {
            await markAbandoned(bookingId);
            router.push("/account/orders");
          },
        },

        theme: {
          color: "#FF7A00", // 🔥 Intella orange
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return <div className="intella-page p-10">Loading payment…</div>;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <main className="intella-page flex justify-center items-start pt-16">
        <div className="intella-card w-full max-w-lg p-8 space-y-6">
          <h1 className="text-2xl font-semibold">
            Confirm your booking
          </h1>

          <div className="text-lg">
            Amount to pay:{" "}
            <span className="font-semibold text-gray-900">
              {amount === 0 ? "Free" : `₹${amount}`}
            </span>
          </div>

          {/* 🔹 Optional Message Section */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowMessageBox(!showMessageBox)}
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              {showMessageBox
                ? "Hide message"
                : "Add a message for the host (optional)"}
            </button>

            {showMessageBox && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={userMessage}
                  onChange={(e) =>
                    setUserMessage(
                      e.target.value.slice(0, MAX_MESSAGE_LENGTH)
                    )
                  }
                  placeholder="Briefly introduce yourself or share topics you'd like to discuss..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                />
                <div className="text-xs text-gray-500 text-right">
                  {userMessage.length} / {MAX_MESSAGE_LENGTH}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={payNow}
            disabled={!razorpayReady || processing}
            className={`w-full py-3 rounded-xl text-white font-medium transition ${
              razorpayReady && !processing
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
                : "bg-gray-400"
            }`}
          >
            {processing
              ? "Processing…"
              : razorpayReady
              ? amount === 0
                ? "Confirm free booking"
                : `Pay ₹${amount}`
              : "Loading payment gateway…"}
          </button>
        </div>
      </main>
    </>
  );
}
