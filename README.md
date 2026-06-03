# @acastellon/dns-client

DNS Client object to manage the discovery of new services addresses (ad-hoc WS discovery).

Works with a companion WS DNS server (see module-ws-dns).

## Install

```bash
npm install @acastellon/dns-client
```

## Config

DNS_SERVER_URL can be string or array of URLs. Uses node-fetch + https.Agent for cert validation control.

## Usage

```js
const config = require('./config.dns.js');
const client = require('@acastellon/dns-client')(config);

await client.dnsRefresh();
await client.registerService('myservice', 'https://', 7000, 'GET');
const addr = await client.getServiceAddress('myservice');
const data = await client.getServiceData('myservice', '/api/foo', {bar:1});
```

## License

MIT
