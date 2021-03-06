 // requires
var express = require('express'); 
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); 

var mdAutenticacion = require('../middlewares/autenticacion');

// inicializar variables
var app = express();

var Usuario = require('../models/usuario');
// ================================================
// Todos los usuarios
// ================================================
app.get('/', (req, res, next) => {

	var desde = req.query.desde || 0;
	desde = Number(desde);

	Usuario.find({}, 'nombre email img role')
		.skip(desde)
		.limit(5)
		.exec( 
			(err, usuarios)=>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: "Error cargando usuarios",
					errors: err
				});
			}
			
			Usuario.count({}, (err, conteo)=>{
				
				res.status(200).json({
					ok: true,
					total: conteo,
					usuarios: usuarios,
					mensaje: 'peticion GET usuarios'
				});

			})
		});		
});

// ================================================
// Actualizar un Registro
// ================================================
app.put('/', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.query.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar usuario",
				errors: err
			});
		}
		if(!usuario){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar usuario "+id,
				errors: { message: 'No existe usuario con ese ID' }
			});			
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save( (err, UsuarioGuardado) =>{
			if(err){
				return res.status(400).json({
					ok: false,
					mensaje: "Error al actualizar usuario",
					errors: err
				});
			}
			UsuarioGuardado.password = '*';
			res.status(200).json({
				ok: true,
				body: UsuarioGuardado
			});			
		});
	});
});
// ================================================
// Eliminar un Registro
// ================================================
app.delete('/', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.query.id; 
	Usuario.findByIdAndRemove(id, (err, usuario) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar usuario",
				errors: err
			});
		}
		if(!usuario){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar usuario "+id,
				errors: { message: 'No existe usuario con ese ID' }
			});			
		}
		usuario.password = '*';
		res.status(200).json({
			ok: true,
			body: usuario
		});				
	});
});
// ================================================
// Crear un Registro
// ================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email : body.email,
		password : bcrypt.hashSync(body.password, 10),
		img : body.img,
		role : body.role
	});

	usuario.save( (err, UsuarioGuardado) =>{
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al crear usuario",
				errors: err
			});
		}
		res.status(201).json({
			ok: true,
			body: UsuarioGuardado,
			usuarioToken: req.usuario
		})
	});
	
});

module.exports = app;