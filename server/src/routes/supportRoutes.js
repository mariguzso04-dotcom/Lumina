const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.get('/', supportController.listSupport);
router.get('/countries', supportController.listCountries);

module.exports = router;
