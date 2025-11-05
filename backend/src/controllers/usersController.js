const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { carnet, name, email, password, role, unit_id } = req.body;
    const creatingUser = req.user;

    // Validar campos requeridos
    if (!carnet || !name || !email || !password || !role) {
      return res.status(400).json({ error: "El carnet, nombre, correo electrónico, contraseña y rol son obligatorios" });
    }

    // ✅ VALIDACIÓN PREVIA: Verificar si el carnet ya existe
    const carnetCheck = await pool.query('SELECT id, carnet FROM users WHERE carnet = $1', [carnet]);
    if (carnetCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: "El carnet ya está registrado", 
        detail: `El carnet ${carnet} ya pertenece a otro usuario` 
      });
    }

    // ✅ VALIDACIÓN PREVIA: Verificar si el email ya existe
    const emailCheck = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: "El correo electrónico ya está registrado",
        detail: `El correo ${email} ya está en uso` 
      });
    }

    // --- Verificaciones de Permisos ---
    if (creatingUser.role === 'SUPERADMIN') {
      if (!['SUPERADMIN', 'UNITADMIN', 'VIEWER'].includes(role)) {
        return res.status(403).json({ error: "Rol inválido" });
      }
    } 
    else if (creatingUser.role === 'UNITADMIN') {
      if (role !== 'VIEWER') {
        return res.status(403).json({ error: "UNITADMIN solo puede crear usuarios VIEWER" });
      }
      if (unit_id && parseInt(unit_id) !== creatingUser.unit_id) {
        return res.status(403).json({ error: "Solo puedes crear usuarios para tu propia unidad" });
      }
    } else {
        return res.status(403).json({ error: "Permisos insuficientes para crear un usuario" });
    }

    // Determinar el unit_id final
    const finalUnitId = creatingUser.role === 'UNITADMIN' ? creatingUser.unit_id : unit_id;

    // Validar que unit_id sea requerido solo para roles que lo necesitan
    if (role !== 'SUPERADMIN' && !finalUnitId) {
        return res.status(400).json({ error: "El unit_id es obligatorio para los roles UNITADMIN y VIEWER" });
    }

    // Si el rol es SUPERADMIN, el unit_id debe ser null
    const userUnitId = role === 'SUPERADMIN' ? null : finalUnitId;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario en la base de datos
    const { rows } = await pool.query(
      'INSERT INTO users (carnet, name, email, password, role, unit_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, carnet, name, email, role, unit_id',
      [carnet, name, email, hashedPassword, role, userUnitId]
    );
    
    const newUser = rows[0];
    res.status(201).json({ 
      status: 'success', 
      message: 'Usuario creado exitosamente',
      data: { user: newUser } 
    });
  } catch (error) {
    // Manejo de errores de base de datos como respaldo
    if (error.code === "23505") {
      // Determinar qué campo está duplicado
      if (error.constraint && error.constraint.includes('email')) {
        return res.status(409).json({ error: "El correo electrónico ya existe" });
      }
      if (error.constraint && error.constraint.includes('carnet')) {
        return res.status(409).json({ error: "El carnet ya existe" });
      }
      return res.status(409).json({ error: "El correo electrónico o carnet ya existe" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ error: "ID de unidad inválido" });
    }
    console.error("Error al crear usuario:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { carnet, name, email, password, role, unit_id } = req.body;
    const updatingUser = req.user;

    // Validar campos requeridos
    if (!name || !email || !role) {
      return res.status(400).json({ error: "El nombre, correo electrónico y rol son obligatorios" });
    }

    // Verificar si el usuario a actualizar existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userToUpdate = userCheck.rows[0];

    // ✅ VALIDACIÓN PREVIA: Verificar si el carnet ya existe (en otro usuario)
    if (carnet && carnet !== userToUpdate.carnet) {
      const carnetCheck = await pool.query('SELECT id FROM users WHERE carnet = $1 AND id != $2', [carnet, id]);
      if (carnetCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "El carnet ya está registrado",
          detail: `El carnet ${carnet} ya pertenece a otro usuario`
        });
      }
    }

    // ✅ VALIDACIÓN PREVIA: Verificar si el email ya existe (en otro usuario)
    if (email && email !== userToUpdate.email) {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "El correo electrónico ya está registrado",
          detail: `El correo ${email} ya está en uso`
        });
      }
    }

    // --- Verificaciones de Permisos ---
    // UNITADMIN solo puede actualizar usuarios de su propia unidad
    if (updatingUser.role === 'UNITADMIN') {
      if (userToUpdate.unit_id !== updatingUser.unit_id) {
        return res.status(403).json({ error: "Solo puedes actualizar usuarios de tu propia unidad" });
      }
      if (role !== 'VIEWER') {
        return res.status(403).json({ error: "UNITADMIN solo puede gestionar usuarios VIEWER" });
      }
    }

    // Verificaciones de SUPERADMIN
    if (updatingUser.role === 'SUPERADMIN' && !['SUPERADMIN', 'UNITADMIN', 'VIEWER'].includes(role)) {
      return res.status(403).json({ error: "Rol inválido" });
    }

    // Construir consulta de actualización dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (carnet !== undefined) {
      updates.push(`carnet = $${paramCount}`);
      values.push(carnet);
      paramCount++;
    }

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (role) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
      
      // Si se cambia a SUPERADMIN, establecer unit_id a null
      if (role === 'SUPERADMIN') {
        updates.push(`unit_id = $${paramCount}`);
        values.push(null);
        paramCount++;
      }
    }

    if (unit_id !== undefined && updatingUser.role === 'SUPERADMIN' && role !== 'SUPERADMIN') {
      updates.push(`unit_id = $${paramCount}`);
      values.push(unit_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, carnet, name, email, role, unit_id`;

    const { rows } = await pool.query(query, values);

    res.status(200).json({ 
      status: 'success', 
      message: 'Usuario actualizado exitosamente',
      data: { user: rows[0] } 
    });
  } catch (error) {
    // Manejo de errores de base de datos como respaldo
    if (error.code === "23505") {
      if (error.constraint && error.constraint.includes('email')) {
        return res.status(409).json({ error: "El correo electrónico ya existe" });
      }
      if (error.constraint && error.constraint.includes('carnet')) {
        return res.status(409).json({ error: "El carnet ya existe" });
      }
      return res.status(409).json({ error: "El correo electrónico o carnet ya existe" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ error: "ID de unidad inválido" });
    }
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ✅ NUEVO ENDPOINT: Verificar disponibilidad de carnet
exports.checkCarnetAvailability = async (req, res) => {
  try {
    const { carnet } = req.params;
    const { excludeUserId } = req.query; // Para excluir un usuario específico (al editar)

    if (!carnet) {
      return res.status(400).json({ error: "El carnet es requerido" });
    }

    let query = 'SELECT id FROM users WHERE carnet = $1';
    const params = [carnet];

    // Si se está editando un usuario, excluirlo de la búsqueda
    if (excludeUserId) {
      query += ' AND id != $2';
      params.push(excludeUserId);
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: {
        available: result.rows.length === 0,
        carnet: carnet
      }
    });
  } catch (error) {
    console.error("Error al verificar disponibilidad de carnet:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Resto de funciones sin cambios...
exports.getAllUsers = async (req, res) => {
  try {
    const user = req.user;
    let query = 'SELECT id, carnet, name, email, role, unit_id FROM users';
    const params = [];

    // Si el usuario es UNITADMIN, solo mostrar usuarios de su unidad
    if (user.role === 'UNITADMIN') {
      query += ' WHERE unit_id = $1';
      params.push(user.unit_id);
    }

    query += ' ORDER BY name ASC';

    const { rows } = await pool.query(query, params);
    res.status(200).json({ status: 'success', results: rows.length, data: { users: rows } });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let query = "SELECT id, carnet, name, email, role, unit_id, created_at FROM users WHERE id = $1";
    const params = [id];

    // Un UNITADMIN solo puede obtener usuarios de su propia unidad
    if (user.role === "UNITADMIN") {
      query += " AND unit_id = $2";
      params.push(user.unit_id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado o acceso denegado" });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error al obtener usuario por id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getUsersByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const user = req.user;

    if (user.role === 'UNITADMIN' && parseInt(unitId) !== user.unit_id) {
      return res.status(403).json({ 
        error: "No tienes permiso para ver usuarios de esta unidad" 
      });
    }

    const { rows } = await pool.query(
      'SELECT id, carnet, name, email, role, unit_id FROM users WHERE unit_id = $1 ORDER BY name ASC',
      [unitId]
    );

    res.status(200).json({
      status: 'success',
      results: rows.length,
      data: {
        users: rows
      }
    });
  } catch (error) {
    console.error("Error al obtener usuarios por unidad:", error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletingUser = req.user;

    // Verificar si el usuario a eliminar existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userToDelete = userCheck.rows[0];

    // Prevenir eliminarse a sí mismo
    if (parseInt(id) === deletingUser.id) {
      return res.status(403).json({ error: "No puedes eliminarte a ti mismo" });
    }

    // --- Verificaciones de Permisos ---
    // UNITADMIN solo puede eliminar usuarios de su propia unidad
    if (deletingUser.role === 'UNITADMIN') {
      if (userToDelete.unit_id !== deletingUser.unit_id) {
        return res.status(403).json({ error: "Solo puedes eliminar usuarios de tu propia unidad" });
      }
      if (userToDelete.role !== 'VIEWER') {
        return res.status(403).json({ error: "UNITADMIN solo puede eliminar usuarios VIEWER" });
      }
    }

    // SUPERADMIN no puede eliminar otros usuarios SUPERADMIN
    if (userToDelete.role === 'SUPERADMIN') {
      return res.status(403).json({ error: "No se puede eliminar usuarios SUPERADMIN" });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({ 
      status: 'success', 
      message: 'Usuario eliminado exitosamente' 
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};