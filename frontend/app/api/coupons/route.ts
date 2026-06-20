import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Uses Supabase SSR cookie APIs \u2014 pin to Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();
    const supabase = await createClient();

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (cartTotal < coupon.min_order_value) {
      return NextResponse.json(
        { error: `Minimum order of ₹${coupon.min_order_value} required` },
        { status: 400 },
      );
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_value) discount = Math.min(discount, coupon.max_discount_value);
    } else {
      discount = coupon.discount_value;
    }

    return NextResponse.json({ coupon, discount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
