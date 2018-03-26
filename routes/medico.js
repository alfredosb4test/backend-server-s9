 // requires
var express = require('express'); 
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); 

var mdAutenticacion = require('../middlewares/autenticacion');

// inicializar variables
var app = express();

var Medico = require('../models/medico');
// ================================================
// Todos los usuarios
// ================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Medico.find({}, 'nombre img usuario hospital')
		.skip(desde)
		.limit(5)	
		.populate('usuario', 'nombre email')
		.populate('hospital')
		.exec( 
			(err, medicos)=>{
			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: "Error cargando medicos",
					errors: err
				});
			}

			Medico.count({}, (err, conteo)=>{
				res.status(200).json({
					ok: true,
					total: conteo,
					medicos: medicos,
					mensaje: 'peticion GET medicos'
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
	Medico.findById(id, (err, medico) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar medico",
				errors: err
			});
		}
		if(!medico){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar medico "+id,
				errors: { message: 'No existe medico con ese ID' }
			});			
		}

		medico.nombre = body.nombre;
		medico.usuario = req.usuario._id;

		medico.save( (err, medicoGuardado) =>{
			if(err){
				return res.status(400).json({
					ok: false,
					mensaje: "Error al actualizar medico",
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				body: medicoGuardado
			});			
		});
	});
});
// ================================================
// Eliminar un Registro
// ================================================
app.delete('/', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.query.id; 
	Medico.findByIdAndRemove(id, (err, medico) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar medico",
				errors: err
			});
		}
		if(!medico){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar medico "+id,
				errors: { message: 'No existe medico con ese ID' }
			});			
		}

		res.status(200).json({
			ok: true,
			body: medico
		});				
	});
});
// ================================================
// Crear un Registro
// ================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;
	var _idHospital = req.body.idHospital; 

	var medico = new Medico({
		nombre: body.nombre,
		img : body.img,
		usuario : req.usuario._id,
		hospital: _idHospital
	});

	medico.save( (err, medicoGuardado) =>{
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al crear medico",
				errors: err
			});
		}
		res.status(201).json({
			ok: true,
			body: medicoGuardado,
			usuarioToken: req.usuario
		})
	});
	
});

module.exports = app;