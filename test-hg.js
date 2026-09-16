async function run() {
  const tokenRes = await fetch('https://api.hankgames.com/v1/reseller/api/auth/token', {
    method: 'POST',
    headers: {
      'x-client-id': process.env.HANKGAMES_API_USER,
      'x-client-secret': process.env.HANKGAMES_API_PASS,
      'accept': 'application/json'
    }
  });
  const tokenData = await tokenRes.json();
  console.log("Auth response:", tokenData);
}
run();
