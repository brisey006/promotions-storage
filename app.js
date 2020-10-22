const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8082;

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload({
    createParentPath: true
}));

app.use(express.static(path.join(__dirname, './public')));
app.use((req, res, next) => {
    app.locals.publicDir = path.join(__dirname, './public');
    next();
});

app.use('/', require('./routes'));

app.use((req, res, next) => {
    const error = new Error(JSON.stringify(['Not Found.']));
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ errors: error.message });
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});