const url = 'https://script.google.com/macros/s/AKfycbykm_vWHSjv9xdVz3icHl7UFeSGfkv7swQ624ANRzM_49DZer4n8KZHTmWnG7FV-eyt/exec';
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
    console.log("Body:", text);
  } catch(e) {
    console.error(e);
  }
}
run();
