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

const trabajadorController = {};

//ITERACION 1
trabajadorController.registro_trabajador = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailTrabajadores, _password, _telefono} = req.body;

    const _foto = req.file.path;
    
    const sql = 'call SP_POST_RegistroTrabajador(?,?,?,?,?,?,?,?,?)';

    mysql.query('SELECT*FROM trabajadores WHERE emailTrabajadores = ?', [_emailTrabajadores], (er, dt) => {
        if(!er){
            if (dt[0] == undefined) {

                mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', [_dni], (error, data) => {

                    if(!error){
                        if (data[0] == undefined) {

                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(_password, salt, (err, passwordEncriptado) => {
                                    cloudinary.v2.uploader.upload(_foto).then(result => {

                                        mysql.query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, result.url, _emailTrabajadores, passwordEncriptado, _telefono], (err, data) => {
                                            if (!err) {
                                                fs.unlink(_foto, () => {
                                                    res.status(200).send({ status: "Success", message: "Registrado", code: 200 });
                                                });
                                            } else {
                                                res.status(400).send({ status: "Error", message: "No se pudo registrar", code: 400 });
                                            }
                                        });
                                    }).catch(error => {
                                        res.status(400).send({ status: "Error", message: "No se pudo registrar", code: 400 });
                                    })      
                                })
                            })
                            
                        } else {
                            res.status(400).send({ status: "Error", message: "DNI en uso", code: 400 });
                        }
                    }else{
                        res.status(400).send({ status: "Error", message: "Error de red", code: 400 });
                    }
                })
            } else {
                res.status(400).send({ status: "Error", message: "Email en uso", code: 400 });
            }
        }else{
            res.status(400).send({ status: "Error", message: "Error de red", code: 400 });
        }
    })
};


trabajadorController.login_trabajador = (req, res) => {
    const { _emailTrabajadores, _password } = req.body;
     
    const sql = 'call SP_GET_LoginTrabajador(?, ?)';

    const sql2 = 'SELECT t.emailTrabajadores, t.password FROM trabajadores AS t WHERE t.emailTrabajadores = ?';

    mysql.query(sql2, [_emailTrabajadores], (error, dat) => {

        if (!error) {
            if (dat.length != 0) {
                const passwordEncriptado = dat[0].password;
                bcrypt.compare(_password, passwordEncriptado).then(verf => {
                    if (verf) {
                        mysql.query(sql, [_emailTrabajadores, passwordEncriptado], (err, data) => {
                            if (!err) {
                                const tkn = token.signToken(data[0][0].idTrabajadores);
                                res.status(200).header('auth-token', tkn).send({ status: "Login correcto", data: data[0][0], code: 200 });
                            } else {
                                res.status(400).send({ status: "Error", message: "No se pudo, error de red", code: 400 });
                            }
                        });
                    } else {
                        res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                    }
                })
            } else {
                res.status(400).send({ status: "Error", message: "Email no existente", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de servidor", code: 400 });
        }
    })
};

//ITERACION 2
trabajadorController.subir_publicacion_galeria = (req, res) => {
    //const { _idTrabajadores, _urlimagen, _descripcion } = req.body;
    const { _idTrabajadores, _descripcion } = req.body;
    const _urlimagen = req.file.path;
    const sql = 'call SP_POST_SubirPublicacionGaleria(?, ?, ?)';

    cloudinary.v2.uploader.upload(_urlimagen).then(result => {
        mysql.query(sql, [_idTrabajadores, result.url, _descripcion], (error, data) => {
            if (!error) {
                fs.unlink(_urlimagen, () => {
                    res.status(200).send({ status: "Success", message: "Publicación subida", code: 200 });
                });
            } else {
                res.status(400).send({ status: "Error", message: "No se pudo subir la publicación", code: 400 });
            }
        }
        );
    }).catch(err => {
        res.status(400).send({ status: "Error", message: "No se pudo guardar la imagen", code: 400 });
    })
};


trabajadorController.perfil_publico_trabajador = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql1 = 'call SP_GET_PerfilPrivadoTrabajador(?)';
    const sql2 = 'call SP_GET_ListarPublicaciones(?)';
    mysql.query(sql1, [_idTrabajadores], (error, data) => {
        if(!error){
            const perfil = data[0][0];
            mysql.query(sql2, [_idTrabajadores], (err, dat) => {
                perfil.publicaciones = dat[0];
                if (!err) {
                    res.status(200).send({ status: "Success", data: perfil, code: 200 });
                } else {
                    res.status(400).send({ status: "Error", message: "Trabajador no encontrado", code: 400 });
                }   
            })
        }else {
            res.status(400).send({ status: "Error", message: "Perfil no encontrado", code: 400 });
        }
    }
    );
};


trabajadorController.perfil_privado_trabajador = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql = 'call SP_GET_PerfilPrivadoTrabajador(?)'
    mysql.query(sql, [_idTrabajadores], (error, data) => {
        if (!error) {
            res.status(200).send({ status: "Success", data: data[0], code: 200 });
        } else {
            res.status(400).send({ status: "Error", message: "Trabajador no encontrado", code: 400 });
        }
    }
    );
};


trabajadorController.editar_foto_perfil_trabajador = (req, res) => {
    //const { _idPersona, _foto } = req.body;
    const { _idPersona, _nombreRubro } = req.body;
    const _foto = req.file.path;
    const sql = 'call SP_PUT_EditarFotoPerfilTrabajador(?,?)'

    cloudinary.v2.uploader.upload(_foto).then(result=> {
        mysql.query(sql, [_idPersona, _nombreRubro, result.url], (error, data) => {
            if (!error) {
                fs.unlink(_foto, () => {
                    res.status(200).send({ status: "Success", message: "Foto actualizada", code: 200 });
                });
            } else {
                res.status(400).send({ status: "Error", message: "No se pudo actulizar su foto de perfil", code: 400 });
            }
        })
    }).catch(err => {
        res.status(400).send({ status: "Error", message: "No se pudo actulizar su foto de perfil, error de red", code: 400 });
    })
};

//ITERACION 4
/*trabajadorController.notificaciones = (req, res) => {
//SOCKET
};*/


trabajadorController.denunciar_solicitante = (req, res) => {
    //const { _idSolicitudes, _descripcionDenuncia, _urlPruebas } = req.body;
    const { _idSolicitudes, _descripcionDenuncia } = req.body;
    const _urlPruebas = req.file.path;
    const sql = "call SP_PUT_Denunciar(?,?,?)";

    cloudinary.v2.uploader.upload(_urlPruebas).then(result => {
        mysql.query(sql, [_idSolicitudes, _descripcionDenuncia, result.url], (error, data) => {
            if (!error) {
                fs.unlink(_urlPruebas, () => {
                    res.status(200).send({ status: "Success", message: "Denuncia efectuada", code: 200 });
                });
            } else {
                res.status(400).send({ status: "Error", message: "Denuncia no enviada", code: 400 });
            }
        }
        );
    }).catch(err => {
        res.status(400).send({ status: "Error", message: "Denuncia no enviada, error del servidor", code: 400 });
    })
};

trabajadorController.listar_contratos_con_solicitantes = (req, res) => {
    
    const { _idTrabajadores } = req.body;
    const sql = 'call SP_GET_ListarContratosConSolicitantes(?)';

    mysql.query(sql, [_idTrabajadores], (error, data) => {
        if (!error) {
            res.status(200).send({ status: "Success", message: data[0], code: 200 });
            
        } else {
            res.status(400).send({ status: "Error", message: "Error en el servidor", code: 400 });
        }
    }
    );
};

module.exports = trabajadorController;