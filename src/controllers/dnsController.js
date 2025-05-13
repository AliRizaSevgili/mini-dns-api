const dnsCache = require('../models/dnsCache');

const loggerQueue = require('../jobs/loggerQueue');

const dnsStore = require('../models/dnsStore');

function isValidIPv4(ip) {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}$/;
  return ipv4Regex.test(ip);
}

exports.addRecord = (req, res) => {
  const { type, hostname, value } = req.body;

  if (!type || !hostname || !value) {
    return res.status(400).json({ error: 'Missing required fields: type, hostname, value' });
  }

  if (type === 'A') {
    if (!isValidIPv4(value)) {
      return res.status(400).json({ error: 'Invalid IPv4 address format' });
    }

    if (dnsStore.CNAME.has(hostname)) {
      return res.status(409).json({ error: 'Cannot add A record; CNAME already exists for this hostname' });
    }

    if (!dnsStore.A.has(hostname)) {
      dnsStore.A.set(hostname, new Set());
    }

    const currentIPs = dnsStore.A.get(hostname);
    if (currentIPs.has(value)) {
      return res.status(409).json({ error: 'A record already exists' });
    }

    currentIPs.add(value);
    return res.status(201).json({ message: 'A record added successfully' });

  } else if (type === 'CNAME') {
    if (dnsStore.A.has(hostname) || dnsStore.CNAME.has(hostname)) {
      return res.status(409).json({ error: 'Cannot add CNAME; A or CNAME record already exists for this hostname' });
    }

    dnsStore.CNAME.set(hostname, value);
    return res.status(201).json({ message: 'CNAME record added successfully' });

  } else {
    return res.status(400).json({ error: 'Invalid record type. Supported types: A, CNAME' });
  }
};


exports.resolveRecord = async (req, res) => {
  const { hostname } = req.params;

  if (dnsCache.has(hostname)) {
  const cached = dnsCache.get(hostname);

  await loggerQueue.add('log', {
    hostname,
    resolvedTo: cached,
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ result: cached });
}


  const visited = new Set();
  let current = hostname;

  // Check if the hostname has a CNAME record
  while (dnsStore.CNAME.has(current)) {
    if (visited.has(current)) {
      return res.status(400).json({ error: 'CNAME loop detected' });
    }

    visited.add(current);
    current = dnsStore.CNAME.get(current);
  }

  const ipRecords = dnsStore.A.get(current);

  if (!ipRecords || ipRecords.size === 0) {
    return res.status(404).json({ error: 'No A record found for resolved hostname' });
  }
   dnsCache.set(hostname, Array.from(ipRecords));
  // Log the resolution
  await loggerQueue.add('log', {
    hostname,
    resolvedTo: Array.from(ipRecords),
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ result: Array.from(ipRecords) });
};

// List all records for a given hostname
exports.listRecords = (req, res) => {
  const { hostname } = req.params;

  const result = [];

  // Check if the hostname has a CNAME record
  if (dnsStore.CNAME.has(hostname)) {
    const target = dnsStore.CNAME.get(hostname);
    result.push({ type: 'CNAME', value: target });
    return res.status(200).json({ records: result });
  }

  // Check if the hostname has an A record  
  if (dnsStore.A.has(hostname)) {
    const ips = Array.from(dnsStore.A.get(hostname));
    ips.forEach(ip => {
      result.push({ type: 'A', value: ip });
    });
    return res.status(200).json({ records: result });
  }

  
  return res.status(404).json({ error: 'No records found for this hostname' });
};


// List all records in the store
exports.deleteRecord = (req, res) => {
  const { hostname } = req.params;
  const { type, value } = req.query;

  if (!type || !value) {
    return res.status(400).json({ error: 'Missing required query parameters: type and value' });
  }

  if (type === 'A') {
    if (!dnsStore.A.has(hostname)) {
      return res.status(404).json({ error: 'No A records found for this hostname' });
    }

    const ipSet = dnsStore.A.get(hostname);
    if (!ipSet.has(value)) {
      return res.status(404).json({ error: 'Specified A record not found' });
    }

    ipSet.delete(value);

    // If no IPs left for this hostname, remove the hostname from the store
    if (ipSet.size === 0) {
      dnsStore.A.delete(hostname);
    }

    return res.status(200).json({ message: 'A record deleted successfully' });

  } else if (type === 'CNAME') {
    if (!dnsStore.CNAME.has(hostname)) {
      return res.status(404).json({ error: 'No CNAME record found for this hostname' });
    }

    const current = dnsStore.CNAME.get(hostname);
    if (current !== value) {
      return res.status(404).json({ error: 'Specified CNAME record not found' });
    }

    dnsStore.CNAME.delete(hostname);
    return res.status(200).json({ message: 'CNAME record deleted successfully' });
  }

  return res.status(400).json({ error: 'Invalid record type. Supported types: A, CNAME' });
};
