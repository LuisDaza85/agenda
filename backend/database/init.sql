-- Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Crear tipo ENUM para roles
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'UNITADMIN', 'VIEWER');

-- Crear tabla units
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(255) NOT NULL,
  email CHARACTER VARYING(255) NOT NULL UNIQUE,
  password CHARACTER VARYING(255) NOT NULL,
  role user_role NOT NULL,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  carnet CHARACTER VARYING(20)
);

-- Crear tabla events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title CHARACTER VARYING(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  category CHARACTER VARYING(100),
  location CHARACTER VARYING(255),
  organizer CHARACTER VARYING(255),
  attendees TEXT,
  color CHARACTER VARYING(20) DEFAULT '#00b1e1',
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar unidad por defecto
INSERT INTO units (name) VALUES ('Alcaldía de Cochabamba');

-- Insertar usuario SUPERADMIN por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (name, email, password, role, unit_id, carnet) 
VALUES (
  'Administrador', 
  'admin@municipio.gov', 
  '$2a$10$rQ3Ks5vYJ3KnF1xGZ2XvZeZGKGdX1kJ.xJ6Z8xKf2vN3xH8L9mPXS', 
  'SUPERADMIN', 
  1, 
  '12345678'
);

-- Mensaje de éxito
SELECT 'Base de datos inicializada correctamente!' as status;