const jwt = require('jsonwebtoken');
const moment = require('moment'); //NOS AYUDA CON LAS FECHAS

const token = {};

token.signToken = (id) => {

    const payload = {
        id,
        iat: moment().unix(), //CUANDO FUE CREADO EL TOKEN
        exp: moment().add(1440, 'minute').unix() //CUANDO VA EXPIRAR EL TOKEN
        //MOMENT AÑADE TANTO TIEMPO AL TIEMPO UNIX QUE SE CREO ARRIBA
    }
    return jwt.sign(payload, process.env.TOKEN_SECRET);
};


module.exports = token;