const express = require('express');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { isAuthenticated } = require('../config/auth');
const { slugify } = require('../functions/general');
const { systemError } = require('../functions/errors');
const router = express.Router();

router.post('/', isAuthenticated, (req, res, next) => {
    try {
        sharp.cache(false);
        const { imagePath, extension, title } = req.body;
        const reqFile = req.files;
        if (reqFile == undefined) {
            return res.status(400).send('No files were uploaded.');
        }

        if (reqFile.file == undefined) {
            return res.status(400).send('No files were uploaded.');
        }
        
        let file = reqFile.file;
        let ext = extension;
        let date = moment(Date.now()).format('YYYY-MM-DD');
        let randomName = slugify(`${title} ${date}`);
        const fileN = `${randomName}.${ext}`;
    
        let finalFile = `${imagePath}/${fileN}`;
        let croppedFilePath = `${imagePath}/thumbnails/${randomName}.jpeg`;
    
        const publicDir = req.app.locals.publicDir;
        const finalImage = path.join(publicDir, finalFile);
        const finalCroppedImagePath = path.join(publicDir, croppedFilePath);
        
        file.mv(finalImage, async (err) => {
            if (err){
                const error = new Error(JSON.stringify([err.message]));
                next(error);
            } else {
                const image = sharp(finalImage);
                const data = await image.resize(250, 250).jpeg().toBuffer();
                const thumbnailDir = path.join(publicDir, `${imagePath}/thumbnails`);
                if (!fs.existsSync(thumbnailDir)) {
                    fs.mkdirSync(thumbnailDir);
                }
                fs.writeFile(finalCroppedImagePath, data, (err) => {
                    if (err) {
                        next(systemError(err.message));
                    } else {
                        res.json({ original: finalFile, thumbnail: croppedFilePath });
                    }
                });
            }
        });
    } catch (e) {
        next(systemError(e.message));
    }
});

router.post('/crop', isAuthenticated, async (req, res, next) => {
    try {
        sharp.cache(false);
        const { originalImageUrl, croppedImageUrl, cropDetails } = req.body;

        let { width, height, x, y } = cropDetails;
        x = x < 0 ? 0 : x;
        y = y < 0 ? 0 : y;
    
        const publicDir = req.app.locals.publicDir;
        const originalImage = path.join(publicDir, originalImageUrl);
        const finalCroppedImagePath = path.join(publicDir, croppedImageUrl);
        
        const image = sharp(originalImage);
        const data = await image
        .extract({ left: parseInt(x, 10), top: parseInt(y, 10), width: parseInt(width, 10), height: parseInt(height, 10) })
        .resize(250, 250).jpeg().toBuffer();
        
        fs.writeFile(finalCroppedImagePath, data, (err) => {
            if (err) {
                next(systemError(err.message));
            } else {
                res.sendStatus(201);
            }
        });
    } catch (e) {
        next(systemError(e.message));
    }
});

module.exports = router;