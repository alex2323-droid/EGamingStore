const { FreeFireAPI } = require('ffapis');
async function run() {
  try {
    const api = new FreeFireAPI();
    const profile = await api.getPlayerProfile('1096053896');
    console.log("Success:", profile.basicinfo.nickname);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
