async function run() {
  const assaxPayload = {
    productId: "free-fire",
    packageId: "285734",
    playerData: { playerid: "255767228" },
    quantity: 1
  };
  const assaxRes = await fetch('https://assaxstore.com/api/reseller/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ASSAX_API_KEY
    },
    body: JSON.stringify(assaxPayload)
  });
  console.log(assaxRes.status);
  console.log(await assaxRes.text());
}
run();
