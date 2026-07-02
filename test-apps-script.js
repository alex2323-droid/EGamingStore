const url = 'https://script.google.com/macros/s/AKfycbykm_vWHSjv9xdVz3icHl7UFeSGfkv7swQ624ANRzM_49DZer4n8KZHTmWnG7FV-eyt/exec';
async function run() {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({to: 'test@example.com', subject: 'Test', html: 'Test'})
  });
  const text = await res.text();
  console.log(text);
}
run();
