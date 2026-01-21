const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');
const userSchema = require('../model/user.model');

router.get('/', (req, res) => {
    controller.read(req, res, userSchema);
});

router.post('/', (req, res) => {
    controller.create(req, res, userSchema);
});

router.put('/:id', (req, res) => {
    controller.update(req, res, userSchema);
});

router.delete('/:id', (req, res) => {
    controller.remove(req, res, userSchema);
});

module.exports = router;
