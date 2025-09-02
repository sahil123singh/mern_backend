const multer = require('multer');
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

module.exports = class UploadUtils {
    constructor(directoryPath = 'uploads/default/') {
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                fs.mkdirSync(directoryPath, { recursive: true })
                cb(null, directoryPath)
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname))
            }
        })
    }

    uploadFile(type = /jpg|jpeg|png|pdf/, fileSize = 20000000) {

        try {

            return multer({
                storage: this.storage,
                limits: { fileSize: fileSize }, // 2 mb

                fileFilter: (req, file, cb) => {
                    console.log('UplaodUtils@uploadFile')

                    const validFileType = type

                    const extname = validFileType.test(path.extname(file.originalname).toLocaleLowerCase())
                    return cb(null, true)

                }
            })

        } catch (error) {
            console.log("Error get all :", err);
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }
    }
}