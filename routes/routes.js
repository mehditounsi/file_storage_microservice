
const express = require('express');
const router = express.Router()
const Logger = require('winston');
const StorageController = require('../controllers/attachment')

router.post('/attachment/upload',StorageController.uploadAttachment);

router.get('/attachment/presignedurl',StorageController.presignedurl);

router.get('/attachment/getpresignedurl',StorageController.getpresignedurl);

router.get('/attachment/:id',StorageController.getAttachment);

router.get('/attachment/:id/download', StorageController.downloadAttachment);



module.exports = router;