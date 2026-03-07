const axios = require('axios');

async function testDriversAPI() {
  try {
    console.log('Testing GET /api/drivers endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/drivers', {
      headers: {
        'Authorization': 'Bearer ' + (process.env.TEST_TOKEN || ''),
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response structure:');
    console.log('  - success:', response.data.success);
    console.log('  - count:', response.data.count);
    console.log('  - drivers length:', response.data.data?.drivers?.length);
    console.log('\n👥 Drivers returned:');
    
    if (response.data.data && response.data.data.drivers) {
      response.data.data.drivers.forEach((d, i) => {
        console.log(`\n${i+1}. ${d.name}`);
        console.log(`   ID: ${d._id}`);
        console.log(`   Email: ${d.email}`);
        console.log(`   Status: ${d.status}`);
        console.log(`   Active: ${d.isActive}`);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.statusText);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testDriversAPI();
