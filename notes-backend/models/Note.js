const mongoose = require('mongoose');


const noteSchema = new mongoose.Schema({
title: { type: String, required: true },
content: { type: String, default: '' },
tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});


noteSchema.pre('save', function (next) {
this.updatedAt = Date.now();
next();
});


module.exports = mongoose.model('Note', noteSchema);