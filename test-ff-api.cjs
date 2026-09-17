const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('https://api.tokocash.com/v1/freefire?id=1096053896');
    console.log("Tokocash:", res.data);
  } catch (e) {}
  
  try {
    const res = await axios.get('https://api.sanzy.co/api/freefire?id=1096053896');
    console.log("Sanzy:", res.data);
  } catch (e) {}
  
  try {
    const res = await axios.get('https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store?productId=3&itemId=66&catalogId=121&paymentId=828&gameId=1096053896');
    console.log("Duniagames:", res.data);
  } catch (e) {}
}
run();
