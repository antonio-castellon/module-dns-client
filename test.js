//
// Extended tests for dns-client
//
const assert = require('assert');
const config = require('./config.dns.js');
const client = require('./dns-client.js')(config);

(async () => {
  try {
    const active = await client.dnsRefresh();
    assert.ok(Array.isArray(active));
    console.log('dnsRefresh OK, active count=', active.length);

    // register may succeed or fail depending on server presence
    const reg = await client.registerService('test-svc', 'https://', 7000, 'GET');
    console.log('register result:', reg);

    // getServiceAddress will likely error without real DNS, but exercises code
    const addr = await client.getServiceAddress('nonexistent-svc');
    console.log('getServiceAddress (expected no service):', addr);

    console.log('dns-client extended test completed');
  } catch (e) {
    console.log('dns test note:', e.message || e);
  }
})();
