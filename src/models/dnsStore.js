
// src/models/dnsStore.js

const dnsRecords = {
  A: new Map(),      // hostname -> Set of IPv4 addresses
  CNAME: new Map()   // hostname -> alias hostname
};

module.exports = dnsRecords;
