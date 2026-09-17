const axios = require('axios');
const headers = { 'Authorization': 'Bearer ' + process.env.ASSAX_API_KEY };
const payload = { productId: 'free-fire', playerData: { playerid: '1096053896' } };

async function test(path) {
  try {
    const res = await axios.post('https://assaxstore.com/api/reseller/' + path, payload, { headers });
    if (!res.data.includes('<html')) console.log("Success on", path, ":", res.data);
  } catch (err) {}
}

async function run() {
  await test('user-check');
  await test('check');
  await test('validate');
  await test('player');
  await test('orders/check');
  await test('catalog/check');
}
run();
