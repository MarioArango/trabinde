const bcrypt = require('bcryptjs');

const encriptacion = {};

encriptacion.password = (password) => {
    let passwordEncriptado;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            passwordEncriptado = hash;
        })
    })
    return passwordEncriptado;
};

module.exports = encriptacion;