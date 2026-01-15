export default function ExpertProfile() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Expert Name</h1>
      <p>Certified Fitness Coach with 10+ years experience</p>

      <h3 style={{ marginTop: 20 }}>Book a Session</h3>

      <ul>
        <li>15 mins – ₹499</li>
        <li>30 mins – ₹999</li>
        <li>60 mins – ₹1,799</li>
      </ul>

      <button style={{ marginTop: 20, padding: "10px 20px" }}>
        Book Session
      </button>
    </main>
  );
}
