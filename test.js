//
// test module
//
const config = require('./config.dns.js');
const client = require('./dns-client.js')(config);

const execute = async () => {
    const ping = await client.dnsRefresh();
    client.registerService('test', 'https://', 7000, 'GET')
        .then((res) => {
            console.log(res);
        });

}
execute();







