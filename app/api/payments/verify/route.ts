import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("VERIFY BODY:", body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { booking_id, razorpay_payment_id } = body;

    const { data, error } = await supabase
      .from("bookings")
      .update({
        // ❌ DO NOT CONFIRM BOOKING HERE
        payment_id: razorpay_payment_id,
      })
      .eq("id", booking_id)
      .select();

    console.log("UPDATE RESULT:", data, error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY API ERROR:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
