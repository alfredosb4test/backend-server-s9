 // requires
var express = require('express'); 
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
// inicializar variables
var app = express();

// ================================================
// Busqueda por Coleccion
// ================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
	var tabla = req.params.tabla;
	var busqueda = req.params.busqueda;
	var regex = new RegExp(busqueda, 'i');
	var promesa;

	if(tabla == 'hospitales')
		 promesa = buscarHospitales(regex);
	else if(tabla == 'medicos')
		 promesa = buscarMedicos(regex);
	else if(tabla == 'usuarios')
		 promesa = buscarUsuarios(regex);
	else{
		res.status(400).json({
			ok:false,
			mensaje: 'Solo hay usuarios, medicos, hospitales'
		});
	}	
	promesa.then( respuestas =>{
			res.status(200).json({
				ok:true,
				[tabla]: respuestas
			})
	});

});	
// Rutas
app.get('/todo/:busqueda', (req, res, next) => {
	var busqueda = req.params.busqueda;
	var regex = new RegExp(busqueda, 'i');


	Promise.all([
			buscarHospitales(regex),
			buscarMedicos(regex),
			buscarUsuarios(regex)
		]).then( respuestas =>{
			res.status(200).json({
				ok:true,
				hospitales: respuestas[0],
				medicos: respuestas[1],
				usuarios: respuestas[2]
			})
		});
});

function buscarHospitales(regex){
	return new Promise( (resolve, reject)=>{
		Hospital.find({nombre: regex})
			.populate('usuario', 'nombre email')
			.exec((err, hopitales)=>{
				if(err){
					reject('Error al cargar los hospitales ', err)
				}else{
					resolve(hopitales)
				}
			});	
	});
}

function buscarMedicos(regex){
	return new Promise( (resolve, reject)=>{
		Medico.find({nombre: regex})
			.populate('usuario', 'nombre email')
			.populate('hospital', 'nombre email')
			.exec((err, medicos)=>{
			if(err){
				reject('Error al cargar los medicos ', err)
			}else{
				resolve(medicos)
			}
		});	
	});
}
function buscarUsuarios(regex){
	return new Promise( (resolve, reject)=>{
		Usuario.find({}, 'nombre email img role')
			.or([ {nombre: regex}, {email: regex} ])
			.exec( (err, usuarios)=>{
				if(err){
					reject('Error al cargar los usuarios ', err)
				}else{
					resolve(usuarios)
				}
			});
	});
}

module.exports = app;