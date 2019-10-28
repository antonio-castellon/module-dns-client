"use strict";
// -- DNS Client
//
// Castellon.CH - 2019 (c)
// Author: Antonio Castellon - antonio@castellon.ch
//
// Wrapping the logic to manage a list of Adresses.
//
// configuration example
//  module.exports = {
//     VERSION : 'v1'       // version of the DNS (REST)
//     , VALIDATE_CERTIFICATES : false   // to avoid problems with certificates self-signed in fetch
//     , DNS_SERVER_URL : 'https://127.0.0.1:7777'
// }
//
module.exports = function(setup) {

    const model = {};

    const fetch = require('node-fetch');
    const https = require("https");
    const agent = new https.Agent({ rejectUnauthorized: setup.VALIDATE_CERTIFICATES });

    let activeDNS = setup.DNS_SERVER_URL;

    /**
     *  {
     *      PROTOCOL : 'https'
     *      ,IP_OR_CNAME : '127.0.0.1'
     *      , PORT : 7000
     *      , METHOD : 'POST'  // only used GET or POST
     *  }
     *
     * @type {any[]}
     */
    const services = new Array();


    //
    // ASSIGNATIONS
    //
    model.getServiceAddress = getServiceAddress;
    model.getServiceData = getServiceData;
    model.registerService = registerService;
    model.dnsRefresh = dnsRefresh;

    //
    //  FUNCTION BODY
    //

    async function getData(url, path){
        return await fetch(url + '/' + path, { agent });
    }

    async function postData(url, path, json){
        return await fetch(url  + '/' + path,
                            {   agent
                                ,method: 'post'
                                , headers : {
                                                "Content-type": "application/json",
                                                "Accept": "application/json"
                                            }
                                ,body : JSON.stringify(json)
                            })
    }

    /**
     * get the address from a DNS Service Server.
     *
     * @param service_id        - Identification of the service, i.e: Fruits.Supermarket.com
     * @returns {Promise<any>}  - the URL address from this registered service in the DNS service.
     */
    async function getServiceAddress(service_id) {

        let serviceAddress = services[service_id];

        if (serviceAddress == null) {  // ask the DNS

            if (activeDNS.length == 0) await dnsRefresh();

            //console.log('...asking DNS for address : ' + activeDNS[0] + '/' + setup.VERSION +'/get/' + service_id);
            serviceAddress = await fetch(activeDNS[0] + '/' + setup.VERSION + '/get/' + service_id, { agent })
            serviceAddress = await serviceAddress.json();

            if (serviceAddress.service != null) {  services[service_id] = serviceAddress; }

            //console.log(serviceAddress);
            return serviceAddress;
        }
        else {

            //console.log(serviceAddress);
            return serviceAddress;
        }


    }

    /**
     * get the Requested data based in REST protocol, the service must be registered in a DNS Server first.
     *
     * @param service_id        - Identification of the service, i.e: Fruits.Supermarket.com
     * @param service_path      - REST service path, i.e.: /get/fruit/12/properties
     * @param jObject           - JSON Object Data used in a POST request.
     * @returns {Promise<void>}  - the Data requested from the Service pre-registered in a DNS Service Server, {data : <data>}
     */
    async function getServiceData(service_id, service_path, jObject) {

        const serviceAddress = await getServiceAddress(service_id);

        if (serviceAddress != null && typeof  serviceAddress.service != 'undefined')
        {
            const url = serviceAddress.service.PROTOCOL
                + serviceAddress.service.IP_OR_CNAME
                + ':' + serviceAddress.service.PORT;

            //console.log(' ... looking for data at : ' + url  +'/' + service_path );

            if (serviceAddress.service.METHOD == 'GET')
            {
                const result = await getData( url, service_path || '');
                const _data = await result.json();
                return {data : _data};

            }
            else {
                const result = await postData( url, service_path || '', jObject);
                const _data = await result.json();
                return {data : _data};
            }
        }
        else
            return {error: 'no service found for ' + service_id};
    }


    /**
     * Register a WS into all DNS Servers declared.
     *
     * @param service_id
     * @param PROTOCOL
     * @param PORT
     * @param METHOD
     * @returns {Promise<boolean>} - if it was registered successfully
     */
    async function registerService(service_id, PROTOCOL, PORT, METHOD) {

        let wasRegistered = false;

        for( let index = activeDNS.length-1 ; index >= 0; index-- )
        {
            try {

                console.log(activeDNS[index]);

                const res =  await postData(activeDNS[index], '/' + setup.VERSION + '/set/' + service_id, {
                    PROTOCOL : PROTOCOL
                    , PORT : PORT
                    , METHOD : METHOD
                })

                //console.log(res.status);

                if (res.status == 200 || res.status == 201) {
                    wasRegistered = true;
                }
                else{
                    console.error(res);
                }
            }
            catch(e)
            {
                if (e.code == 'ECONNREFUSED') console.log( ' ... DNS Server is not accessible in : ' + activeDNS[index]);
                    else console.error(e);
                activeDNS.splice(index, 1); // non-active DNS
            }

        }

        return wasRegistered;

    }

    /**
     * Refresh the configured table of accessible DNS(s)
     *
     * @returns {Promise<void>}
     */
    async function dnsRefresh()
    {
        activeDNS = setup.DNS_SERVER_URL;

        for( let index = activeDNS.length-1 ; index >= 0; index-- ) {
            try {
                    const res = await getData(activeDNS[index], setup.VERSION + '/ping');

                    if (res.status == 200 || res.status == 201) {
                            /* nothing to do */
                    }
                    else {
                        console.error(res);
                        activeDNS.splice(index, 1);
                    }
                }
                catch(e)
                {
                    if (e.code == 'ECONNREFUSED') console.log( ' ... DNS Server error : ' + activeDNS[index]);
                    else console.error(e);
                    activeDNS.splice(index, 1); // non-active DNS
                }
        }

        console.log(activeDNS);

        return activeDNS;
    }

    return model;
};