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

const trabajadorController = {};

//ITERACION 1
trabajadorController.registro_trabajador = (req, res) => {

    const { _nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailTrabajadores, _password, _telefono} = req.body;

    const _foto = req.file.path;
    
    const sql = 'call SP_POST_RegistroTrabajador(?,?,?,?,?,?,?,?,?)';
    
    mysql.query('SELECT*FROM trabajadores WHERE emailTrabajadores = ?', [_emailTrabajadores], (er, dt) => {
        if (!er) {
            if (dt[0] == undefined) {
                mysql.query('SELECT*FROM persona AS p WHERE p.dni = ?', [_dni], (error, data) => {
                    if (!error) {
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
                                                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                            }
                                        });
                                    }).catch(error => {
                                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                    })
                                })
                            })

                        } else {
                            res.status(400).send({ status: "Error", message: "DNI en uso", code: 400 });
                        }
                    } else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                })
            } else {
                res.status(400).send({ status: "Error", message: "Email en uso", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};


trabajadorController.login_trabajador = (req, res) => {
    const { _emailTrabajadores, _password } = req.body;
     
    const sql = 'call SP_POST_LoginTrabajador(?, ?)';

    const sql2 = 'SELECT t.emailTrabajadores, t.password, t.estadoUsuario FROM trabajadores AS t WHERE t.emailTrabajadores = ?';

    mysql.query(sql2, [_emailTrabajadores], (error, dat) => {
        if (!error) {
            if (dat.length != 0) {
                if (dat[0].estadoUsuario == 1) {
                    const passwordEncriptado = dat[0].password;
                    bcrypt.compare(_password, passwordEncriptado).then(verf => {
                        if (verf) {
                            mysql.query(sql, [_emailTrabajadores, passwordEncriptado], (err, data) => {
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
                    })
                } else {
                    res.status(400).send({ status: "Error", message: "Trabajador deshabilitado", code: 400 });
                }
            } else {
                res.status(400).send({ status: "Error", message: "Email no existente", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    })
};

//ITERACION 2
//
trabajadorController.subir_publicacion_galeria = (req, res) => {
    
  if(req.payload.id == 1){
    const { _idTrabajadores, _descripcion } = req.body;
    const _urlimagen = req.file.path;
    const sql = 'call SP_POST_SubirPublicacionGaleria(?, ?, ?)';
    const sqll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?"; 

    mysql.query(sqll, [_idTrabajadores], (err, dat) => {
        if(!err){
            if(dat.length != 0){
                cloudinary.v2.uploader.upload(_urlimagen).then(result => {
                    mysql.query(sql, [_idTrabajadores, result.url, _descripcion], (error, data) => {
                        if (!error) {
                            fs.unlink(_urlimagen, () => {
                                res.status(200).send({ status: "Success", message: "Publicación subida", code: 200 });
                            });
                        }else {
                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                        }
                    });
                }).catch(err => {
                    res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                });
            }else {
                res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
  }else {
    res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
  }
};

//PARA AMBOS
trabajadorController.perfil_publico_trabajador = (req, res) => {
    const { _idTrabajadores } = req.body;
    const sql = 'call SP_POST_PerfilPrivadoTrabajador(?)'
    const sqll = "call SP_POST_ListarPublicaciones(?)"
    const sqlll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?";

    mysql.query(sqlll, [_idTrabajadores], (er, dt) => {
        if(!er){
            if(dt.length != 0){
                mysql.query(sql, [_idTrabajadores], (error, data) => {
                    if (!error) {
                        const perfil = data[0][0];
                        mysql.query(sqll, [_idTrabajadores], (err, dat) => {
                            if (!err) {
                                if (dat[0].length != 0) {
                                    perfil.publicaciones = dat[0];
                                    res.status(200).send({ status: "Success, con publicaciones", perfil: perfil, code: 200 });
                                } else {
                                    res.status(200).send({ status: "Success, sin publicaciones", perfil: perfil, code: 200 });
                                }
                            } else {
                                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                            }
                        });
                    } else {
                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                    }
                });
            }else {
                res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

//
trabajadorController.perfil_privado_trabajador = (req, res) => {
    if(req.payload.id == 1){
      const { _idTrabajadores } = req.body;
      const sql = 'call SP_POST_PerfilPrivadoTrabajador(?)'
      const sqll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?";

      mysql.query(sqll, [_idTrabajadores], (err, dat) => {
          if(!err){
              if(dat.length != 0){
                  mysql.query(sql, [_idTrabajadores], (error, data) => {
                      if (!error) {
                          res.status(200).send({ status: "Success", data: data[0], code: 200 });
                      } else {
                          res.status(400).send({ status: "Error", message: "Trabajador no encontrado", code: 400 });
                      }
                  });
              }else {
                  res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
              }
          }else {
              res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
          }
      });
    }else {
      res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

//
trabajadorController.editar_perfil_trabajador = (req, res) => {
    if(req.payload.id == 1){
      const { _idTrabajadores, _nombreRubro } = req.body;
      const sql = 'call SP_PUT_EditarPerfilTrabajador(?,?,?)';
      const sqll = 'SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?';
      const sqlll = "SELECT*FROM rubros AS r WHERE r.nombreRubro = ?";

      mysql.query(sqll, [_idTrabajadores], (err, dat) => {
          if(!err){
              if(dat.length != 0){
                  mysql.query(sqlll, [_nombreRubro], (e, d) => {
                      if(!e){
                          if(d.length != 0){
                              const _idRubro = d[0].idRubro;
                              if(req.file){
                                  const _foto = req.file.path;
                                  cloudinary.v2.uploader.upload(_foto).then(result => {
                                              mysql.query(sql, [_idTrabajadores, _idRubro, result.url], (error, data) => {
                                                  if (!error) {
                                                      fs.unlink(_foto, () => {
                                                          res.status(200).send({ status: "Success", message: "Perfil actualizado", code: 200 });
                                                      });
                                                  } else {
                                                      res.status(400).send({ status: "Error", message: "No se pudo actulizar su foto de perfil", code: 400 });
                                                  }
                                              })
                                  }).catch(err => {
                                      res.status(400).send({ status: "Error", message: "No se pudo actulizar su foto de perfil, error de red", code: 400 });
                                  });
                              }else {
                                  mysql.query('UPDATE trabajadores AS t JOIN rubros AS r ON r.idRubro = t.idRubro SET t.idRubro = ? WHERE t.idTrabajadores = ? ', [_idRubro, _idTrabajadores], (er, dt) => {
                                      if(!er){
                                          res.status(200).send({ status: "Success", message: "Rubro actualizado", code: 200 });
                                      }else {
                                          res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                      }
                                  })
                              }
                          }else {
                              res.status(400).send({ status: "Error", message: "Rubro no permitido", code: 400 });
                          }
                      }else{
                          res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                      }
                  });
              }else {
                  res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
              }
          }else {
              res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
          }
      });
    }else {
      res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

//ITERACION 4
/*trabajadorController.notificaciones = (req, res) => {
//SOCKET
};*/

//
trabajadorController.denunciar_solicitante = (req, res) => {
    if(req.payload.id == 1){
      const { _idSolicitudes, _descripcionDenuncia } = req.body;
      const _urlPruebas = req.file.path;
      const sql = "call SP_PUT_Denunciar(?,?,?)";
      const sqll = "SELECT*FROM solicitudes AS s WHERE s.idSolicitudes = ?";

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
                              res.status(400).send({ status: "Error", message: "Denuncia no enviada", code: 400 });
                          }
                      });
                  }).catch(err => {
                      res.status(400).send({ status: "Error", message: "Denuncia no enviada, error del servidor", code: 400 });
                  });
              }else {
                  res.status(400).send({ status: "Error", message: "Solicitud de contrato no existente", code: 400 });
              }
          }else {
              res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
          }
      });
    }else {
      res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

//
trabajadorController.listar_contratos_con_solicitantes = (req, res) => {
    if(req.payload.id == 1){
      const { _idTrabajadores } = req.body;
      const sql = 'call SP_POST_ListarContratosConSolicitantes(?)';
      const sqll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?";

      mysql.query(sqll, [_idTrabajadores], (err, dat) => {
          if(!err){
              if(dat.length != 0){
                  mysql.query(sql, [_idTrabajadores], (error, data) => {
                      if (!error) {
                          res.status(200).send({ status: "Success", message: data[0], code: 200 });
                      } else {
                          res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                      }
                  });
              }else {
                  res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
              }
          }else {
              res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
          }
      });
    }else {
      res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

//PARA AMBOS Y SIN TOKEN
trabajadorController.listar_rubros = (req, res) => {

    const sql = 'call SP_GET_ListarRubrosTrabajadores()';
    mysql.query(sql, (error, data) => {
        if(!error){
            if(data[0] != 0){
                res.status(200).send({ status: "Success", data: data[0], code: 200 });
            }else {
                res.status(400).send({ status: "Error", message: "Rubros no registrado", code: 400 });
            }
        }else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
}

//CAMBIAR CONTRASEÑA
trabajadorController.cambiar_contrasenia_trabajador = (req, res) => {
    if(req.payload.id == 1) {
        const { _dni, _emailTrabajadores, _password, _nuevaContrasenia } = req.body;
        const sql = "call SP_PUT_CambiarContraseniaTrabajador(?, ?)";
        const sqll = "SELECT*FROM persona AS p WHERE p.dni = ?";
        const sqlll = "SELECT*FROM trabajadores AS t WHERE t.idPersona = ? AND t.emailTrabajadores = ?";
        mysql.query(sqll, [_dni], (error, data) => {
            if (!error) {
                if (data.length != 0) {
                    const _idPersona = data[0].idPersona;
                    mysql.query(sqlll, [_idPersona, _emailTrabajadores], (err, dat) => {
                        if (!err) {
                            if (dat.length != 0) {
                                const _passwordEncriptado = dat[0].password;
                                bcrypt.compare(_password, _passwordEncriptado).then(verf => {
                                    if (verf) {
                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash(_nuevaContrasenia, salt, (err, passwordEncriptado) => {
                                                mysql.query(sql, [_emailTrabajadores, passwordEncriptado], (e, dt) => {
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
                            res.status(400).send({ status: "Error", message: "Error de conexionnnnnn", code: 400 });
                        }
                    });
                } else {
                    res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
                }
            } else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

trabajadorController.recuperar_contrasenia = (req, res) => {
    const { _dni, _nombre, _apellidoPaterno, _apellidoMaterno, _distrito, _telefono, _emailTrabajadores, _nuevaContrasenia } = req.body;
    const sql = 'call SP_POST_VerificarDatosRecuperarContraseniaTrabajador(?,?,?,?,?,?,?)';
    const sqll = 'call SP_PUT_ActualizarSimpleContraseniaTrabajadores(?,?)';

    mysql.query(sql, [_dni, _nombre, _apellidoPaterno, _apellidoMaterno, _distrito, _telefono, _emailTrabajadores], (error, data) => {
        if (!error) {
            if(data[0].length != 0){
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
            }else {
                res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
            }
        } else {
            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
        }
    });
};

//CHAT 

trabajadorController.listar_contactos_solicitantes = (req, res) => {
    if (req.payload.id == 1) {
        const { _idTrabajadores } = req.body;
        const sql = 'call SP_POST_ListarContactosSolicitantes(?)';
        const sqll = 'SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?';

        mysql(sqll, [_idTrabajadores], (erro, dat) => {
            if (!erro) {
                if (dat.length != 0) {
                    mysql.query(sql, [_idTrabajadores], (error, data) => {
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
                } else {
                    res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
                }
            } else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

trabajadorController.desactivar_estado_chat_trabajador = (req, res) => {
    if (req.payload.id == 1){
        const { _idTrabajadores } = req.body;
        const sql = 'call SP_PUT_DesactivarEstadoChatTrabajador(?)';
        const sqll = 'SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?';
        const sqlll = 'SELECT*FROM chat AS ch WHERE ch.idTrabajadores = ?';

        mysql.query(sqll, [_idTrabajadores], (erro, dat) => {
            if (!erro) {
                if (dat.length != 0) {
                    mysql.query(sqlll, [_idTrabajadores], (er, dt) => {
                        if (dt[0].estadoChat = 0) {
                            res.status(400).send({ status: "Error", message: "El estado estaba deshabilitado", code: 400 });
                        } else {
                            mysql.query(sql, [_idTrabajadores], (error, data) => {
                                if (!error) {
                                    res.status(200).send({ status: "Success", message: 'El estado fue deshabilitado', code: 200 });
                                } else {
                                    res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
                                }
                            });
                        }
                    });
                } else {
                    res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
                }
            } else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

trabajadorController.nuevo_contrato = (req, res) => {
    if (req.payload.id == 1) {
        const { _idSolicitantes, _idTrabajadores } = req.body;
        const sql = "call SP_POST_NuevoContrato(?,?)";
        const sqll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?";
        const sqlll = "SELECT*FROM trabajadores AS t WHERE t.idTrabajadores = ?";
        mysql.query(sqll, [_idTrabajadores], (error, data) => {
            if(!error){
                if(data.length != 0){
                    mysql.query(sqlll, [_idSolicitantes], (erro, dat) => {
                        if(!erro){
                            if(dat.length != 0){
                                mysql.query(sql, [_idSolicitantes, _idTrabajadores], (e, d) => {
                                    if(!e){
                                        res.status(200).send({ status: "Success", message: 'Contrato establecido', code: 200 });
                                    }else {
                                        res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 }); 
                                    }
                                })
                            }else {
                                res.status(400).send({ status: "Error", message: "Solicitante no registrado", code: 400 });
                            }
                        }else {
                            res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 }); 
                        }
                    });
                }else{
                    res.status(400).send({ status: "Error", message: "Trabajador no registrado", code: 400 });
                }
            }else {
                res.status(400).send({ status: "Error", message: "Error de conexion", code: 400 });     
            }
        });
    }else {
        res.status(400).send({ status: "Error", message: "El solicitante no puede hacer esta consulta, le corresponde al trabajador", code: 400 });
    }
};

module.exports = trabajadorController;