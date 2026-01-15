export default function Experts() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28 }}>Experts</h1>
      <p style={{ color: "#555" }}>Verified professionals you can book instantly</p>

      <div style={{ marginTop: 30 }}>
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            style={{
              padding: 20,
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 15,
            }}
          >
            <h3>Expert Name</h3>
            <p>Fitness Coach • ₹999 / 30 mins</p>
            <a href="/experts/1">View Profile</a>
          </div>
        ))}
      </div>
    </main>
  );
}
