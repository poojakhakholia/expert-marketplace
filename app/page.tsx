export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 36 }}>Book 1-on-1 Expert Sessions</h1>
      <p style={{ marginTop: 10, color: "#555" }}>
        Talk directly to verified experts in fitness, finance, health, careers and more.
      </p>

      <div style={{ marginTop: 30 }}>
        <a
          href="/experts"
          style={{
            padding: "12px 20px",
            background: "black",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
            marginRight: 10,
          }}
        >
          Browse Experts
        </a>

        <a
          href="/login"
          style={{
            padding: "12px 20px",
            border: "1px solid black",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Become an Expert
        </a>
      </div>
    </main>
  );
}
