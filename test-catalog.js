async function run() {
  const assaxRes = await fetch('https://assaxstore.com/api/reseller/catalog', {
    headers: { 'X-API-Key': process.env.ASSAX_API_KEY }
  });
  console.log(assaxRes.status);
  const data = await assaxRes.json();
  if (data.data && data.data.length > 0) {
    console.log("First product ID:", data.data[0].productId);
    console.log("First package ID:", data.data[0].packages[0].packageId);
    console.log("Player fields:", data.data[0].playerFields);
    
    // now let's try an order
    const assaxPayload = {
      productId: data.data[0].productId,
      packageId: data.data[0].packages[0].packageId,
      playerData: { playerid: "255767228" },
      quantity: 1
    };
    const orderRes = await fetch('https://assaxstore.com/api/reseller/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ASSAX_API_KEY
      },
      body: JSON.stringify(assaxPayload)
    });
    console.log("Order HTTP status:", orderRes.status);
    console.log("Order response:", await orderRes.text());
  }
}
run();
