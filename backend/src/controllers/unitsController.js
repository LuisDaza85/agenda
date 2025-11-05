const pool = require('../config/database');

// Obtener todas las unidades
exports.getAllUnits = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, created_at FROM units ORDER BY name ASC");
    res.json({ status: 'success', data: { units: result.rows } });
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    res.status(500).json({ status: 'error', message: "Error interno del servidor" });
  }
};

// Obtener una unidad
exports.getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT id, name, created_at FROM units WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: "Unidad no encontrada" });
    }
    res.json({ status: 'success', data: { unit: result.rows[0] } });
  } catch (error) {
    console.error("Error al obtener unidad:", error);
    res.status(500).json({ status: 'error', message: "Error interno del servidor" });
  }
};

// Crear nueva unidad (solo SUPERADMIN)
exports.createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ status: 'error', message: "El nombre de la unidad es obligatorio" });
    }
    const result = await pool.query("INSERT INTO units (name) VALUES ($1) RETURNING id, name, created_at", [name]);
    res.status(201).json({
      status: 'success',
      message: "Unidad creada exitosamente",
      data: { unit: result.rows[0] }
    });
  } catch (error) {
    if (error.code === "23505") { // Violación de unicidad
      return res.status(409).json({ status: 'error', message: "El nombre de la unidad ya existe" });
    }
    console.error("Error al crear unidad:", error);
    res.status(500).json({ status: 'error', message: "Error interno del servidor" });
  }
};

// Actualizar unidad (solo SUPERADMIN)
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ status: 'error', message: "El nombre de la unidad es obligatorio" });
    }
    const result = await pool.query("UPDATE units SET name = $1 WHERE id = $2 RETURNING id, name, created_at", [
      name,
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: "Unidad no encontrada" });
    }
    res.json({
      status: 'success',
      message: "Unidad actualizada exitosamente",
      data: { unit: result.rows[0] }
    });
  } catch (error) {
    if (error.code === "23505") { // Violación de unicidad
      return res.status(409).json({ status: 'error', message: "El nombre de la unidad ya existe" });
    }
    console.error("Error al actualizar unidad:", error);
    res.status(500).json({ status: 'error', message: "Error interno del servidor" });
  }
};

// Eliminar unidad (solo SUPERADMIN)
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM units WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: "Unidad no encontrada" });
    }
    res.json({ status: 'success', message: "Unidad eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar unidad:", error);
    res.status(500).json({ status: 'error', message: "Error interno del servidor" });
  }
};