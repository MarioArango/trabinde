//import dotenv from 'dotenv';
//dotenv.config();
const express = require("express");
//import morgan from 'morgan';
const multer = require("multer");
const { v4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const administradorRoutes = require("./routes/administrador.routes");
const solicitanteRoutes = require("./routes/solicitante.routes");
const trabajadorRoutes = require("./routes/trabajador.routes");

const app = express();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, v4() + path.extname(file.originalname).toLocaleLowerCase());
  },
});

//MIDDLEWARES
app.use(cors({ exposedHeaders: ["auth-token"] }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
  res.header("Allow", "GET,POST,OPTIONS,PUT,DELETE");
  next();
});
//app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  multer({
    storage,
    limits: { fileSize: 2000000 },
    dest: path.join(__dirname, "public/uploads"),
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|png|jpg/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname));
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb("Error, el archivo deber ser una imagen jpeg, png o jpg");
    },
  }).single("image")
);

//SETTINGS
app.set("port", process.env.PORT || 6000);

//ROUTES

app.use("/api/administrador", administradorRoutes);
app.use("/api/solicitante", solicitanteRoutes);
app.use("/api/trabajador", trabajadorRoutes);

//INITIALIZATION
const init = () => {
  app.listen(app.get("port"), () => {
  console.log(`Conectado al servidor en el puerto ${app.get("port")}`);
  });
}

init();

/*const server = app.listen(app.get("port"), () => {
  console.log(`Conectado al servidor en el puerto ${app.get("port")}`);
});

const SocketIO = require('socket.io'); 
const io = SocketIO.listen(server);
const mysql = require('./database');


//INICIAR CHAT ENVIANDO EL IDSOLICITANTE PARA CREAR UN ESPACIO
var espacioIdSolicitante = '';
app.post('/empezar-chat', (req, res) => {
    const { idSolicitantes } = req.body;
    espacioIdSolicitante = idSolicitantes;
    res.json('ok');
});

//SOCKET
//ESCUCHO AL ESPACIO DONDE TE CONECTASTE DEFINIDO POR EL idSolicitantes
if(espacioIdSolicitante != ''){
    io.of(`/${espacioIdSolicitante}`).on('connection', (socket) => {
        //ESCUCHO EL EVENTO UNA VEZ ENVIASTE EL MENSAJE AL HACER CLICK EN ENVIAR
        socket.on('msg-del-solicitante', (data) => {
            //ME ENVIAS ESTOS 3 DATOS
            const { _idSolicitantes, _idTrabajadores, _mensaje } = data;

            //ME UNO A UN SALON DETRO DE ESTE ESPACIO DEFINIDO POR EL idTrabajadores
            socket.join(_idTrabajadores);
            //EMITE A ESTE ESPACIO Y ESTA SALON ESTE EVENTO CON ESTOS DATOS
            io.of(`/${_idSolicitantes}`).in(_idTrabajadores).emit('chat-response', { _idSolicitantes, _mensaje });

            //COMO YA EMITI UN MENSAJE AHORA DEBO CREAR EL CHAT Y CAMBIAR EL ESTADO CHAT EN LA BD A 1 LIGANDO AL SOLICITANTE Y TRABAJADOR SEGUN SUS IDs
            const sql = 'call SP_POST_ActivarEstadoChatPorSolicitante(?,?,?)';

            mysql.query(sql, [_idSolicitantes, _idTrabajadores, _mensaje], (error, data) => {
                if (!error) {
                    //ESTE EVENTO ES PARA QUE LA NOTIFICACION SE ACTIVE EN LA PRIMERA VEZ QUE SE ENVIA UN MENSAJE Y CAMBIA DE 0 A 1 EL estadoChat
                    //ESTE EVENTO CORRESPENDO A LA CAMPANA O NOTIFICACION
                    //EL FRONT SE UNE A ESTE ESPACIO Y OYE ESTE EVENTO
                    socket.emit('nuevo-mensaje-trabajador', { mensaje: 'nuevo mensaje' });

                } else {
                    console.log('No se pudo ejecutar el query');
                }
            });
        });

        //TRABAJADOR
        //HABRE EL CHAT DEBE UNIRSE AL ESPACIO Y LA SALA, YA SE UNIO AL ESPACIO
        socket.on('ver-mensaje-solicitante', (data) => {

            const { idSolicitantes, idTrabajadores } = data;
            //SE UNE
            socket.join(idTrabajadores);
            //CUANDO HACE CLICK EL TRABAJADOR EN ENVIAR, EMITE A ESTE ESPACIO Y SALA ESOS DATOS
            socket.on('mensaje-trabajador', (dat) => {

                const { idSolicitantes, idTrabajadores, mensaje } = dat;

                io.of(`/${idSolicitantes}`).in(idTrabajadores).emit('chat-response', {
                    idTrabajadores, mensaje
                });
                //EMITE EVENTO DE NOTIFICACION
                socket.emit('nuevo-mensaje-solicitante', {
                    mensaje: 'nuevo mensaje'
                });
            });
        });
    });
}
*/
