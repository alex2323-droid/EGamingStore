import pkg from '@pure0cd/freefire-api';
const api = new pkg();
api.searchAccount('255767228').then(players => {
  console.log(players);
}).catch(console.error);
