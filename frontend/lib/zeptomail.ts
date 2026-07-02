// Centralized ZeptoMail service using the REST API

// Reusable retry helper
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[ZeptoMail Service] Retrying operation... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY || "";
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "bounce@pepisandbox.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Drapeva";

  const isMocked = !apiKey || apiKey.includes("mock");

  if (isMocked) {
    console.log(`[ZeptoMail Mock] Dispatching email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body snippet: ${html.substring(0, 200)}...`);
    return { id: "zeptomail_mock_id_" + Math.random().toString(36).substring(4) };
  }

  // 1. Verify endpoint based on the account region (.in vs .com)
  const isIndia =
    fromEmail.toLowerCase().endsWith(".in") || fromEmail.toLowerCase().includes(".co.in");
  const endpoint = isIndia
    ? "https://api.zeptomail.in/v1.1/email"
    : "https://api.zeptomail.com/v1.1/email";

  // 2. Verify Authorization header format
  const authHeader = apiKey.startsWith("Zoho-enczapikey ") ? apiKey : `Zoho-enczapikey ${apiKey}`;

  // 3. Verify request body exactly matches the official specification
  const payload = {
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: to,
          name: to.split("@")[0],
        },
      },
    ],
    subject: subject,
    htmlbody: html,
  };

  try {
    return await retryOperation(async () => {
      // 6. Log request URL, headers (excluding secrets), and body
      const headersForLog = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "[REDACTED]",
      };

      console.log(`[ZeptoMail Request] URL: ${endpoint}`);
      console.log(`[ZeptoMail Request] Headers: ${JSON.stringify(headersForLog)}`);
      console.log(`[ZeptoMail Request] Body: ${JSON.stringify(payload)}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const text = await response.text();

      // 5. Replace all JSON parsing with robust handling supporting both JSON and plain text
      let responseData: any;
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = { text };
      }

      // 6. Log response status, headers, and body
      console.log(`[ZeptoMail Response] Status: ${response.status} ${response.statusText}`);
      console.log(`[ZeptoMail Response] Headers: ${JSON.stringify(responseHeaders)}`);
      console.log(`[ZeptoMail Response] Body: ${JSON.stringify(responseData)}`);

      if (!response.ok) {
        console.error(`[ZeptoMail Service] API error: Status ${response.status}`, responseData);
        throw new Error(
          `ZeptoMail API error: ${response.statusText} (${JSON.stringify(responseData)})`,
        );
      }

      console.log(`[ZeptoMail Service] Email sent successfully to "${to}"`);
      return responseData;
    });
  } catch (err: any) {
    console.error(`[ZeptoMail Service] Failed to send email to "${to}" after retries:`, err);
    throw err;
  }
}
