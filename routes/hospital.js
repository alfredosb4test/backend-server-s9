 // requires
var express = require('express'); 
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); 

var mdAutenticacion = require('../middlewares/autenticacion');

// inicializar variables
var app = express();

var Hospital = require('../models/hospital');
// var Usuario = require('../models/usuario');
// ================================================
// Todos los usuarios
// ================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({})
		.skip(desde)
		.limit(5)	
		.populate('usuario', 'nombre email')
		.exec( 
			(err, hospitales)=>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: "Error cargando hospitales",
					errors: err
				});
			}

			Hospital.count({}, (err, conteo)=>{
				res.status(200).json({
					ok: true,
					total: conteo,
					hospitales: hospitales,
					mensaje: 'peticion GET hospitales'
				});
			});	
		});		
});

// ================================================
// Actualizar un Registro
// ================================================
app.put('/', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.query.id;
	var body = req.body;
console.log("ID:", id)
	Hospital.findById(id, (err, hospital) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar hospital",
				errors: err
			});
		}
		if(!hospital){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar hospital "+id,
				errors: { message: 'No existe hospital con ese ID' }
			});			
		}

		hospital.nombre = body.nombre;
		hospital.usuario = req.usuario._id;

		hospital.save( (err, hospitalGuardado) =>{
			if(err){
				return res.status(400).json({
					ok: false,
					mensaje: "Error al actualizar hospital",
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				body: hospitalGuardado
			});			
		});
	});
});
// ================================================
// Eliminar un Registro
// ================================================
app.delete('/', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.query.id; 
	Hospital.findByIdAndRemove(id, (err, hospital) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar hospital",
				errors: err
			});
		}
		if(!hospital){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar hospital "+id,
				errors: { message: 'No existe hospital con ese ID' }
			});			
		}

		res.status(200).json({
			ok: true,
			body: hospital
		});				
	});
});
// ================================================
// Crear un Registro
// ================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;

	var hospital = new Hospital({
		nombre: body.nombre,
		img : body.img,
		usuario : req.usuario._id
	});

	hospital.save( (err, hospitalGuardado) =>{
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al crear hospital",
				errors: err
			});
		}
		res.status(201).json({
			ok: true,
			body: hospitalGuardado,
			usuarioToken: req.usuario
		})
	});
	
});

module.exports = app;