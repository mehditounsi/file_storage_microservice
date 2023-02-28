const StorageService = require('../services/attachment')
const fs = require('fs');
const formidable = require('formidable');

exports.presignedurl = async (req = null,res = null) =>{
try {
  let filename = req.query.filename
  let result = await StorageService.presignedurl(filename)
  res.status(200).json(result)
} catch (err) {
  res.status(405).send({ error: err.message, code: err.code });
}
}



exports.getpresignedurl = async (req = null,res = null) =>{
  try {
    let filename = req.query.filename
    let result = await StorageService.getpresignedurl(filename)
    res.status(200).json(result)
  } catch (err) {
    res.status(405).send({ error: err.message, code: err.code });
  }
  }



exports.uploadAttachment = async (req = null, res = null, next = null) => {
  try {
    let form = new formidable.IncomingForm();
    let datafile
    let dataform = {}
    form.parse(req)
      .on('file',async function (name, files) {
        datafile = {
          "name": files.name,
          "path": files.path,
          "size": files.size,
          "type": files.type 
        }
      })
      .on('error',async function (err) {
        res.status(405).send({ error: err.message, code: err.code });
      })
      .on('end', async function () {
        if (dataform) {
         let attachment = await StorageService.uploadAttachment(datafile)
         res.status(200).json(attachment)
        }
        else {
          res.status(200).send({ error: 'missing arguments' });
        }
      });
  }
  catch (err) {
    res.status(405).send({ error: err.message, code: err.code });
  }
}


exports.downloadAttachment = async (req = null, res = null, next = null) => {
  try {
    let attachment_id = req.params.id
    let result = await StorageService.downloadAttachment(attachment_id);
    res.setHeader('Content-disposition', 'attachment; filename=' + result.name);
    var filestream = fs.createReadStream(result.file)
    filestream.pipe(res)
  } catch (err) {
    res.status(406).send({ error: err.message, code: err.code });
  }
}


exports.getAttachment = async (req = null, res = null, next = null) => {
  try {
    let attachment_id = req.params.id
    let result = await StorageService.getAttachment(attachment_id);
    res.status(200).json(result)
  } catch (err) {
    res.status(406).send({ error: err.message, code: err.code });
  }
}