async function testLogin() {
    const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "20230453@ricaldone.edu.sv", password: "Palomamami01!" })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
}
testLogin();
