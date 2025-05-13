
const express = require('express');
const router = express.Router();
const dnsController = require('../controllers/dnsController');

router.post('/dns', dnsController.addRecord);

router.get('/dns/:hostname', dnsController.resolveRecord);

router.get('/dns/:hostname/records', dnsController.listRecords);

router.delete('/dns/:hostname', dnsController.deleteRecord);


module.exports = router;