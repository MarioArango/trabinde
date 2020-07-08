import bcrypt from 'bcryptjs';

const encriptacion = {};

encriptacion.password = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptado = await bcrypt.hash(password, salt);
    return passwordEncriptado;
};

export default encriptacion;