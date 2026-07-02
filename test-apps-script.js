const url = 'https://script.google.com/macros/library/d/1aCEPE6LauVDGzERX-5iVXUoASwbe_jTGTdaJv5P5_0-QLK8nAqzPytP_/2';
async function run() {
  console.log("Testing POST to URL:", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({to: 'test@example.com', subject: 'Test Subject', html: '<p>Test Html</p>'}),
      redirect: 'follow'
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body length:", text.length);
    console.log("Body snippet:", text.substring(0, 200));
  } catch(e) {
    console.error(e);
  }
}
run();
