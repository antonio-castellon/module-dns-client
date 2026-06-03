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
