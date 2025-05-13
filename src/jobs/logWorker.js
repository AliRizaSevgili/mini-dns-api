const { Worker } = require('bullmq');
const { Redis } = require('ioredis');

const worker = new Worker('dns-logs', async job => {
  const { hostname, resolvedTo, timestamp } = job.data;

  console.log(`[LOG] ${timestamp} - ${hostname} resolved to ${resolvedTo}`);
  
}, {
  connection: new Redis({ maxRetriesPerRequest: null })

});
