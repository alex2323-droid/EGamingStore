const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1DFSuIoAeSEWIIjluyUfVYQOL4u9I-yY2hrTeKrN65BTOHV3fTzmXdkSd8JtE5wY/exec';

async function test() {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'alexparababi23@gmail.com',
        subject: 'Test subject',
        html: '<p>Test body</p>',
      }),
      redirect: 'follow'
    });
    const text = await response.text();
    console.log(response.status, text);
  } catch(e) {
    console.error(e);
  }
}
test();
