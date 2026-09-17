import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { FreeFireAPI } = require('ffapis');
const api = new FreeFireAPI();
api.getPlayerProfile('255767228').then(profile => {
  console.log(profile.accountInfo?.accountName || profile.AccountInfo?.AccountName);
  console.log(profile);
}).catch(console.error);
