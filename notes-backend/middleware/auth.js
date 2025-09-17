const jwt = require('jsonwebtoken');


module.exports = function (req, res, next) {
const auth = req.headers.authorization;
if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
const token = auth.split(' ')[1];
try {
const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
// payload should contain sub (userId), tid (tenantId), role
req.user = { id: payload.sub, tenantId: payload.tid, role: payload.role };
return next();
} catch (err) {
return res.status(401).json({ error: 'Invalid or expired token' });
}
};