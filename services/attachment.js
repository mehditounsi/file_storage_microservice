const Attachment = require('../models/attachment');
const fs = require('fs');
const Minio = require('minio')
var FileReader = require('filereader')

const { messages } = require('../config/messages');
const storage_path = '/storage/'
const tmp_dir = '/storage/'

var minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: process.env.MINIO_PORT = 9001,
  useSSL: process.env.MINIO_USESSL = false,
  accessKey:process.env.MINIO_ACCESS_KEY,
  secretKey:process.env.MINIO_SECRET_KEY,
  signatureVersion: 'v4',
})
const EventEmitter = require('events');


exports.presignedurl = async (filename) =>{
  return await minioClient.presignedPutObject(process.env.MINIO_BUCKET,filename)
}



exports.getpresignedurl = async (filename) =>{
  return await minioClient.presignedGetObject(process.env.MINIO_BUCKET,filename)
}


exports.uploadAttachment = async (datafile) => {
  try {
    if (datafile) {

      if (process.env.STORAGE_MODE === "FS") {
        
      let attachment = new Attachment({
        filename: datafile.name,
        size: datafile.size,
        type: datafile.type
      })
      await attachment.save()
        // File SysTem Storage
        if (attachment) {
          if (!fs.existsSync(storage_path)) {
            fs.mkdirSync(storage_path)
          }
          fs.renameSync(datafile.path, storage_path + attachment.id)
          let options = { width: 100, height: 100 }
          return attachment
        }
      }
      //MINIO storage
      if (process.env.STORAGE_MODE === "MIO") {
        
      let attachment = new Attachment({
        filename: datafile.name,
        size: datafile.size,
        type: datafile.type
      })
      await attachment.save()
        var reader = new FileReader();
        reader.readAsArrayBuffer(datafile);
        reader.onload = async function () {
        await minioClient.putObject(process.env.MINIO_BUCKET, attachment._id.toString(), reader.result, attachment.size, attachment.type, function (e) {
            if (e) {
              return console.log(e)
            }
            console.log("Successfully uploaded the stream")
            return attachment
          })
        }
        return attachment
      };
    }
  } catch (error) {
    console.log(error);
  }
  //throw new Error(error)
}


exports.getObject = async (attachment_id) => {
  if (attachment_id) {
    let chunks = [];

    minioClient.getObject(process.env.MINIO_BUCKET, attachment_id, function (error, dataStream) {
      if (error) {
        return console.log(error)
      }
      dataStream.on('data', function (chunk) {
        chunks.push(chunk);
      })
      dataStream.on('end', function () {
        console.log(chunks);
        return Buffer.concat(chunks);
      })
      dataStream.on('error', function (error) {
        console.log('error => ', error)
      })
    })
  } else {
    throw new Error(messages.UNDEFINED_ARGUMENT)
  }
}
//----------------------------- Download attachment -------------------------
exports.downloadAttachment = async (attachment_id) => {

  if (attachment_id) {
    const attachment = await Attachment.findById(attachment_id)
    if (attachment) {
      if (process.env.STORAGE_MODE === "FS") { 
        let file_path = storage_path + attachment.id
        let file_tmp = tmp_dir + attachment.id
        let filename = await attachment.filename
        if (fs.existsSync(file_path)) {
          fs.copyFileSync(file_path, file_tmp)
          return { file: file_tmp, name: filename };
        } else {
          throw new Error(messages.FILE_NOT_FOUND)
        }
      }
    }
    if (attachment) {
      if (process.env.STORAGE_MODE === "MIO") {
        let filename = await attachment.filename
        let chunks = [];
        return new Promise((resolve, reject) => {
          minioClient.getObject(process.env.MINIO_BUCKET, attachment_id, function (error, dataStream) {
            dataStream.on('data', function (chunk) {
              chunks.push(chunk);
            })
            dataStream.on('end', function () {
              console.log(chunks);
              resolve({ name: filename, chunks: Buffer.concat(chunks) })
            })
            dataStream.on('error', function (error) {
              reject(error);
            }) 
          })
        });
      }
    }
  }
}

//----------------------------- get attachment -------------------------
exports.getAttachment = async (attachment_id) => {
  if (process.env.STORAGE_MODE === "FS") {
    if (attachment_id) {
      const attachment = await Attachment.findById(attachment_id)
      if (attachment) {
        let file_path = storage_path + attachment.id
        return fs.readFileSync(file_path, { encoding: 'base64' })
      } else {
        throw new Error(messages.UNDEFINED_ARGUMENT)
      }
    } else {
      throw new Error(messages.UNDEFINED_ARGUMENT)
    }
  }
  
  if (process.env.STORAGE_MODE === "MIO") {
    let chunks = [];
    return new Promise((resolve, reject) => {
      minioClient.getObject(process.env.MINIO_BUCKET, attachment_id, function (error, dataStream) {
        dataStream.on('data', function (chunk) {
          chunks.push(chunk);
        })
        dataStream.on('end', function () {
          console.log(chunks);
          resolve({chunks: Buffer.concat(chunks) })
        })
        dataStream.on('error', function (error) {
          reject(error);
        })
      })
    });

  }

}