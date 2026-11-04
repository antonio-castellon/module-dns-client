# @acastellon/dns-client

DNS Client object to manage the discovery of new services addresses (ad-hoc WS discovery).

Works with a companion WS DNS server (see module-ws-dns).

## Install

```bash
npm install @acastellon/dns-client
```

## Config

DNS_SERVER_URL can be string or array of URLs. Uses node-fetch + https.Agent for cert validation control.

```js
module.exports = {
  VERSION: 'v1',
  VALIDATE_CERTIFICATES: false,
  DNS_SERVER_URL: [
    'https://127.0.0.1:7770',
    'https://127.0.0.1:7777'
  ]
};
```

## Usage

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

await client.dnsRefresh();
await client.registerService('myservice', 'https://', 7000, 'GET');
const addr = await client.getServiceAddress('myservice');
```

## API

### dnsRefresh(): Promise<string[]>

Refreshes the list of reachable DNS servers (removes unreachable).

**Example (with minimal setup):**

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

const active = await client.dnsRefresh();
console.log('Active DNS servers:', active);
```

### registerService(service_id, PROTOCOL, PORT, METHOD): Promise<boolean>

Registers with all (remaining) active DNS servers.

**Example (with minimal setup):**

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

const registered = await client.registerService('myservice', 'https://', 7000, 'GET');
console.log('Registered:', registered);
```

### getServiceAddress(service_id): Promise<{service?: {PROTOCOL, IP_OR_CNAME, PORT, METHOD}, error?: string}>

**Example (with minimal setup):**

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

const addr = await client.getServiceAddress('myservice');
if (addr.service) {
  console.log('Service at:', addr.service);
} else {
  console.log('Error:', addr.error);
}
```

### getServiceData(service_id, service_path, [jObject]): Promise<{data?: any, error?: string}>

**Example (with minimal setup):**

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

const data = await client.getServiceData('myservice', '/api/foo', { bar: 1 });
console.log('Data:', data);
```

Internally caches service addresses.

## License

MIT

## Notice and Disclaimer

NOTICE AND DISCLAIMER: This software automatically retrieves, accesses or interacts with external materials. Those retrieved materials are not distributed with this software and are governed solely by separate terms, conditions and licenses. You are solely responsible for finding, reviewing and complying with all applicable terms, conditions, and licenses, and for verifying the security, integrity and suitability of any retrieved materials for your specific use case. This software is provided "AS IS", without warranty of any kind. The author makes no representations or warranties regarding any retrieved materials, and assumes no liability for any losses, damages, liabilities or legal consequences from your use or inability to use this software or any retrieved materials. Use this software and the retrieved materials at your own risk.

External materials module-dns-client interacts with at run time:

- The discovery services you point it to, under your agreements for those systems.
