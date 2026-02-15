import React from "react";

interface BaseEmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

const BRAND_ORANGE = "#F97316"; // Intella orange (Tailwind orange-500 equivalent)
const BRAND_DARK = "#0F172A";   // Slate-900
const BRAND_LIGHT = "#F8FAFC";  // Slate-50

export default function BaseEmailLayout({
  previewText,
  children,
}: BaseEmailLayoutProps) {
  return (
    <html>
      <head>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: BRAND_LIGHT,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Hidden preview text (for inbox preview line) */}
        {previewText && (
          <div
            style={{
              display: "none",
              overflow: "hidden",
              lineHeight: "1px",
              opacity: 0,
              maxHeight: 0,
              maxWidth: 0,
            }}
          >
            {previewText}
          </div>
        )}

        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: BRAND_LIGHT, padding: "40px 0" }}
        >
          <tbody>
            <tr>
              <td align="center">

                {/* Email Container */}
                <table
                  width="600"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <tbody>

                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_APP_URL}/branding/intella-logo.png`}
                          alt="Intella"
                          width="120"
                          style={{ marginBottom: "12px" }}
                        />
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#64748B",
                          }}
                        >
                          Turn your experience into income.
                        </div>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td style={{ padding: "40px 32px" }}>
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#F1F5F9",
                          padding: "24px 32px",
                          fontSize: "13px",
                          color: "#64748B",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ marginBottom: "8px" }}>
                          © {new Date().getFullYear()} Intella
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                          <a
                            href="mailto:contact@intella.in"
                            style={{
                              color: BRAND_ORANGE,
                              textDecoration: "none",
                              fontWeight: 500,
                            }}
                          >
                            contact@intella.in
                          </a>
                        </div>

                        <div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL}/account/settings`}
                            style={{
                              color: "#94A3B8",
                              textDecoration: "underline",
                            }}
                          >
                            Manage notification preferences
                          </a>
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
