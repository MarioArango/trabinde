import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
//import morgan from 'morgan';
import multer from 'multer';
import { v4 as uuidv4} from 'uuid';
import path from 'path';
import cors from 'cors';
import cloudinary from 'cloudinary';
import administradorRoutes from './routes/administrador.routes';
import solicitanteRoutes from './routes/solicitante.routes';
import trabajadorRoutes from './routes/trabajador.routes';

const app = express();


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, uuidv4()+path.extname(file.originalname).toLocaleLowerCase());
    }
})

//MIDDLEWARES
app.use(cors())
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
app.use('/', (req, res) => {
    res.send('Bienvenido');
})
app.use('/api/administrador', administradorRoutes);
app.use('/api/solicitante', solicitanteRoutes);
app.use('/api/trabajador', trabajadorRoutes);

//INITIALIZATION
const init = async () => {
    try {
        await app.listen(app.get('port'));
        console.log(`Conectado al servidor en el puerto ${app.get('port')}`);
        
    } catch (error) {
        console.log(`No se pudo conectar al servidor`);
        console.log(`Error: ${error}`);
    }
}

init();