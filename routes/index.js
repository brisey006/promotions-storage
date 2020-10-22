const express = require('express');
const router = express.Router();

router.use('/image', require('./images'));

module.exports = router;