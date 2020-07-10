const bcrypt = require('bcryptjs');

const encriptacion = {};

encriptacion.password = (password) => {
    bcrypt.genSalt(10).then(salt => {
        const passwordEncriptado = bcrypt.hash(password, salt);
        return passwordEncriptado;
    })
};

module.exports = encriptacion;