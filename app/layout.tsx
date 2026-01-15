export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <header style={{ padding: 20, borderBottom: "1px solid #eee" }}>
          <a href="/" style={{ marginRight: 20 }}>Home</a>
          <a href="/experts" style={{ marginRight: 20 }}>Experts</a>
          <a href="/login">Login</a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
