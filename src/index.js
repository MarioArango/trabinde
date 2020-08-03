if(process.env.NODE_ENV === 'development'){
  require('dotenv').config();
  var morgan = require('morgan');
}

const express = require("express");
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


/*app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});*/

/*
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100/');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method,');
  res.header('content-type: application/json; charset=utf-8')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next()
})*/



if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}
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
app.use(express.static(path.join(__dirname, 'views')));
app.use("/api/administrador", administradorRoutes);
app.use("/api/solicitante", solicitanteRoutes);
app.use("/api/trabajador", trabajadorRoutes);

//INITIALIZATION
/*const init = () => {
  app.listen(app.get("port"), () => {
  console.log(`Conectado al servidor en el puerto ${app.get("port")}`);
  });
}

init();
*/



const server = app.listen(app.get("port"), () => {
  console.log(`Conectado al servidor en el puerto ${app.get("port")}`);
});


const SocketIO = require('socket.io'); 
const io = SocketIO.listen(server);
const mysql = require('./database');


io.on('connection', (socket) => {
  //cuando el solicitante hace click en enviar
  socket.on('mensaje', data => {//idS, nombreEmisor, msnS, idT

    console.log(data);
    const { _idSolicitantes, _idTrabajadores, _mensaje, _nombre } = data;

    socket.join(`/${_idSolicitantes}/${_idTrabajadores}`);

    //en el front del trab validad si su idT es igual al que te envio y ahi pintas
    //lo mismo para el solicitante
    socket.emit('mensaje-usuario', { _idSolicitantes, _idTrabajadores, _mensaje, _nombre });

    const sql = 'call SP_POST_ActivarEstadoChatPorSolicitante(?,?)';
    const sqll = "SELECT*FROM solicitudes AS s WHERE s.idSolicitantes = ? AND s.idTrabajadores = ?";
    const sqlll = "call SP_PUT_VolverActivarEstadoChatCreadoPorSolicitante(?,?)";

    mysql.query(sqll, [_idSolicitantes, _idTrabajadores], (erro, dat) => {
      if(!erro){
        if(dat[0].estadoChat == 1){
          console.log('El chat fue creado con anterioridad');
        }else if(dat[0].idSolicitudes && dat[0].estadoChat == 0){
          mysql.query(sqlll, [_idSolicitantes, _idTrabajadores], (error, data) => {
            if (!error) {
              //en el front del trab validad si su idT es igual al que te envio y ahi pintas
              //lo mismo para el solicitante
              socket.emit('notificacion', { _idSolicitantes, _idTrabajadores });

            } else {
              console.log('Error de conexion');
            }
          });
        }else {
          mysql.query(sql, [_idSolicitantes, _idTrabajadores], (error, data) => {
            if (!error) {
              //en el front del trab validad si su idT es igual al que te envio y ahi pintas
              //lo mismo para el solicitante
              socket.emit('notificacion', { _idSolicitantes, _idTrabajadores });

            } else {
              console.log('Error de conexion');
            }
          });
        }
      }else {
        console.log('Error de conexion');
      }
    });
  });

  socket.on('contrato', data => {
    const { _idSolicitantes, _idTrabajadores } = data;

    socket.join(`/${_idTrabajadores}/${_idSolicitantes}`);

    //en el front del trab validad si su idT es igual al que te envio y ahi pintas
    socket.emit('nuevo-contrato', { _idSolicitantes, _idTrabajadores});

  });


});


/*
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
                    //EL YA ESTA EN EL ESPACIO Y EN EL FROMT YA TIENE EL IDSol asi que si
                    //se podra conectar y unir y escuchar este evento
                    socket.emit('nuevo-mensaje-trabajador', { mensaje: 'nuevo mensaje' });

                } else {
                    console.log('No se pudo ejecutar el query');
                }
            });
        });

        //TRABAJADOR
        //ABRE EL CHAT DEBE UNIRSE AL ESPACIO Y LA SALA, YA SE UNIO AL ESPACIO
        socket.on('ver-mensaje-solicitante', (data) => {

            const { _idSolicitantes, _idTrabajadores } = data;
            //SE UNE
            socket.join(_idTrabajadores);
            //CUANDO HACE CLICK EL TRABAJADOR EN ENVIAR, EMITE A ESTE ESPACIO Y SALA ESOS DATOS
            socket.on('mensaje-trabajador', (dat) => {

                const { idSolicitantes, idTrabajadores, mensaje } = dat;

                io.of(`/${idSolicitantes}`).in(idTrabajadores).emit('chat-response', {
                    idTrabajadores, mensaje
                });
                //EMITE EVENTO DE NOTIFICACION
                //El solicitante al tener su id podra escuchar
                socket.emit('nuevo-mensaje-solicitante', { mensaje: 'nuevo mensaje'});
            });
        });
    });
}*/
