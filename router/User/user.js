const express = require('express');
const router = express.Router();

const userController = require('../../controller/User/user');

router.get('/:id', userController.getProfile);

module.exports = router;