var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var medicoSchema = new Schema({
	nombre: { type: String, required: [true, 'El nombre es necesario'] },
	img: { type: String, required: false },
	usuario: { type: Schema.Types.ObjectId, ref: 'usuario', required: true },
	hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id hospital es un campo obligatorio'] }
});
module.exports = mongoose.model('Medico', medicoSchema);