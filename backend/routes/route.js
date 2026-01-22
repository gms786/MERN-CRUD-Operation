import express from 'express';
import * as controller from '../controller/controller.js';
import userSchema from '../model/user.model.js';

const router = express.Router();

router.get('/', (req, res) => controller.read(req, res, userSchema));
router.post('/', (req, res) => controller.create(req, res, userSchema));
router.put('/:id', (req, res) => controller.update(req, res, userSchema));
router.delete('/:id', (req, res) => controller.remove(req, res, userSchema));

export default router;
