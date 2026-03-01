async function testSim() {
    try {
        console.log("Logging in as superadmin...");
        const res = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'superadmin',
                password: 'Password123'
            })
        });

        const data = await res.json();
        const token = data.token;
        console.log("Token acquired:", token ? token.substring(0, 15) + "..." : "No token");

        console.log("Attempting to run simulation...");
        const simRes = await fetch('http://localhost:5000/security/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                attackType: 'CREDENTIAL_STUFFING'
            })
        });

        const simData = await simRes.json();
        console.log("Status:", simRes.status);
        console.log("Response:", simData);
    } catch (err) {
        console.error("Error occurred!", err);
    }
}

testSim();
