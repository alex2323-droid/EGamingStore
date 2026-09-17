async function run() {
  const assaxRes = await fetch('https://assaxstore.com/api/reseller/catalog', {
    headers: { 'X-API-Key': process.env.ASSAX_API_KEY }
  });
  const data = await assaxRes.json();
  const ff = data.data.find(p => p.name.toLowerCase().includes('free fire'));
  if (ff) {
    console.log("FF Product ID:", ff.productId);
    console.log("FF Package ID:", ff.packages[0].packageId);
    console.log("FF Player fields:", ff.playerFields);
  } else {
    console.log("Free Fire not found in catalog");
  }
}
run();
