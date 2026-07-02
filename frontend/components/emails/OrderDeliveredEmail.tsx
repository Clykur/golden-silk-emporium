import React from "react";

interface EmailItem {
  id?: string;
  name?: string;
  title?: string;
  quantity: number;
  price: number;
  size?: string;
  variant?: {
    size?: string;
    product?: {
      name?: string;
    };
  };
}

export interface OrderDeliveredEmailProps {
  customerName: string;
  orderCode: string;
  deliveredDate: string;
  items: EmailItem[];
}

export const OrderDeliveredEmail: React.FC<OrderDeliveredEmailProps> = ({
  customerName,
  orderCode,
  deliveredDate,
  items,
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
        {/* Header */}
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

        {/* Headline */}
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
              Your Drapeva Order has been Delivered ❤️
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
                margin: "0 0 20px 0",
              }}
            >
              We are pleased to confirm that your order <strong>#{orderCode}</strong> was delivered
              on <strong>{deliveredDate}</strong>.
            </p>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#555555",
                margin: "0 0 30px 0",
              }}
            >
              We hope your new couture saree brings elegance and grace to your moments. It has been
              our privilege to craft this heirloom for you.
            </p>
          </td>
        </tr>

        {/* Call to Review */}
        <tr>
          <td
            align="center"
            style={{
              backgroundColor: "#fcfbf9",
              padding: "30px",
              border: "1px solid #e2dcd0",
              margin: "0 0 30px 0",
            }}
          >
            <h3
              style={{ fontSize: "16px", fontWeight: 400, color: brandBlack, margin: "0 0 10px 0" }}
            >
              Share Your Experience
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#555555",
                margin: "0 0 20px 0",
                lineHeight: "1.5",
              }}
            >
              How did you feel when you draped it? We would love to hear your feedback on the craft,
              fit, and purchase experience.
            </p>
            <a
              href="http://localhost:3000/account/orders"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: brandBlack,
                color: "#ffffff",
                padding: "12px 25px",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Write A Review
            </a>
          </td>
        </tr>

        {/* Order Summary */}
        <tr>
          <td style={{ paddingTop: "30px" }}>
            <h3
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: brandBlack,
                margin: "0 0 15px 0",
                borderBottom: "1px solid #e2dcd0",
                paddingBottom: "8px",
              }}
            >
              Order Details
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
                const quantity = item.quantity || 1;

                return (
                  <tr key={index}>
                    <td style={{ padding: "10px 0", verticalAlign: "top" }}>
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
                      <p style={{ margin: "0", fontSize: "12px", color: "#666666" }}>
                        Size: {size} | Qty: {quantity}
                      </p>
                    </td>
                  </tr>
                );
              })}
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
              Need assistance?
            </p>
            <p style={{ fontSize: "12px", color: "#555555", margin: "0 0 20px 0" }}>
              Write to our concierge team at{" "}
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
