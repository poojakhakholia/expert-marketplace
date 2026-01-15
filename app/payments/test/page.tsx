"use client";

import Script from "next/script";

export default function TestPaymentPage() {
  const payNow = async () => {
    // Safety check (temporary but useful)
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      alert("Razorpay public key missing");
      return;
    }

    // Create order on backend
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500 }), // ₹500
    });

    if (!res.ok) {
      alert("Failed to create order");
      return;
    }

    const data = await res.json();

    const options = {
      key, // ✅ PUBLIC KEY
      amount: data.amount, // already in paise
      currency: "INR",
      name: "Expert Marketplace",
      description: "Test Expert Session",
      order_id: data.order_id,
      handler: function (response: any) {
        console.log("PAYMENT SUCCESS:", response);
        alert("Payment successful");
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
      },
      theme: {
        color: "#4B6EFF",
      },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      {/* Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <main style={{ padding: 40 }}>
        <h1>Test Razorpay Payment</h1>

        <button
          onClick={payNow}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4B6EFF",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Pay ₹500
        </button>
      </main>
    </>
  );
}
