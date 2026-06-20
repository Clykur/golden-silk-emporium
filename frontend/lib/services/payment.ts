import Razorpay from "razorpay";
import crypto from "crypto";

const isProduction = process.env.NODE_ENV === "production";

const razorpayKeyId =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID ||
  (isProduction ? "" : "rzp_test_mock_razorpay_key_id");
const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET || (isProduction ? "" : "rzp_test_mock_razorpay_key_secret");
const isRazorpayMocked = razorpayKeyId.includes("mock") || !razorpayKeyId || !razorpayKeySecret;
const razorpay = !isRazorpayMocked
  ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
  : null;

export class PaymentService {
  // 1. Razorpay Order Creation
  static async createRazorpayOrder(orderId: string, amount: number, currency: string = "INR") {
    if (isProduction && isRazorpayMocked) {
      throw new Error(
        "CRITICAL SECURITY ERROR: Razorpay Key ID or Secret is missing or mocked in production environment.",
      );
    }

    if (isRazorpayMocked) {
      console.log(`[Razorpay Mock] Created Order for ${orderId} of ${amount} ${currency}`);
      return {
        id: "rzp_mock_order_" + Math.random().toString(36).substring(4),
        amount: Math.round(amount * 100),
        currency,
        receipt: orderId,
      };
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paisa
      currency,
      receipt: orderId,
    };

    return await razorpay!.orders.create(options);
  }

  // 2. Razorpay Signature Verification
  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): boolean {
    if (isRazorpayMocked) {
      return true;
    }

    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  }
}
