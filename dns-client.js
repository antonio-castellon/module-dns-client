"use strict";
// -- DNS Client
//
// Castellon.CH - 2019-2026 (c)
// Author: Antonio Castellon - antonio@castellon.ch
//
// Wrapping the logic to manage a list of Adresses.
//
// configuration example
//  module.exports = {
//     VERSION : 'v1'
//     , VALIDATE_CERTIFICATES : false
//     , DNS_SERVER_URL : [ 'https://127.0.0.1:7777' ]
// }
//
const fetch = require('node-fetch');
const https = require('https');

/**
 * Service discovery client.
 * @param {object} setup
 */
module.exports = function(setup) {

  const model = {};

  const agent = new https.Agent({ rejectUnauthorized: !!setup.VALIDATE_CERTIFICATES });

  let activeDNS = Array.isArray(setup.DNS_SERVER_URL) ? [...setup.DNS_SERVER_URL] : (setup.DNS_SERVER_URL ? [setup.DNS_SERVER_URL] : []);

  const services = {};

  model.getServiceAddress = getServiceAddress;
  model.getServiceData = getServiceData;
  model.registerService = registerService;
  model.dnsRefresh = dnsRefresh;

  async function getData(url, path){
    return await fetch(url + '/' + path, { agent });
  }

  async function postData(url, path, json){
    return await fetch(url + '/' + path, {
      agent,
      method: 'post',
      headers: { 'Content-type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(json)
    });
  }

  /**
   * @param {string} service_id
   * @returns {Promise<object>}
   */
  async function getServiceAddress(service_id) {
    let serviceAddress = services[service_id];

    if (!serviceAddress) {
      if (!activeDNS.length) await dnsRefresh();
      if (!activeDNS.length) return { error: 'no active DNS server' };

      const res = await fetch(activeDNS[0] + '/' + setup.VERSION + '/get/' + service_id, { agent });
      serviceAddress = await res.json();

      if (serviceAddress && serviceAddress.service) {
        services[service_id] = serviceAddress;
      }
    }
    return serviceAddress || { error: 'no service found for ' + service_id };
  }

  /**
   * @param {string} service_id
   * @param {string} service_path
   * @param {object} [jObject]
   */
  async function getServiceData(service_id, service_path, jObject) {
    const serviceAddress = await getServiceAddress(service_id);

    if (serviceAddress && serviceAddress.service) {
      const url = serviceAddress.service.PROTOCOL + serviceAddress.service.IP_OR_CNAME + ':' + serviceAddress.service.PORT;
      const result = (serviceAddress.service.METHOD === 'GET')
        ? await getData(url, service_path || '')
        : await postData(url, service_path || '', jObject || {});
      const _data = await result.json();
      return { data: _data };
    }
    return serviceAddress;
  }

  /**
   * @param {string} service_id
   * @param {string} PROTOCOL
   * @param {number} PORT
   * @param {string} METHOD
   * @returns {Promise<boolean>}
   */
  async function registerService(service_id, PROTOCOL, PORT, METHOD) {
    let wasRegistered = false;

    for (let index = activeDNS.length - 1; index >= 0; index--) {
      try {
        const res = await postData(activeDNS[index], setup.VERSION + '/set/' + service_id, { PROTOCOL, PORT, METHOD });
        if (res.status == 200 || res.status == 201) {
          wasRegistered = true;
        }
      } catch(e) {
        if (e.code == 'ECONNREFUSED') console.log(' ... DNS Server is not accessible in : ' + activeDNS[index]);
        else console.error(e);
        activeDNS.splice(index, 1);
      }
    }
    return wasRegistered;
  }

  /**
   * @returns {Promise<string[]>}
   */
  async function dnsRefresh()
  {
    activeDNS = Array.isArray(setup.DNS_SERVER_URL) ? [...setup.DNS_SERVER_URL] : (setup.DNS_SERVER_URL ? [setup.DNS_SERVER_URL] : []);

    for (let index = activeDNS.length - 1; index >= 0; index--) {
      try {
        const res = await getData(activeDNS[index], setup.VERSION + '/ping');
        if (res.status == 200 || res.status == 201) {
          // ok
        } else {
          console.error(res);
          activeDNS.splice(index, 1);
        }
      } catch(e) {
        if (e.code == 'ECONNREFUSED') console.log(' ... DNS Server error : ' + activeDNS[index]);
        else console.error(e);
        activeDNS.splice(index, 1);
      }
    }
    console.log('active DNS:', activeDNS);
    return activeDNS;
  }

  return model;
};
