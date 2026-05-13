const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    const email = 'inv@rmail.com';
    const password = 'mypass';

    try {
        console.log(`Logging in as ${email}...`);
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData.message);
            return;
        }

        const token = loginData.data.token;
        const factoryId = loginData.data.user.id;
        console.log('Login successful. Token received. FactoryId:', factoryId);

        // 1. Test Bag Weights
        console.log('\nFetching Bag Weights...');
        const bagRes = await fetch(`${API_URL}/inventory-process/bagweights?factoryId=${factoryId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bagData = await bagRes.json();
        console.log('Bag Weights Result:', JSON.stringify(bagData, null, 2));

        // 2. Test Fertilizer History
        console.log('\nFetching Fertilizer History...');
        const fertRes = await fetch(`${API_URL}/inventory-process/fertilizer-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const fertData = await fertRes.json();
        console.log('Fertilizer History Result:', JSON.stringify(fertData, null, 2));

    } catch (err) {
        console.error('Error during API test:', err.message);
    }
}

testAPI();
