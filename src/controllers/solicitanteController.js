const mysql = require('../database');
const token = require('../util/crearToken');
const cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


const fs = require('fs-extra');

const solicitanteController = {};

//ITERACION 1
solicitanteController.registro_solicitante = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, _password} = req.body;

    const sql = 'call SP_POST_RegistroSolicitante(?, ?, ?, ?, ?, ?, ?)';

    
    mysql.query('SELECT*FROM solicitantes WHERE emailSolicitantes = ?', [_emailSolicitantes], (er, dt) => {
        if (!er) {
            if (dt[0] == undefined) {
                mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', _dni, (error, data) => {
                    if (!error) {
                        if (data[0] == undefined) {
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(_password, salt, (err, passwordEncriptado) => {
                                    mysql.query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, passwordEncriptado], (e, dat) => {
                                        if (!e) {
                                            res.status(200).send({ status: "Success", message: "Registrado", code: 200 });
                                        } else {
                                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                        }
                                    });
                                });
                            });
                        } else {
                                res.status(400).send({ status: "Error", message: "DNI en uso", code: 400 });
                        }
                    } else {
                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                });
            } else {
                res.status(400).send({ status: "Error", message: "Email en uso", code: 400 });
            }
        } else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};


solicitanteController.login_solicitante = (req, res) => {
    const { _emailSolicitantes, _password } = req.body;
    const sql = 'call SP_POST_LoginSolicitante(?, ?)';
    const sql2 = 'SELECT s.emailSolicitantes, s.password FROM solicitantes AS s WHERE s.emailSolicitantes = ?';
    
    mysql.query(sql2, [_emailSolicitantes], (error, dat) => {
        if (!error){
            if(dat.length != 0){
                if (dat[0].estadoUsuario == 1){
                    const passwordEncriptado = dat[0].password;
                    bcrypt.compare(_password, passwordEncriptado).then(verf => {
                        if (verf) {
                            mysql.query(sql, [_emailSolicitantes, passwordEncriptado], (err, data) => {
                                if (!err) {
                                    const tkn = token.signToken(data[0][0].tipoUsuario);
                                    res.status(200).header('auth-token', tkn).send({ status: "Login correcto", data: data[0][0], code: 200 });
                                } else {
                                    res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                }
                            });
                        } else {
                            res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                        }
                    });
                }else {
                    res.status(400).send({ status: "Error", message: "Solicitante deshabilido", code: 400 });
                }  
            }else{
                res.status(400).send({ status: "Error", message: "Email no existente", code: 400 });
            }
        }else{
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

//
solicitanteController.listar_servicios_trabajadores = (req, res) => {
    if(req.payload.id == 0) {
        const sql = "call SP_GET_ListarServiciosTrabajadores()";
        mysql.query(sql, (error, data) => {
          if (!error) {
            if (data.length != 0) {
              res.status(200).send({status: "Success", data: data[0], code: 200});
            } else {
              res.status(400).send({status: "Success", message: "Aun no hay trabajadores registrados", code: 400});
            }
          } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
          }
        }); 
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }    
};

//
solicitanteController.buscador_servicios_trabajadores = (req, res) => {
    if(req.payload.id == 0){
        const { _nombreRubro } = req.body;
        const sql = "call SP_POST_BuscadorServiciosTrabajadores(?)";
        const sqll = 'SELECT*FROM rubros AS r WHERE r.nombreRubro = ? ';
        mysql.query(sqll, [_nombreRubro], (err, dat) => {
            if(!err){
                if(dat.length != 0){
                    mysql.query(sql, [_nombreRubro], (error, data) => {
                        if (!error) {
                            if (data.length != 0) {
                                res.status(200).send({ status: "Success", data: data[0], code: 200 });
                            } else {
                                res.status(400).send({ status: "Success", message: "No hay trabajadores registrados en este rubro", code: 400 });
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
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};


//ITERACION 2
//
solicitanteController.calificar_trabajador_individual = (req, res) => {
    if(req.payload.id == 0){
        const { _idTrabajadores, _idSolicitantes, _calificacionIndividual } = req.body;
        const sql = "call SP_PUT_CalificarTrabajadorIndividual(?,?,?)";
        const sqll = 'CALL SP_GET_ExistenciaDeSolicitudes(?,?)';

        mysql.query(sqll, [_idTrabajadores, _idSolicitantes], (err, dat) => {
            if(!err){
                if(dat[0].length != 0){
                    mysql.query(sql, [_idTrabajadores, _idSolicitantes, _calificacionIndividual], (error, data) => {
                        if (!error) {
                            res.status(200).send({ status: "Success", message: "Calificacion asignada", code: 200 });
                        }else {
                            res.status(400).send({ status: "Error", error: "Error de conexion", code: 400 });
                        }
                    });
                }else {
                    res.status(400).send({ status: "Error", message: "No se puede calificar, aun no hay solicitudes de contrato entre estos participantes", code: 400 });
                }
            }else {
                res.status(400).send({ status: "Error", error: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};

//
solicitanteController.perfil_solicitante = (req, res) => {
    if(req.payload.id == 0){
        const { _idSolicitantes } = req.body;
        const sql = "call SP_POST_PerfilSolicitante(?)"
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
                    res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
                }
            }else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};

//ITERACION 3 CHAT

//ITERACION 4 
//
solicitanteController.denunciar_trabajador = (req, res) => {
    if(req.payload.id == 0){
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
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
    
};
//
solicitanteController.listar_contratos_con_trabajadores = (req, res) => {
    if(req.payload.id == 0){
        const { _idSolicitantes } = req.body;
        const sql = "call SP_POST_ListarContratosConTrabajadores(?)";
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
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};

//CAMBIAR CONTRASEÑA
solicitanteController.cambiar_contrasenia_solicitante = (req, res) => {
    if (req.payload.id == 0){
        const { _dni, _emailSolicitantes, _password, _nuevaContrasenia } = req.body;
        const sql = "call SP_PUT_CambiarContraseniaSolicitante(?, ?)";
        const sqll = "SELECT*FROM persona AS p WHERE p.dni = ?";
        const sqlll = "SELECT*FROM solicitantes AS s WHERE s.idPersona = ? AND s.emailSolicitantes = ?";
        mysql.query(sqll, [_dni], (error, data) => {
            if (!error) {
                if (data.length != 0) {
                    const _idPersona = data[0].idPersona;
                    mysql.query(sqlll, [_idPersona, _emailSolicitantes], (err, dat) => {
                        if (!err) {
                            if (dat.length != 0) {
                                const _passwordEncriptado = dat[0].password;
                                bcrypt.compare(_password, _passwordEncriptado).then(verf => {
                                    if (verf) {
                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash(_nuevaContrasenia, salt, (err, passwordEncriptado) => {
                                                mysql.query(sql, [_emailSolicitantes, passwordEncriptado], (e, dt) => {
                                                    if (!e) {
                                                        res.status(200).send({ status: "Success", message: "Contraseña modificada", code: 200 });
                                                    } else {
                                                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                                    }
                                                });
                                            });
                                        });
                                    } else {
                                        res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                                    }
                                }).catch(e => res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 }));
                            } else {
                                res.status(400).send({ status: "Error", message: "Email no corresponde al DNI registrado", code: 400 });
                            }
                        } else {
                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                        }
                    });
                } else {
                    res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
                }
            } else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};
//
solicitanteController.recuperar_contrasenia = (req, res) => {
    const { _dni, _nombre, _apellidoPaterno, _apellidoMaterno, _distrito, _emailSolicitantes, _nuevaContrasenia } = req.body;
    const sql = 'call SP_POST_VerificarDatosRecuperarContraseniaSolicitante(?,?,?,?,?,?)';
    const sqll = 'call SP_PUT_ActualizarSimpleContraseniaSolicitantes(?,?)';

    mysql.query(sql, [_dni, _nombre, _apellidoPaterno, _apellidoMaterno, _distrito, _emailSolicitantes], (error, data) => {
        if (!error) {
            if (data[0].length != 0) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(_nuevaContrasenia, salt, (err, passwordEncriptado) => {
                        mysql.query(sqll, [_dni, passwordEncriptado], (e, dt) => {
                            if (!e) {
                                res.status(200).send({ status: "Success", message: "Contraseña modificada", code: 200 });
                            } else {
                                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                            }
                        });
                    });
                });
            } else {
                res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de sssonexion", code: 400 });
        }
    });
};

//CHAT 
solicitanteController.listar_contactos_trabajadores = (req, res) => {

    if(req.payload.id == 0){
        const {_idSolicitantes} = req.body;
        const sql = 'call SP_POST_ListarContactosTrabajadores(?)';
        const sqll = 'SELECT*FROM solicitantes AS s WHERE s.idSolicitantes = ?';

        mysql(sqll, [_idSolicitantes], (erro, dat) => {
            if(!erro){
                if(dat.length != 0) {
                    mysql.query(sql, [_idSolicitantes], (error, data) => {
                        if (!error) {
                            if (data.length != 0) {
                                res.status(200).send({ status: "Success", message: data[0], code: 200 });
                            } else {
                                res.status(400).send({ status: "Error", message: "No hay contactos", code: 400 });
                            }
                        } else {
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
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};

solicitanteController.desactivar_estado_chat_solicitante = (req, res) => {

    if(req.payload.id == 0){
        const { _idSolicitantes } = req.body;
        const sql = 'call SP_PUT_DesactivarEstadoChatSolicitante(?)';
        const sqll = 'SELECT*FROM solicitantes AS s WHERE s.idSolicitantes = ?';
        const sqlll = 'SELECT*FROM chat AS ch WHERE ch.idSolicitantes = ?';

        mysql.query(sqll, [_idSolicitantes], (erro, dat) => {
            if(!erro){
                if(dat.length != 0){
                    mysql.query(sqlll, [_idSolicitantes], (er, dt) => {
                        if(dt[0].estadoChat = 0) {
                            res.status(400).send({ status: "Error", message: "El estado estaba deshabilitado", code: 400 });
                        }else {
                            mysql.query(sql, [_idSolicitantes], (error, data) => {
                                if (!error) {
                                    res.status(200).send({ status: "Success", message: 'El estado fue deshabilitado', code: 200 });
                                } else {
                                    res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                }
                            });
                        }
                    });
                }else {
                    res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
                }
            }else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El trabajador no puede hacer esta consulta, le corresponde al solicitante", code: 400 });
    }
};

module.exports = solicitanteController;