//import dotenv from 'dotenv';
//dotenv.config();
const express = require('express');
//import morgan from 'morgan';
const multer = require('multer');
const { v4} = require('uuid');
const path = require('path');
const cors = require('cors');
const administradorRoutes = require('./routes/administrador.routes');
const solicitanteRoutes = require('./routes/solicitante.routes');
const trabajadorRoutes = require('./routes/trabajador.routes');

const app = express();


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, v4()+path.extname(file.originalname).toLocaleLowerCase());
    }
})

//MIDDLEWARES
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.header('Allow', 'GET,POST,OPTIONS,PUT,DELETE');
    next();
});
//app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(multer({
    storage,
    limits: {fileSize: 2000000},
    dest: path.join(__dirname, 'public/uploads'),
    fileFilter: (req, file, cb) => {
        const filetypes= /jpeg|png|jpg/;
        const mimetype= filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if(mimetype && extname){
            return cb(null, true);
        }
        cb("Error, el archivo deber ser una imagen jpeg, png o jpg");
    }
}).single('image'));

//SETTINGS
app.set('port', process.env.PORT || 6000);

//ROUTES

app.use('/api/administrador', administradorRoutes);
app.use('/api/solicitante', solicitanteRoutes);
app.use('/api/trabajador', trabajadorRoutes);

//INITIALIZATION
const init = () => {
        app.listen(app.get('port'), () => {
            console.log(`Conectado al servidor en el puerto ${app.get('port')}`); 
        });
}

init();