const mysql = require('../database');
const token = require('../util/crearToken');
const cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');

cloudinary.config({
    cloud_name: 'drne6kexd',
    api_key: '889385581853261',
    api_secret: '_3Q8ijH8FhIfvf39YGnzAroj7Cs'
})

const fs = require('fs-extra');

const solicitanteController = {};

//ITERACION 1
solicitanteController.registro_solicitante = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, _password} = req.body;

    const sql = 'call SP_POST_RegistroSolicitante(?, ?, ?, ?, ?, ?, ?)';

    mysql.query('SELECT*FROM solicitantes WHERE emailSolicitantes = ?', [_emailSolicitantes], (er, dt) => {
        if(!er){
           if(dt[0] == undefined){
            mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', _dni, (error, data) => {
                if(!error){
                    if (data[0] == undefined) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(_password, salt, (err, passwordEncriptado) => {
                                mysql.query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, passwordEncriptado], (e, dat) => {
                                    if (!e) {
                                        res.status(200).send({ status: "Success", message: "Registrado", code: 200 });
                                    }else {
                                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                    }
                                });
                            });
                        });
                    } else {
                        res.status(400).send({ status: "Error", message: "DNI en uso", code: 400 });
                    }
                }else{
                    res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                }
            });
            }else{
                res.status(400).send({ status: "Error", message: "Email en uso", code: 400 });
            } 
        }else{
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};


solicitanteController.login_solicitante = (req, res) => {
    const { _emailSolicitantes, _password } = req.body;
    const sql = 'call SP_GET_LoginSolicitante(?, ?)';
    const sql2 = 'SELECT s.emailSolicitantes, s.password FROM solicitantes AS s WHERE s.emailSolicitantes = ?';
    
    mysql.query(sql2, [_emailSolicitantes], (error, dat) => {
        if (!error){
            if(dat.length != 0){
                const passwordEncriptado = dat[0].password;
                bcrypt.compare(_password, passwordEncriptado).then(verf => {
                    if(verf){
                        mysql.query(sql, [_emailSolicitantes, passwordEncriptado], (err, data) => {
                            if (!err) {
                                const tkn = token.signToken(data[0][0].idSolicitantes);
                                res.status(200).header('auth-token', tkn).send({ status: "Login correcto", data: data[0][0], code: 200 });
                            }else{
                                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                            }
                    });
                    }else {
                        res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                    }
                });  
            }else{
                res.status(400).send({ status: "Error", message: "Email no existente", code: 400 });
            }
        }else{
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};


solicitanteController.listar_servicios_trabajadores = (req, res) => {
    const sql = 'call SP_GET_ListarServiciosTrabajadores()';
    mysql.query(sql, (error, data) => {
        if(!error){
            if(data.length != 0){
                res.status(200).send({ status: "Success", data: data[0], code: 200 });
            }else {
                res.status(200).send({ status: "Success", message: "Aun no hay trabajadores registrados", code: 200 });
            }   
        }else{
            res.status(400).send({ status: "Error", error, code: 400 });
        }
    });     
};


solicitanteController.buscador_servicios_trabajadores = (req, res) => {
    const { _nombreRubro } = req.body;
    const sql = "call SP_GET_BuscadorServiciosTrabajadores(?)";
    const sqll = 'SELECT*FROM rubros AS r WHERE r.nombreRubro = ? ';


    mysql.query(sqll, [_nombreRubro], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_nombreRubro], (error, data) => {
                    if (!error) {
                        if (data.length != 0) {
                            res.status(200).send({ status: "Success", data: data[0], code: 200 });
                        } else {
                            res.status(200).send({ status: "Success", message: "No hay trabajadores registrados en este rubro", code: 200 });
                        }
                    }else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 })
                    }
                });
            }else {
                res.status(400).send({ status: "Error", message: "Rubro no existente", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};


//ITERACION 2
solicitanteController.calificar_trabajador_individual = (req, res) => {
    
    const { _idTrabajadores, _idSolicitantes, _calificacionIndividual } = req.body;
    const sql = "call SP_PUT_CalificarTrabajadorIndividual(?,?,?)";
    const sqll = 'CALL SP_GET_ExistenciaDeSolicitudes(?,?)';

    mysql.query(sqll, [_idTrabajadores, _idSolicitantes], (err, dat) => {
        if(!err){
            console.log(dat);
            res.send(dat)
            /*if(dat.length != 0){
                mysql.query(sql, [_idTrabajadores, _idSolicitantes, _calificacionIndividual], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", message: "Calificacion asignada", code: 200 });
                    }else {
                        res.status(400).send({ status: "Error", error: "Error de conexion", code: 400 });
                    }
                });
            }else {
                res.status(200).send({ status: "Error", message: "No se puede calificar, aun no hay solicitudes de contrato entre estos participantes", code: 200 });
            } */
        }else {
            res.status(400).send({ status: "Error", error: "Error de conexion", code: 400 });
        }
    });
};


solicitanteController.perfil_solicitante = (req, res) => {
    const { _idSolicitantes } = req.body;
    const sql = "call SP_GET_PerfilSolicitante(?)"
    const sqll = 'SELECT*FROM solicitantes AS s WHERE s.idSolicitantes = ?';

    mysql.query(sqll, [_idSolicitantes], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_idSolicitantes], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", data: data[0], code: 200 });
                    } else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                });
            }else {
                res.status(200).send({ status: "Error", message: "Solicitante no registrado", code: 200 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

//ITERACION 3 CHAT

//ITERACION 4 
solicitanteController.denunciar_trabajador = (req, res) => {
    const { _idSolicitudes, _descripcionDenuncia} = req.body;
    const _urlPruebas = req.file.path;
    const sql = "call SP_PUT_Denunciar(?,?,?)";
    const sqll = 'SELECT*FROM solicitudes AS s WHERE s.idSolicitudes = ?';

    mysql.query(sqll, [_idSolicitudes], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                cloudinary.v2.uploader.upload(_urlPruebas).then(result => {
                    mysql.query(sql, [_idSolicitudes, _descripcionDenuncia, result.url], (error, data) => {
                        if (!error) {
                            fs.unlink(_urlPruebas, () => {
                                res.status(200).send({ status: "Success", message: "Denuncia efectuada", code: 200 });
                            });
                        } else {
                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                        }
                    }
                    );
                }).catch(err => {
                    res.status(400).send({ status: "Error", message: "Denuncia no enviada, error del servidor", code: 400 });
                });
            }else {
                res.status(400).send({ status: "Error", message: "No existe la solicitud", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

solicitanteController.listar_contratos_con_trabajadores = (req, res) => {
    const { _idSolicitantes } = req.body;
    const sql = "call SP_GET_ListarContratosConTrabajadores(?)";
    const sqll = "SELECT*FROM solicitantes AS s WHERE s.idSolicitantes = ?";

    mysql.query(sqll, [_idSolicitantes], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_idSolicitantes], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", message: data[0], code: 200 });

                    }else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                });
            }else {
                res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

module.exports = solicitanteController;