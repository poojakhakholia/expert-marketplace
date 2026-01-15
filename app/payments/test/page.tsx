"use client";

export default function TestPaymentPage() {
  const payNow = async () => {
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500 }),
    });

    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
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
    <main style={{ padding: 40 }}>
      <h1>Test Razorpay Payment</h1>
      <button onClick={payNow} style={{ padding: "12px 24px" }}>
        Pay ₹500
      </button>
    </main>
  );
}
