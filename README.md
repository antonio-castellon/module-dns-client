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

## API

### dnsRefresh(): Promise<string[]>
Refreshes the list of reachable DNS servers (removes unreachable).

### registerService(service_id, PROTOCOL, PORT, METHOD): Promise<boolean>
Registers with all (remaining) active DNS servers.

### getServiceAddress(service_id): Promise<{service?: {PROTOCOL, IP_OR_CNAME, PORT, METHOD}, error?: string}>

### getServiceData(service_id, service_path, [jObject]): Promise<{data?: any, error?: string}>

Internally caches service addresses.

## License

MIT
