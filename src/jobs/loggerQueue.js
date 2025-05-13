
const { Queue } = require('bullmq');
const { Redis } = require('ioredis');

const connection = new Redis({ maxRetriesPerRequest: null });
 // Default Redis connection

// Create a new queue for DNS logs
const loggerQueue = new Queue('dns-logs', {
  connection
});

module.exports = loggerQueue;
