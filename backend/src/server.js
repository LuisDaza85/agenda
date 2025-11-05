require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

// Importar Rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const unitsRoutes = require('./routes/units');
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/events', eventsRoutes);

// Endpoint de prueba para la raíz
app.get('/', (req, res) => {
  res.send('API de la Agenda Municipal está funcionando');
});

// Iniciar el servidor
const startServer = async () => {
  try {
    // Probar la conexión a la base de datos antes de iniciar el servidor
    await pool.query('SELECT NOW()');
    console.log('Conexión a la base de datos exitosa.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    // No iniciar el servidor si la conexión a la base de datos falla
  }
};

startServer();