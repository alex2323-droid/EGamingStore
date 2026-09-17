import('@pure0cd/freefire-api').then(pkg => {
  console.log(Object.keys(pkg));
  console.log(Object.keys(pkg.default || {}));
}).catch(console.error);
