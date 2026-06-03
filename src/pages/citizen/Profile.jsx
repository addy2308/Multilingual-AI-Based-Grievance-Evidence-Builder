
export default function Profile() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      fontFamily: "'Instrument Sans', sans-serif",
      background: "#09090b",
      color: "#fff"
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Profile</h1>
      <p style={{ color: "#71717a", fontSize: 14 }}>Your profile</p>
    </div>
  );
}
