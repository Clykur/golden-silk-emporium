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

export interface OrderShippedEmailProps {
  customerName: string;
  orderId: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: EmailItem[];
}

export const OrderShippedEmail: React.FC<OrderShippedEmailProps> = ({
  customerName,
  orderId,
  courierName,
  trackingNumber,
  trackingUrl,
  estimatedDelivery = "5–7 Business Days",
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
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: brandGold,
                margin: "0 0 30px 0",
              }}
            >
              Atelier
            </p>
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
              Your Drapeva Order is on the Way 🚚
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
              Exciting news! Your custom order <strong>#{orderId}</strong> has completed
              craftsmanship and is now dispatched. It will be delivered to your doorstep soon.
            </p>
          </td>
        </tr>

        {/* Tracking Information Box */}
        <tr>
          <td
            style={{
              backgroundColor: "#fcfbf9",
              padding: "25px",
              border: "1px solid #e2dcd0",
              margin: "0 0 30px 0",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: brandBlack,
                margin: "0 0 15px 0",
              }}
            >
              Shipment Details
            </h3>
            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              style={{ fontSize: "14px", lineHeight: "1.6", color: brandBlack }}
            >
              <tr>
                <td width="40%" style={{ fontWeight: "bold", paddingBottom: "8px" }}>
                  Courier Partner:
                </td>
                <td style={{ paddingBottom: "8px" }}>{courierName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Tracking Number:</td>
                <td style={{ paddingBottom: "8px", fontFamily: "monospace" }}>{trackingNumber}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Estimated Delivery:</td>
                <td style={{ paddingBottom: "8px", fontWeight: "bold", color: brandGold }}>
                  {estimatedDelivery}
                </td>
              </tr>
            </table>

            {trackingUrl && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <a
                  href={trackingUrl}
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
                  Track Shipment
                </a>
              </div>
            )}
          </td>
        </tr>

        {/* Shipped Items */}
        <tr>
          <td style={{ paddingTop: "20px" }}>
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
              Items in this Package
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
              Our concierge team is here for you. Reply to this email or write to{" "}
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
