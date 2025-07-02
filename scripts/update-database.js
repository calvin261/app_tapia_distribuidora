const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('Verificando estructura de la tabla users...');
    
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    
    console.log('Columnas actuales:', columns);
    
    // Add password_hash column if it doesn't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)`;
      console.log('Columna password_hash agregada');
    } catch (error) {
      if (error.code === '42701') {
        console.log('Columna password_hash ya existe');
      } else {
        throw error;
      }
    }
    
    // Add is_active column if it doesn't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE`;
      console.log('Columna is_active agregada');
    } catch (error) {
      if (error.code === '42701') {
        console.log('Columna is_active ya existe');
      } else {
        throw error;
      }
    }
    
    // Add last_login column if it doesn't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN last_login TIMESTAMP`;
      console.log('Columna last_login agregada');
    } catch (error) {
      if (error.code === '42701') {
        console.log('Columna last_login ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('Estructura de base de datos actualizada');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
