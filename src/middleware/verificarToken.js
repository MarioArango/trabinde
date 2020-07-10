const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('auth-token');
    
    try {
        if (!token)  return res.status(401).send({ status: 'Error', message: 'Token no existente', code: 401 })
           
        const payload = jwt.verify(token, 'a$QYgmeE$qV');
        req.payload = payload;
        next();

    } catch (error) {

       if(error.name == 'TokenExpiredError') {
            return res.status(401).send({ status: 'Error', message: 'Token expirado', code: 401 });
        }

        return res.status(400).send({ status: 'Error', message: 'Token incorrecto', code: 400 }); 
    } 
};

module.exports = verificarToken;