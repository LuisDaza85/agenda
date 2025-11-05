const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Leer y ejecutar schema
    const schema = fs.readFileSync(path.join(__dirname, '../../scripts/01-create-schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Schema creado exitosamente');

    // Leer y ejecutar seed data
    const seedData = fs.readFileSync(path.join(__dirname, '../../scripts/02-seed-data.sql'), 'utf8');
    await pool.query(seedData);
    console.log('✅ Datos iniciales insertados');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigrations();