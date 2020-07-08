import dotenv from 'dotenv';
dotenv.config();
import mysql from '../database';
import token from '../util/crearToken';
import encriptacion from '../util/encriptacion';
import cloudinary from 'cloudinary';
import bcrypt from 'bcryptjs';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

import fs from 'fs-extra';

const trabajadorController = {};

//ITERACION 1
trabajadorController.registro_trabajador = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailTrabajadores, _password, _telefono} = req.body;

    const _foto = req.file.path;
    
    const sql = 'call SP_POST_RegistroTrabajador(?,?,?,?,?,?,?,?,?)';

    mysql.query('SELECT*FROM trabajadores WHERE emailTrabajadores = ?', [_emailTrabajadores], (er, dt) => {
        if(dt[0] == undefined){

            mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', [_dni], (error, data) => {
                if (data[0] == undefined) {

                    encriptacion.password(_password).then(passwordEncriptado => {

                        cloudinary.v2.uploader.upload(_foto).then(result => {

                            mysql.query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, result.url, _emailTrabajadores, passwordEncriptado, _telefono], (error, data) => {
                                if (!error) {
                                    fs.unlink(_foto, () => {
                                        res.status(200).send({ status: "Success", message: "Registrado", code: 200 });
                                    });
                                } else {
                                    res.status(400).send({ status: "Error", message: "No se pudo registrar", code: 400 });
                                }
                            });
                        }).catch(error => {
                            console.log('No se obtuvo respuesta de cloudinary: ', error);
                        })

                    }).catch(error => {
                        console.log('Error de red');
                    })
                } else {
                    res.status(400).send({ status: "Error", message: "DNI en uso", code: 400 });
                }
            })
        }else{
            res.status(400).send({ status: "Error", message: "Email en uso", code: 400 });
        }
    })
};


trabajadorController.login_trabajador = (req, res) => {
    const { _emailTrabajadores, _password } = req.body;
     
    const sql = 'call SP_GET_LoginTrabajador(?, ?)';

    const sql2 = 'SELECT t.emailTrabajadores, t.password FROM trabajadores AS t WHERE t.emailTrabajadores = ?';

    mysql.query(sql2, [_emailTrabajadores], async (error, dat) => {

        if (!error) {
            if (dat.length != 0) {
                const passwordEncriptado = dat[0].password;
                const verf = await bcrypt.compare(_password, passwordEncriptado);

                if (verf) {
                    mysql.query(sql, [_emailTrabajadores, passwordEncriptado], (error, data) => {
                        if (!error) {
                            const tkn = token.signToken(data[0][0].idTrabajadores);
                            res.status(200).header('auth-token', tkn).send({ status: "Login correcto", data: data[0][0], code: 200 });
                        } else {
                            res.status(400).send({ status: "Error", message: "No se pudo, error de red", code: 400 });
                        }
                    });
                } else {
                    res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                }
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
    }).catch(error => {
        console.log('No se obtuvo respuesta de cloudinary: ', error);
    })
};


trabajadorController.perfil_publico_trabajador = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql1 = 'call SP_GET_PerfilPrivadoTrabajador(?)';
    const sql2 = 'call SP_GET_ListarPublicaciones(?)';
    mysql.query(sql1, [_idTrabajadores], (error, data) => {
       const perfil = data[0][0];
        mysql.query(sql2, [_idTrabajadores], (err, dat) => {
            perfil.publicaciones = dat[0];
            if (!error) {
            res.status(200).send({ status: "Success", data: perfil, code: 200 });
            } else {
            res.status(400).send({ status: "Error", message: "Trabajador no encontrado", code: 400 });
            }   
        })
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


trabajadorController.editar_foto_perfil_trabajador = async (req, res) => {
    //const { _idPersona, _foto } = req.body;
    const { _idPersona } = req.body;
    const _foto = req.file.path;
    const sql = 'call SP_PUT_EditarFotoPerfilTrabajador(?,?)'

    cloudinary.v2.uploader.upload(_foto).then(result=> {
        mysql.query(sql, [_idPersona, result.url], (error, data) => {
            if (!error) {
                fs.unlink(_foto, () => {
                    res.status(200).send({ status: "Success", message: "Foto actualizada", code: 200 });
                });
            } else {
                res.status(400).send({ status: "Error", message: "No se pudo actulizar su foto de perfil", code: 400 });
            }
        })
    }).catch(error => {
        console.log('No se obtuvo respuesta de cloudinary: ', error);
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
    const sql = "call SP_POST_Denunciar(?,?,?)";

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
    }).catch(error => {
        console.log('No se obtuvo respuesta de cloudinary: ', error);
    })
};

export default trabajadorController;