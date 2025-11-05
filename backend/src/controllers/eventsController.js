const pool = require('../config/database');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, start_date, end_date, start_time, end_time, unit_id, category, location, organizer, attendees, color } = req.body;
    const user = req.user;

    // ✅ CORREGIDO: Mensajes en español
    if (!title || !start_date || !end_date || !start_time || !end_time) {
      return res.status(400).json({
        error: "El título, fechas de inicio y fin, y horarios son campos obligatorios",
      });
    }

    // ✅ NUEVA VALIDACIÓN: Verificar que si es el mismo día, la hora de fin sea mayor que la de inicio
    if (start_date === end_date) {
      const [startHour, startMinute] = start_time.split(':').map(Number);
      const [endHour, endMinute] = end_time.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      if (endTimeInMinutes <= startTimeInMinutes) {
        return res.status(400).json({
          error: "La hora de finalización debe ser posterior a la hora de inicio",
        });
      }
    }

    let finalUnitId;
    if (user.role === 'SUPERADMIN') {
        if (!unit_id) {
            return res.status(400).json({ error: "La unidad es obligatoria para SUPERADMIN" });
        }
        finalUnitId = unit_id;
    } else if (user.role === 'UNITADMIN') {
        finalUnitId = user.unit_id;
    } else {
        return res.status(403).json({ error: "No tienes permiso para crear eventos" });
    }

    // ✅ NUEVO: Convertir end_date a formato EXCLUSIVO
    // Si el usuario selecciona "Del 9 al 10", el formulario envía end_date = "2025-10-10"
    // Pero necesitamos guardar "2025-10-11" (exclusivo) para que cubra ambos días
    const adjustedEndDate = new Date(end_date);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const exclusiveEndDate = adjustedEndDate.toISOString().split('T')[0] + 'T00:00:00.000Z';

    console.log('📅 [createEvent] Ajuste de fecha:', {
      original: end_date,
      ajustado: exclusiveEndDate,
      motivo: 'Conversión a formato exclusivo'
    });

    const { rows } = await pool.query(
      'INSERT INTO events (title, description, start_date, end_date, start_time, end_time, unit_id, category, location, organizer, attendees, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [title, description, start_date, exclusiveEndDate, start_time, end_time, finalUnitId, category, location, organizer, attendees, color]
      //                                ^^^^^^^^^^^^^^^^ Usar end_date ajustado
    );
    res.status(201).json({ status: 'success', data: { event: rows[0] } });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ status: 'error', message: 'Error al crear el evento' });
  }
};

//  FUNCIÓN MODIFICADA CON FILTROS DE FECHA
exports.getAllEvents = async (req, res) => {
    try {
        const user = req.user;
        
        // 🔥 NUEVO: Obtener filtros de fecha desde query params
        const { start_date, end_date } = req.query;
        
        let query = 'SELECT e.*, u.name as unit_name FROM events e JOIN units u ON e.unit_id = u.id';
        const params = [];
        let paramCount = 1;

        // Filtro por unidad según rol
        if (user.role === 'UNITADMIN' || user.role === 'VIEWER') {
            query += ` WHERE e.unit_id = $${paramCount}`;
            params.push(user.unit_id);
            paramCount++;
        } else {
            query += ' WHERE 1=1';
        }
        
        // 🔥 NUEVO: Filtrar por rango de fechas
        // Un evento se muestra si su rango de fechas se solapa con el rango solicitado
        if (start_date) {
            query += ` AND e.end_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }
        
        if (end_date) {
            query += ` AND e.start_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }
        
        query += ' ORDER BY e.start_date ASC, e.start_time ASC';

        const { rows } = await pool.query(query, params);
        
        //  NUEVO: Log para debugging
        console.log(`Query: ${rows.length} eventos encontrados`);
        if (start_date && end_date) {
            console.log(`   Rango: ${start_date} → ${end_date}`);
        }
        
        res.status(200).json({ status: 'success', data: { events: rows } });
    } catch (error) {
        console.error("Get all events error:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los eventos' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        let query = `
          SELECT e.*, u.name as unit_name 
          FROM events e 
          JOIN units u ON e.unit_id = u.id 
          WHERE e.id = $1
        `;
        const params = [id];

        if (user.role !== 'SUPERADMIN') {
            query += " AND e.unit_id = $2";
            params.push(user.unit_id);
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Evento no encontrado o acceso denegado" });
        }

        res.json({ event: result.rows[0] });
    } catch (error) {
        console.error("Get event by id error:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, description, start_date, end_date, start_time, end_time, category, location, organizer, attendees, color } = req.body;

        if (user.role === 'VIEWER') {
            return res.status(403).json({ error: "No tienes permiso para actualizar eventos" });
        }

        let checkQuery = "SELECT unit_id FROM events WHERE id = $1";
        const eventResult = await pool.query(checkQuery, [id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        if (user.role === 'UNITADMIN' && eventResult.rows[0].unit_id !== user.unit_id) {
            return res.status(403).json({ error: "No tienes permiso para actualizar este evento" });
        }

        // ✅ NUEVA VALIDACIÓN: Verificar que si es el mismo día, la hora de fin sea mayor que la de inicio
        if (start_date === end_date) {
          const [startHour, startMinute] = start_time.split(':').map(Number);
          const [endHour, endMinute] = end_time.split(':').map(Number);
          
          const startTimeInMinutes = startHour * 60 + startMinute;
          const endTimeInMinutes = endHour * 60 + endMinute;
          
          if (endTimeInMinutes <= startTimeInMinutes) {
            return res.status(400).json({
              error: "La hora de finalización debe ser posterior a la hora de inicio",
            });
          }
        }

        // ✅ NUEVO: Convertir end_date a formato EXCLUSIVO
        const adjustedEndDate = new Date(end_date);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        const exclusiveEndDate = adjustedEndDate.toISOString().split('T')[0] + 'T00:00:00.000Z';

        console.log('[updateEvent] Ajuste de fecha:', {
          original: end_date,
          ajustado: exclusiveEndDate,
          motivo: 'Conversión a formato exclusivo'
        });
        
        const { rows } = await pool.query(
            `UPDATE events SET title = $1, description = $2, start_date = $3, end_date = $4, start_time = $5, end_time = $6, category = $7, location = $8, organizer = $9, attendees = $10, color = $11 
             WHERE id = $12 RETURNING *`,
            [title, description, start_date, exclusiveEndDate, start_time, end_time, category, location, organizer, attendees, color, id]
            //                                ^^^^^^^^^^^^^^^^ Usar end_date ajustado
        );

        res.status(200).json({ status: 'success', data: { event: rows[0] } });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el evento' });
    }
};

exports.deleteEvent = async (req, res) => {
     try {
        const { id } = req.params;
        const user = req.user;

        if (user.role === 'VIEWER') {
            return res.status(403).json({ error: "No tienes permiso para eliminar eventos" });
        }

        let checkQuery = "SELECT unit_id FROM events WHERE id = $1";
        const eventResult = await pool.query(checkQuery, [id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        if (user.role === 'UNITADMIN' && eventResult.rows[0].unit_id !== user.unit_id) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este evento" });
        }

        await pool.query('DELETE FROM events WHERE id = $1', [id]);

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el evento' });
    }
};