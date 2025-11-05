-- Seed initial data for development and testing

-- Insert sample units
INSERT INTO units (name) VALUES
    ('Zoonosis'),
    ('Emabra'),
    ('Recursos Humanos'),
    ('Obras Públicas'),
    ('Cultura y Turismo');

-- Insert a SUPERADMIN user
-- Password: admin123
INSERT INTO users (name, email, password, role, unit_id) VALUES
    ('Super Admin', 'admin@municipio.gov', '$2a$12$hkfr8fZY1beLT52oxX.dJuwbCMFm1oMql1gF2u9FRBptOEiKaduVy', 'SUPERADMIN', NULL);

-- Insert UNITADMIN users for each unit
-- Password: unit123
INSERT INTO users (name, email, password, role, unit_id) VALUES
    ('Admin Zoonosis', 'zoonosis@municipio.gov', '$2a$12$joJvOudVic9f0sXbO4GHWO3M4j9.ibOJVbW3LC0fI6yAVNFtjSECy', 'UNITADMIN', 1),
    ('Admin Emabra', 'emabra@municipio.gov', '$2a$12$joJvOudVic9f0sXbO4GHWO3M4j9.ibOJVbW3LC0fI6yAVNFtjSECy', 'UNITADMIN', 2),
    ('Admin RRHH', 'rrhh@municipio.gov', '$2a$12$joJvOudVic9f0sXbO4GHWO3M4j9.ibOJVbW3LC0fI6yAVNFtjSECy', 'UNITADMIN', 3);

-- Insert VIEWER users
-- Password: viewer123
INSERT INTO users (name, email, password, role, unit_id) VALUES
    ('Viewer Zoonosis', 'viewer.zoonosis@municipio.gov', '$2a$12$XbITgIpQD60LbVcdTFlo5ebLwUf0OIxahSv1cgIAF/eY9sHa6fWfe', 'VIEWER', 1),
    ('Viewer Emabra', 'viewer.emabra@municipio.gov', '$2a$12$XbITgIpQD60LbVcdTFlo5ebLwUf0OIxahSv1cgIAF/eY9sHa6fWfe', 'VIEWER', 2);

-- Insert sample events
INSERT INTO events (title, description, date, start_time, end_time, category, location, organizer, attendees, color, unit_id) VALUES
    ('Campaña de Vacunación Antirrábica', 'Vacunación gratuita para perros y gatos', '2025-03-15', '09:00', '17:00', 'Salud', 'Plaza Central', 'Dr. García', 'Público en general', '#3b82f6', 1),
    ('Mantenimiento Red de Agua', 'Corte programado de agua potable', '2025-03-20', '08:00', '14:00', 'Mantenimiento', 'Barrio Norte', 'Ing. Martínez', 'Residentes Barrio Norte', '#ef4444', 2),
    ('Capacitación Laboral', 'Taller de desarrollo profesional', '2025-03-25', '10:00', '12:00', 'Capacitación', 'Sala de Conferencias', 'Lic. Rodríguez', 'Personal municipal', '#10b981', 3),
    ('Festival Cultural', 'Evento cultural con artistas locales', '2025-04-01', '18:00', '23:00', 'Cultura', 'Teatro Municipal', 'Dirección de Cultura', 'Público en general', '#f59e0b', 5);