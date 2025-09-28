const express = require('express');
const routes = express.Router();
const fs = require('fs').promises
const path = require('path')

async function walk(dir, fileList = []) {
    const files = await fs.readdir(dir)
    for (const file of files) {
        const stat = await fs.stat(path.join(dir, file))
        if (stat.isDirectory()) fileList = await walk(path.join(dir, file), fileList)
        else fileList.push(path.join(dir, file))
    }
    return fileList
}
module.exports = async function (app) {
    let allFiles = await walk(path.join('resources', 'v1'))
    allFiles.forEach(file => {
        if (file.indexOf('route') > -1) {
            let fileNameArray = file.split('.')[0];
            let routeName = fileNameArray.split('/')[3] ? fileNameArray.split('/')[3] : fileNameArray.split('\\')[3];
            console.log('registering route: ', routeName);
            routes.use(`/${routeName}`, require(`../${fileNameArray}.routes`));
        }
    });

    app.get('/', function (req, res, next) {
        console.log('every thing is working fine......')
        return res.status(200).send({
            msg: 'everything is working fine.',
            host: req.get('host'),
        })
    });

    app.use('/', routes);

    // app.route('*').all((req, res) => {
    //     return res.status(404).send({
    //         msg: `'${req.host}' is not a valid endpoint. please check the request URL and try again.`
    //     })
    // })
}