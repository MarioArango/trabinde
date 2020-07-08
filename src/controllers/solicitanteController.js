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

const solicitanteController = {};

//ITERACION 1
solicitanteController.registro_solicitante = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, _password} = req.body;

    const sql = 'call SP_POST_RegistroSolicitante(?, ?, ?, ?, ?, ?, ?)';

    mysql.query('SELECT*FROM solicitantes WHERE emailSolicitantes = ?', [_emailSolicitantes], (er, dt) => {
        
        if(dt[0] == undefined){
            mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', _dni, (error, data) => {
                if (data[0] == undefined) {

                    encriptacion.password(_password).then(passwordEncriptado => {
                        console.log(passwordEncriptado);

                        mysql.query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, passwordEncriptado], (error, data) => {
                            if (!error) {
                                res.status(200).send({ status: "Success", message: "Registrado", code: 200 });
                            } else {
                                res.status(400).send({ status: "Error", message: "No se pudo registrar", code: 400 });
                            }
                        });
                    }).catch(error => {
                        console.log('No se pudo registrar');
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


solicitanteController.login_solicitante = (req, res) => {
    const { _emailSolicitantes, _password } = req.body;
    const sql = 'call SP_GET_LoginSolicitante(?, ?)';

    const sql2 = 'SELECT s.emailSolicitantes, s.password FROM solicitantes AS s WHERE s.emailSolicitantes = ?';
    
    mysql.query(sql2, [_emailSolicitantes], async (error, dat) => {

        if (!error){
            if(dat.length != 0){
                const passwordEncriptado = dat[0].password;
                const verf = await bcrypt.compare(_password, passwordEncriptado);

                if(verf){
                    mysql.query(sql, [_emailSolicitantes, passwordEncriptado], (error, data) => {
                            if (!error) {
                                const tkn = token.signToken(data[0][0].idSolicitantes);
                                res.status(200).header('auth-token', tkn).send({ status: "Login correcto", data: data[0][0], code: 200 });
                            }else{
                                res.status(400).send({ status: "Error", message: "No se pudo, error de red", code: 400 });
                            }
                    });
                }else{
                    res.status(400).send({ status: "Error", message: "Contraseña incorrecta", code: 400 });
                }
            }else{
                res.status(400).send({ status: "Error", message: "Email no existente", code: 400 });
            }
        }else{
            res.status(400).send({ status: "Error", message: "Error de servidor", code: 400 });
        }
    })
};


solicitanteController.listar_servicios_trabajadores = (req, res) => {
    const sql = 'call SP_GET_ListarServiciosTrabajadores()';
    mysql.query(sql, (error, data) => {
        if(!error){
            res.status(200).send({ status: "Success", data: data[0], code: 200 });
        }else{
            res.status(400).send({ status: "Error", error, code: 400 });
        }
    });     
};


solicitanteController.buscador_servicios_trabajadores = (req, res) => {
    const sql = "call SP_GET_BuscadorServiciosTrabajadores(?)";
    const { _nombreRubro } = req.body;
    mysql.query(sql, [_nombreRubro], (error, data) => {
        if(!error){
            res.status(200).send({ status: "Success", data: data[0], code: 200 })
        }else{
            res.status(400).send({ status: "Error", error, code: 400 })
        }
    })
};


//ITERACION 2
solicitanteController.calificar_trabajador_individual = (req, res) => {
    const sql = "call SP_POST_CalificarTrabajadorIndividual(?,?,?)";
    const { _idTrabajadores, _idSolicitantes, _calificacionIndividual } = req.body;
    mysql.query(sql, [_idTrabajadores, _idSolicitantes, _calificacionIndividual], (error, data) => {
        if(!error){
            res.status(200).send({ status: "Success", message: "Calificacion asignada", code: 200 });
        }else {
            res.status(400).send({ status: "Error", error, code: 400 });
        }
    }); 
};


solicitanteController.perfil_solicitante = (req, res) => {
    const { _idSolicitantes } = req.body;
    const sql = "call SP_GET_PerfilSolicitante(?)"
    mysql.query(sql, [_idSolicitantes], (error, data) => {
        if (!error) {
            res.status(200).send({ status: "Success", data: data[0], code: 200 });
        } else {
            res.status(400).send({ status: "Error", message: "Perfil no enviado", code: 400 });
        }
    }
    );
};

//ITERACION 3 CHAT

//ITERACION 4 
solicitanteController.denunciar_trabajador = (req, res) => {
    //const { _idSolicitudes, _descripcionDenuncia, _urlPruebas} = req.body;
    const { _idSolicitudes, _descripcionDenuncia} = req.body;
    const _urlPruebas = req.file.path;
    const sql = "call SP_POST_Denunciar(?,?,?)";

    console.log(process.env.API_KEY);
    

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


export default solicitanteController;