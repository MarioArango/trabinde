const bcrypt = require('bcryptjs');

const encriptacion = {};

encriptacion.password = (password) => {
    let passwordEncriptado;
    bcrypt.genSalt(10).then(salt => {
        passwordEncriptado = bcrypt.hash(password, salt);
    })
    return passwordEncriptado;
};

module.exports = encriptacion;