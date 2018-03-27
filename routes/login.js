 // requires
var express = require('express'); 
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
// inicializar variables
var app = express();

var Usuario = require('../models/usuario');

const {OAuth2Client} = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ================================================
// Autentificacion Google
// ================================================
app.post('/google', (req, res) => {
	var token = req.body.token || 'xxx';

	const oAuth2Client = new OAuth2Client(
     GOOGLE_CLIENT_ID,
     GOOGLE_SECRET
    );

	const tiket = oAuth2Client.verifyIdToken({
	     idToken: token,
	     audience: GOOGLE_CLIENT_ID
	   });


	tiket.then(data =>{

	   	Usuario.findOne({ email: data.payload.email}, (err, usuario)=>{
	        if (err) {
	            return res.status(500).json({
	                ok: false,
	                mensaje: 'Error al buscar usuario',
	                errors: err
	            });
	        }

	        if(usuario){
	        	if( usuario.google === false){
		            return res.status(400).json({
		                ok: false,
		                mensaje: 'Debe usar autentificacion normal'
		            });
	        	}else{
					usuario.password = '*';
					// firmar (payload, SEED o semilla, fecha de expiracion
					var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 } ); // 14400 = 4 HORAS
					res.status(200).json({
						ok: true,
						usuario: usuario,
						token: token,
						id: usuario._id
					});	        		
	        	}
	        }else{
	        	var usuario = new Usuario();

	        	usuario.nombre = data.payload.name;
	        	usuario.email = data.payload.email;
	        	usuario.password = ':)';
	   			usuario.img = data.payload.picture;
	   			usuario.google = true;

	   			usuario.save( (err, usuarioDB)=>{
			        if (err) {
			            return res.status(500).json({
			                ok: false,
			                mensaje: 'Error al crear usuario-google',
			                errors: err
			            });
			        }

			        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 } ); // 14400 = 4 HORAS
					res.status(200).json({
						ok: true,
						usuario: usuarioDB,
						token: token,
						id: usuarioDB._id
					});	

	   			})
	        }
	   	})

	}).catch(err => {
	    if (err) {
	        return res.status(400).json({
	            ok: false,
	            mensaje: 'Token no válido',
	            errors: err
	        });
	    }
	});


});	

// ================================================
// Autentificacion normal
// ================================================
app.post('/', (req, res) => {
	var body = req.body;

	Usuario.findOne( { email: body.email }, (err, usuarioDB) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: "Error al buscar usuario",
				errors: err
			});
		}
		if(!usuarioDB){
			return res.status(400).json({
				ok: false,
				mensaje: "Error al buscar usuario - email",
				errors: { message: 'No existe usuario con ese email' }
			});			
		}
		if( !bcrypt.compareSync( body.password, usuarioDB.password) ){
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas password',
				errors: err
			});		
		}

		// crear token!
		usuarioDB.password = '*';
		// firmar (payload, SEED o semilla, fecha de expiracion
		var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 } ); // 14400 = 4 HORAS
		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB._id
		});
	});	
	
});


module.exports = app;