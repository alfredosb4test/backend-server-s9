 // requires
var express = require('express'); 
var fileUpload = require('express-fileupload');
var fs = require('fs');
// inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options Mide
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {
	var tipo = req.params.tipo;
	var id = req.params.id;

	// tipos de coleccion
	var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

	if( tiposValidos.indexOf(tipo) < 0 ){
		return res.status(400).json({
			ok: false,
			mensaje: "Tipo de Coleccion no valida",
			errors: {message:'Tipo de Coleccion no valida'}
		});		
	}

	if(!req.files){
		return res.status(400).json({
			ok: false,
			mensaje: "No selecciono nada",
			errors: {message:'Debe seleccionar una imagen'}
		});
	}

	//Obtener nombre de archivo
	var archivo = req.files.imagen;
	var nombreCortado = archivo.name.split('.');
	var extensionArchivo = nombreCortado[nombreCortado.length -1];

	// validar extensiones

	var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if( extensionesValidas.indexOf(extensionArchivo) < 0 ){
		return res.status(400).json({
			ok: false,
			mensaje: "Extension no valida",
			errors: {message:'Debe ser imagen ' + extensionesValidas.join(', ')}
		});		
	}

	// nombre de archivo personalizado
	var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

	// Mover el archivo del temporal a un path
	var path = `./uploads/${ tipo }/${ nombreArchivo }`;

	archivo.mv( path, err =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al mover el archivo",
				errors: err
			});
		}

		subirPorTipo(tipo, id, nombreArchivo, res);
	
	});

});

 function subirPorTipo(tipo, id, nombreArchivo, res){
 	if(tipo === 'usuarios'){
 		Usuario.findById(id, (err, usuario)=>{

 			if(!usuario){
				var pathNuevo = './uploads/usuarios/'+nombreArchivo;
				fs.unlink(pathNuevo); 				
				return res.status(400).json({
					ok: false,
					mensaje: "El usuario no existe",
					errors: {message: 'No se encontraron resultados'}
				});
 			} 
 			 			
 			var pathViejo = './uploads/usuarios/'+usuario.img;

 			usuario.img = nombreArchivo;

 			usuario.save( (err, usuarioActualizado)=>{

 				if(err){
 					var pathNuevo = './uploads/usuarios/'+nombreArchivo;
					fs.unlink(pathNuevo);
					return res.status(500).json({
						ok: false,
						mensaje: "Error al actualizar el usuario",
						errors: err
					});
 				}

	 			if(fs.existsSync(pathViejo)){
	 				fs.unlink(pathViejo);
	 			}

 				usuarioActualizado.password = '*';
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen actualizada',
					usuario: usuarioActualizado
				});

 			});
 		});
 	}

 	if(tipo === 'hospitales'){
 		Hospital.findById(id, (err, hospital)=>{

 			if(!hospital){
				var pathNuevo = './uploads/hospitales/'+nombreArchivo;
				fs.unlink(pathNuevo); 				
				return res.status(400).json({
					ok: false,
					mensaje: "El hospital no existe",
					errors: {message: 'No se encontraron resultados'}
				});
 			} 	

 			var pathViejo = './uploads/hospitales/'+hospital.img;

 			hospital.img = nombreArchivo;

 			hospital.save( (err, hospitalActualizado)=>{

 				if(err){
 					var pathNuevo = './uploads/hospitales/'+nombreArchivo;
					fs.unlink(pathNuevo);
					return res.status(500).json({
						ok: false,
						mensaje: "Error al actualizar el hospital",
						errors: err
					});
 				}

	 			if(fs.existsSync(pathViejo)){
	 				fs.unlink(pathViejo);
	 			}
 			 				
 				hospitalActualizado.password = '*';
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen actualizada',
					hospital: hospitalActualizado
				});

 			});
 		});
 	}

 	if(tipo === 'medicos'){
 		Medico.findById(id, (err, medico)=>{ 			

 			if(!medico){
				var pathNuevo = './uploads/medicos/'+nombreArchivo;
				fs.unlink(pathNuevo); 				
				return res.status(400).json({
					ok: false,
					mensaje: "El medico no existe",
					errors: {message: 'No se encontraron resultados'}
				});
 			} 			

			var pathViejo = './uploads/medicos/'+medico.img;

 			medico.img = nombreArchivo;

 			medico.save( (err, medicoActualizado)=>{

 				if(err){
 					var pathNuevo = './uploads/medicos/'+nombreArchivo;
					fs.unlink(pathNuevo);
					return res.status(500).json({
						ok: false,
						mensaje: "Error al actualizar el medico",
						errors: err
					});
 				}

	 			if(fs.existsSync(pathViejo)){
	 				fs.unlink(pathViejo);
	 			}
 			 				
 				medicoActualizado.password = '*';
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen actualizada',
					medico: medicoActualizado
				});

 			});
 		});
 	}

 }

module.exports = app;

