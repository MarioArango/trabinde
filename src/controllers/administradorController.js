const mysql = require('../database');
const token = require('../util/crearToken');

const administradorController = {};

//ITERACION 3
administradorController.login_administrador = (req, res) => {
    const { _dni, _password } = req.body;
    const sql = 'call SP_POST_LoginAdministrador(?,?)';

    mysql.query('SELECT p.dni FROM persona AS p WHERE p.dni = ?', [_dni], (error, data) => {
        if(!error){
            if(data.length != 0){
               mysql.query(sql, [_dni, _password], (error, data) => {
                   if (!error) {
                    const tkn = token.signToken(data[0][0].idAdministradores);
                    res.status(200).header('auth-token', tkn).send({ status: "Success", data: data[0][0], code: 200 });
                } else {
                    res.status(400).send({ status: "Error", message: "Administrador no encontrado", code: 400 });
                }
                });
            }else {
                res.status(400).send({ status: "Error", message: "DNI no registrado", code: 400 });
            } 
        }else{
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

administradorController.listar_trabajadores = (req, res) => {
    const sql = 'call SP_GET_AdministradorListarTrabajadores()';
    mysql.query(sql, (error, data) => {
        if (!error) {
            if(data.length != 0){
                res.status(200).send({ status: "Success", data: data[0], code: 200 });
            }else{
                res.status(200).send({ status: "Success", message: "No hay trabajadores registrados", code: 200 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })   
};

administradorController.listar_solicitantes = (req, res) => {
    const sql = 'call SP_GET_AdministradorListarSolicitantes()';
    mysql.query(sql, (error, data) => {
        if (!error) {
            if(data.length != 0){
               res.status(200).send({ status: "Success", message: data[0], code: 200 }); 
            }else{
                res.status(200).send({ status: "Success", message: "No hay solicitantes registrados", code: 200 });
            }  
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })   
};


administradorController.deshabilitar_habilitar_solicitante= (req, res) => {  
    const {_dni} = req.body;
    const sql = 'call SP_PUT_AdministradorDeshabilitarHabilitarSolicitante(?)';
    const sql1 = 'SELECT s.estadoUsuario FROM solicitantes AS s JOIN persona AS p ON s.idPersona = p.idPersona WHERE p.dni = ?'

    mysql.query(sql1, [_dni], (error, data) => {
        if (!error){
            if (data.length != 0){
                const estadoUsuario = data[0].estadoUsuario;
                mysql.query(sql, [_dni], (err, dat) => {
                    if (!err) {
                        if (estadoUsuario == 1) {
                            res.status(200).send({ status: "Success", message: "Solicitante deshabilitado", code: 200 });
                        } else {
                            res.status(200).send({ status: "Success", message: "Solicitante habilitado", code: 200 });
                        }
                    } else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                }); 
            }else {
                res.status(400).send({ status: "Error", message: "Dni no existente", code: 400 });
            }
        }else{
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

administradorController.deshabilitar_habilitar_trabajador = (req, res) => {
    const { _dni } = req.body;
    const sql = 'call SP_PUT_AdministradorDeshabilitarHabilitarTrabajador(?)';
    const sql1 = 'SELECT t.estadoUsuario FROM trabajadores AS t JOIN persona AS p ON t.idPersona = p.idPersona WHERE p.dni = ?'

    mysql.query(sql1, [_dni], (error, data) => {
        if(!error){
            if(data.length != 0){
                const estadoUsuario = data[0].estadoUsuario;
                mysql.query(sql, [_dni], (err, dat) => {
                    if (!err) {
                        if (estadoUsuario == 1) {
                            res.status(200).send({ status: "Success", message: "Trabajador deshabilitado", code: 200 });
                        } else {
                            res.status(200).send({ status: "Success", message: "Trabajador habilitado", code: 200 });
                        }
                    } else {
                        res.status(400).send({ status: "Error", message: "No se deshabilitar el usuario", code: 400 });
                    }
                })
            }else {
                res.status(400).send({ status: "Error", message: "Dni no existente", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};


//ITERACION 4
//FOTO
administradorController.numero_denuncias_solicitante = (req, res) => {
    const { _idSolicitantes } = req.body;
    const sql = 'call SP_GET_AdministradorNumeroDeDenunciasDelSolicitantes(?)';
    const sqll = 'SELECT*FROM solicitantes AS s WHERE s.idSolicitantes = ?';

    mysql.query(sqll, [_idSolicitantes], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_idSolicitantes], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", data: data[0][0], code: 200 });
                    } else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                });
            }else{
                res.status(400).send({ status: "Error", message: "idSolicitantes no exitente", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

administradorController.numero_denuncias_trabajador = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql = 'call SP_GET_AdministradorNumeroDeDenunciasDelTrabajador(?)';
    const sqll = 'SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?';

    mysql.query(sqll, [_idTrabajadores], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_idTrabajadores], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", data: data[0][0], code: 200 });
                    } else {
                        res.status(400).send({ status: "Error", message: "No se pudo obtener el numero de denuncias", code: 400 });
                    }
                });
            }else {
                res.status(400).send({ status: "Error", message: "idTrabajadores no exitente", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

administradorController.listar_denuncias_a_solicitantes = (req, res) => {
    const { _idSolicitantes } = req.body;
    const sql = 'call SP_GET_ListarDenunciasASolicitantes(?)';
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
                res.status(400).send({ status: "Error", message: "idSolicitantes no exitente", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

administradorController.listar_denuncias_a_trabajadores = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql = 'call SP_GET_ListarDenunciasATrabajadores(?)';
    const sqll = 'SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?';
    
    mysql.query(sqll, [_idTrabajadores], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                mysql.query(sql, [_idTrabajadores], (error, data) => {
                    if (!error) {
                        res.status(200).send({ status: "Success", data: data[0], code: 200 });
                    } else {
                        res.status(400).send({ status: "Error", message: "No se pudo obtener", code: 400 });
                    }
                });
            }else {
                res.status(400).send({ status: "Error", message: "idTrabajadores no exitente", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};
module.exports = administradorController;