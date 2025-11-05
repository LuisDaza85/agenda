const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Verificar si el email y la contraseña existen
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Por favor, proporciona un email y una contraseña' });
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta (incluyendo el nombre de la unidad)
    const { rows } = await pool.query(
      `SELECT u.*, un.name as unit_name 
       FROM users u 
       LEFT JOIN units un ON u.unit_id = un.id 
       WHERE u.email = $1`, 
      [email]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Email o contraseña incorrectos' });
    }

    // 3) Si todo está bien, enviar el token al cliente
    const token = jwt.sign({ id: user.id, role: user.role, unit_id: user.unit_id }, process.env.JWT_SECRET, {
      expiresIn: '90d',
    });

    // Opcional: remover la contraseña del output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // req.user es añadido por el middleware 'protect'
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.unit_id, un.name as unit_name 
       FROM users u 
       LEFT JOIN units un ON u.unit_id = un.id 
       WHERE u.id = $1`, 
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};