import React from "react";

interface EmailItem {
  id?: string;
  name?: string;
  title?: string;
  quantity: number;
  price: number;
  size?: string;
  image?: string;
  variant?: {
    size?: string;
    product?: {
      name?: string;
      images?: { url: string }[];
    };
  };
}

interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderCode: string;
  items: EmailItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderCode,
  items,
  subtotal,
  tax,
  shippingCost,
  discount,
  total,
  shippingAddress,
  paymentMethod,
}) => {
  const brandGold = "#d4af37";
  const brandBlack = "#111111";
  const brandWhite = "#faf9f6";

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        backgroundColor: brandWhite,
        color: brandBlack,
        margin: 0,
        padding: "30px 20px",
        minHeight: "100%",
      }}
    >
      <table
        align="center"
        border={0}
        cellPadding="0"
        cellSpacing="0"
        width="100%"
        style={{
          maxWidth: "600px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2dcd0",
          padding: "40px",
        }}
      >
        {/* Logo/Header */}
        <tr>
          <td align="center">
            <h1
              style={{
                fontSize: "32px",
                letterSpacing: "0.2em",
                fontWeight: 400,
                textTransform: "uppercase",
                margin: "0 0 5px 0",
                color: brandBlack,
              }}
            >
              DRAPEVA
            </h1>
            <div
              style={{ borderBottom: "1px solid #e2dcd0", width: "100%", margin: "20px 0" }}
            ></div>
          </td>
        </tr>

        {/* Greeting */}
        <tr>
          <td>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 400,
                color: brandBlack,
                margin: "0 0 15px 0",
              }}
            >
              Your Drapeva Order has been Confirmed ✨
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#555555",
                margin: "0 0 20px 0",
              }}
            >
              Dear {customerName},
            </p>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#555555",
                margin: "0 0 30px 0",
              }}
            >
              Thank you for choosing Drapeva. We are delighted to confirm that your order{" "}
              <strong>#{orderCode}</strong> has been successfully placed. Our trusted partner
              weavers and artisans have commenced preparing your curated handcrafted masterpiece.
            </p>
          </td>
        </tr>

        {/* Order Details */}
        <tr>
          <td>
            <h3
              style={{
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: brandBlack,
                margin: "0 0 15px 0",
                borderBottom: "1px solid #e2dcd0",
                paddingBottom: "8px",
              }}
            >
              Order Summary
            </h3>

            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              style={{ margin: "0 0 30px 0" }}
            >
              {items.map((item, index) => {
                const name =
                  item.name || item.title || item.variant?.product?.name || "Premium Couture Saree";
                const size = item.size || item.variant?.size || "One Size";
                const price = item.price || 0;
                const quantity = item.quantity || 1;
                const imageUrl = item.image || item.variant?.product?.images?.[0]?.url || "";

                return (
                  <tr key={index} style={{ borderBottom: "1px solid #faf9f6" }}>
                    {imageUrl && (
                      <td width="70" style={{ padding: "10px 0", verticalAlign: "top" }}>
                        <img
                          src={imageUrl}
                          alt={name}
                          width="60"
                          height="75"
                          style={{ objectFit: "cover", border: "1px solid #e2dcd0" }}
                        />
                      </td>
                    )}
                    <td style={{ padding: "10px 10px", verticalAlign: "top" }}>
                      <p
                        style={{
                          margin: "0 0 5px 0",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: brandBlack,
                        }}
                      >
                        {name}
                      </p>
                      <p style={{ margin: "0", fontSize: "12px", color: "#8c7853" }}>
                        Size: {size}
                      </p>
                      <p style={{ margin: "0", fontSize: "12px", color: "#666666" }}>
                        Qty: {quantity}
                      </p>
                    </td>
                    <td
                      align="right"
                      style={{
                        padding: "10px 0",
                        verticalAlign: "top",
                        fontSize: "14px",
                        color: brandBlack,
                      }}
                    >
                      ₹{(price * quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </table>
          </td>
        </tr>

        {/* Pricing Breakdown */}
        <tr>
          <td
            style={{
              padding: "15px 0",
              backgroundColor: "#fcfbf9",
              borderTop: "1px solid #e2dcd0",
              borderBottom: "1px solid #e2dcd0",
            }}
          >
            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              style={{ fontSize: "14px", color: "#555555" }}
            >
              <tr>
                <td style={{ padding: "5px 15px" }}>Subtotal</td>
                <td align="right" style={{ padding: "5px 15px" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td style={{ padding: "5px 15px", color: "#8c7853" }}>Discount</td>
                  <td align="right" style={{ padding: "5px 15px", color: "#8c7853" }}>
                    -₹{discount.toLocaleString("en-IN")}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: "5px 15px" }}>Shipping</td>
                <td align="right" style={{ padding: "5px 15px" }}>
                  ₹{shippingCost.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "5px 15px" }}>Tax (GST)</td>
                <td align="right" style={{ padding: "5px 15px" }}>
                  ₹{tax.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr style={{ fontSize: "16px", fontWeight: "bold", color: brandBlack }}>
                <td style={{ padding: "10px 15px 5px 15px", borderTop: "1px dashed #e2dcd0" }}>
                  Total Amount
                </td>
                <td
                  align="right"
                  style={{ padding: "10px 15px 5px 15px", borderTop: "1px dashed #e2dcd0" }}
                >
                  ₹{total.toLocaleString("en-IN")}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Delivery & Payment Details */}
        <tr>
          <td style={{ padding: "30px 0 0 0" }}>
            <table width="100%" border={0} cellPadding="0" cellSpacing="0">
              <tr>
                <td width="50%" style={{ verticalAlign: "top", paddingRight: "10px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: brandBlack,
                      margin: "0 0 10px 0",
                    }}
                  >
                    Shipping Address
                  </h4>
                  <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#555555", margin: 0 }}>
                    {shippingAddress.name}
                    <br />
                    {shippingAddress.line1}
                    <br />
                    {shippingAddress.line2 ? `${shippingAddress.line2}, ` : ""}
                    {shippingAddress.city}
                    <br />
                    {shippingAddress.state} - {shippingAddress.postalCode}
                    <br />
                    {shippingAddress.country}
                    <br />
                    Phone: {shippingAddress.phone}
                  </p>
                </td>
                <td width="50%" style={{ verticalAlign: "top", paddingLeft: "10px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: brandBlack,
                      margin: "0 0 10px 0",
                    }}
                  >
                    Payment Method
                  </h4>
                  <p style={{ fontSize: "13px", color: "#555555", margin: "0 0 15px 0" }}>
                    {paymentMethod.toUpperCase()}
                  </p>
                  <h4
                    style={{
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: brandBlack,
                      margin: "0 0 5px 0",
                    }}
                  >
                    Estimated Delivery
                  </h4>
                  <p style={{ fontSize: "13px", color: brandGold, fontWeight: "bold", margin: 0 }}>
                    10–15 Business Days
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Footer info */}
        <tr>
          <td align="center" style={{ paddingTop: "40px" }}>
            <div
              style={{ borderBottom: "1px solid #e2dcd0", width: "100%", margin: "20px 0" }}
            ></div>
            <p style={{ fontSize: "12px", color: "#8c7853", margin: "0 0 10px 0" }}>
              Questions about your order?
            </p>
            <p style={{ fontSize: "12px", color: "#555555", margin: "0 0 20px 0" }}>
              Reach our concierge at{" "}
              <a
                href="mailto:drapeva2026@gmail.com"
                style={{ color: brandBlack, textDecoration: "underline" }}
              >
                drapeva2026@gmail.com
              </a>
            </p>
            <p style={{ fontSize: "11px", color: "#999999", margin: 0 }}>
              &copy; {new Date().getFullYear()} DRAPEVA STORE. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
};
