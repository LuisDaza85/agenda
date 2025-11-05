const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { promisify } = require('util');

// Middleware para proteger rutas verificando el token
exports.protect = async (req, res, next) => {
  try {
    // 1) Obtener el token y verificar si existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'No estás autenticado. Por favor, inicia sesión para obtener acceso.' });
    }

    // 2) Verificar el token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario todavía existe
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const currentUser = rows[0];
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'El usuario de este token ya no existe.' });
    }

    // Si todo está bien, guardar el usuario en la petición para futuras rutas
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'fail', message: 'Token inválido o expirado. Por favor, inicia sesión de nuevo.' });
  }
};

// Middleware para restringir el acceso a ciertos roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles es un array ['SUPERADMIN', 'UNITADMIN']. req.user viene del middleware 'protect'
    if (!req.user || !req.user.role) {
      return res.status(401).json({ status: 'fail', message: 'Usuario no tiene un rol asignado o no está autenticado.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'fail', message: 'No tienes los permisos necesarios para realizar esta acción.' });
    }
    next();
  };
};