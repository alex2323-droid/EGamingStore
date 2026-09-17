const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('https://assaxstore.com/api/reseller/user-check', {
      productId: 'free-fire',
      playerData: { playerid: '1096053896' }
    }, {
      headers: { 'Authorization': 'Bearer ' + process.env.ASSAX_API_KEY }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
