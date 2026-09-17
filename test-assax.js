async function run() {
  const assaxPayload = {
    productId: "dummy",
    packageId: "dummy-pkg",
    playerData: { playerid: "12345" },
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
