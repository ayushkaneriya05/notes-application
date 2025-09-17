const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
email: { type: String, required: true, unique: true },
passwordHash: { type: String, required: true },
name: { type: String },
role: { type: String, enum: ['admin', 'member'], default: 'member' },
tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);