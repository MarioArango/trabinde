import jwt from 'jsonwebtoken';
import moment from 'moment';

const verificarToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ status: 'Error', message: 'Token no existente', code: 401 });

    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    try {
       if(payload.exp <= moment().unix()){
           res.status(401).send({ status: 'Error', message: 'Token expirado', code: 401 });
       }
    } catch (error) {
        return res.status(400).send({ status: 'Error', message: 'Token incorrecto', code: 400 }); 
    }
    req.payload = payload;
    next();
};

export default verificarToken;