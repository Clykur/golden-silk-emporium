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

export interface AdminOrderNotificationEmailProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderId: string;
  items: EmailItem[];
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export const AdminOrderNotificationEmail: React.FC<AdminOrderNotificationEmailProps> = ({
  customerName,
  customerEmail,
  customerPhone,
  orderId,
  items,
  total,
  shippingAddress,
  paymentMethod,
  paymentStatus,
  createdAt,
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
                fontSize: "24px",
                letterSpacing: "0.15em",
                fontWeight: 400,
                textTransform: "uppercase",
                margin: "0 0 5px 0",
                color: brandBlack,
              }}
            >
              DRAPEVA STORE
            </h1>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: brandGold,
                margin: "0 0 20px 0",
              }}
            >
              Admin Order Alert
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
                fontSize: "18px",
                fontWeight: "bold",
                color: brandBlack,
                margin: "0 0 20px 0",
              }}
            >
              New Order Received 🚀
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#555555",
                margin: "0 0 30px 0",
              }}
            >
              A new couture purchase has been placed. Please review the details below to initiate
              fulfillment.
            </p>
          </td>
        </tr>

        {/* Order Details Grid */}
        <tr>
          <td
            style={{
              backgroundColor: "#fcfbf9",
              padding: "20px",
              border: "1px solid #e2dcd0",
              marginBottom: "30px",
            }}
          >
            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              style={{ fontSize: "14px", lineHeight: "1.6", color: brandBlack }}
            >
              <tr>
                <td width="40%" style={{ fontWeight: "bold", paddingBottom: "8px" }}>
                  Order ID:
                </td>
                <td style={{ paddingBottom: "8px" }}>#{orderId}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Time of Purchase:</td>
                <td style={{ paddingBottom: "8px" }}>{createdAt}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Customer Name:</td>
                <td style={{ paddingBottom: "8px" }}>{customerName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Customer Email:</td>
                <td style={{ paddingBottom: "8px" }}>{customerEmail}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Customer Phone:</td>
                <td style={{ paddingBottom: "8px" }}>{customerPhone || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Order Value:</td>
                <td style={{ paddingBottom: "8px", fontWeight: "bold", color: brandGold }}>
                  ₹{total.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", paddingBottom: "8px" }}>Payment Status:</td>
                <td
                  style={{
                    paddingBottom: "8px",
                    textTransform: "uppercase",
                    color: paymentStatus === "paid" ? "green" : "orange",
                  }}
                >
                  {paymentStatus} ({paymentMethod})
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Products */}
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
              Items Purchased
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

        {/* Delivery Address */}
        <tr>
          <td style={{ borderTop: "1px solid #e2dcd0", paddingTop: "20px" }}>
            <h3
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: brandBlack,
                margin: "0 0 10px 0",
              }}
            >
              Fulfillment Address
            </h3>
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
        </tr>

        {/* Footer */}
        <tr>
          <td align="center" style={{ paddingTop: "40px" }}>
            <div
              style={{ borderBottom: "1px solid #e2dcd0", width: "100%", margin: "20px 0" }}
            ></div>
            <p style={{ fontSize: "11px", color: "#999999", margin: 0 }}>
              &copy; {new Date().getFullYear()} DRAPEVA STORE. Admin Operations.
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
};
