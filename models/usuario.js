var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
	values: ['ADMIN_ROLE', 'USER_ROLE'],
	message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
	nombre: { type: String, required: [true, 'El nombre es requerido']},
	email: { type: String, unique: true, required: [true, 'El correo es requerido']},
	password: { type: String, required: [true, 'El pwd es requerido']},
	img: { type: String, required: false},
	role: { type: String, required: false, default: 'USER_ROLE', enum: rolesValidos},
	google: { type: Boolean, required: true, default: false}

});
usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser unico' } )
module.exports = mongoose.model('usuario', usuarioSchema);