import bcrypt from 'bcryptjs';
import { sql } from '../src/lib/database.js';

async function createAdminUser() {
  try {
    console.log('Creando usuario administrador...');

    // Hash the password
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert or update admin user
    await sql`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ('admin@tapia.com', ${passwordHash}, 'Administrador', 'admin', true)
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = ${passwordHash},
        updated_at = NOW()
    `;

    console.log('Usuario administrador creado exitosamente:');
    console.log('Email: admin@tapia.com');
    console.log('Contraseña: admin123');
    console.log('');
    console.log('IMPORTANTE: Cambia esta contraseña después del primer login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
