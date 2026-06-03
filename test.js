//
// test module
//
const config = require('./config.dns.js');
const client = require('./dns-client.js')(config);

(async () => {
  const ping = await client.dnsRefresh();
  const reg = await client.registerService('test', 'https://', 7000, 'GET');
  console.log('registered:', reg);
})().catch(console.error);
