export default function Login() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>
      <p>Sign in using your email</p>

      <input
        placeholder="Enter your email"
        style={{ padding: 10, marginTop: 10, display: "block" }}
      />

      <button style={{ marginTop: 15, padding: "10px 20px" }}>
        Continue
      </button>
    </main>
  );
}
