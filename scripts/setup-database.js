#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * Este script inicializa la base de datos con todas las tablas necesarias
 * y datos de ejemplo para el sistema Tapia Distribuidora
 */

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  console.log('🗄️  Creando tablas de la base de datos...\n');

  try {
    // Users table
    console.log('✅ Creando tabla: users');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Categories table
    console.log('✅ Creando tabla: categories');
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Customers table
    console.log('✅ Creando tabla: customers');
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_id VARCHAR(50),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Suppliers table
    console.log('✅ Creando tabla: suppliers');
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_id VARCHAR(50),
        payment_terms VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Products table
    console.log('✅ Creando tabla: products');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE NOT NULL,
        barcode VARCHAR(100),
        category_id UUID REFERENCES categories(id),
        supplier_id UUID REFERENCES suppliers(id),
        cost_price DECIMAL(10,2) NOT NULL,
        sale_price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER,
        unit VARCHAR(20) NOT NULL DEFAULT 'unit',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Sales table
    console.log('✅ Creando tabla: sales');
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        user_id UUID REFERENCES users(id) NOT NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        sale_date TIMESTAMP NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        status VARCHAR(20) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Sale items table
    console.log('✅ Creando tabla: sale_items');
    await sql`
      CREATE TABLE IF NOT EXISTS sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Purchases table
    console.log('✅ Creando tabla: purchases');
    await sql`
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id UUID REFERENCES suppliers(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        order_date TIMESTAMP NOT NULL,
        expected_delivery TIMESTAMP,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_terms VARCHAR(50) DEFAULT 'net_30',
        payment_status VARCHAR(20) DEFAULT 'pending',
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Purchase items table
    console.log('✅ Creando tabla: purchase_items');
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity DECIMAL(10,2) NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Stock movements table
    console.log('✅ Creando tabla: stock_movements');
    await sql`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) NOT NULL,
        movement_type VARCHAR(20) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        reference_type VARCHAR(20),
        reference_id UUID,
        notes TEXT,
        user_id UUID REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Alerts table
    console.log('✅ Creando tabla: alerts');
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        user_id UUID REFERENCES users(id),
        related_entity_type VARCHAR(50),
        related_entity_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;

    console.log('\n📊 Creando índices para mejor rendimiento...');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity, min_stock_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status, payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(order_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, is_read)`;

    console.log('✅ Índices creados correctamente');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  }
}

async function insertSampleData() {
  console.log('\n🌱 Insertando datos de ejemplo...\n');

  try {
    // Insert sample user
    console.log('👤 Creando usuario administrador...');
    await sql`
      INSERT INTO users (email, name, role)
      VALUES ('admin@tapia.com', 'Administrador Tapia', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;

    // Insert sample categories
    console.log('📁 Creando categorías de productos...');
    await sql`
      INSERT INTO categories (name, description)
      VALUES
        ('Electrónicos', 'Productos electrónicos y tecnología'),
        ('Oficina', 'Suministros y material de oficina'),
        ('Limpieza', 'Productos de limpieza y mantenimiento'),
        ('Alimentación', 'Productos alimenticios y bebidas'),
        ('Textil', 'Productos textiles y vestimenta')
      ON CONFLICT DO NOTHING
    `;

    // Insert sample suppliers
    console.log('🚚 Creando proveedores de ejemplo...');
    await sql`
      INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms)
      VALUES
        ('TechnoSupply S.A.', 'Juan Pérez', 'ventas@technosupply.com', '+1-555-0123', 'Av. Tecnología 123, Ciudad', 'net_30'),
        ('OfficeMax Distribuidora', 'María García', 'pedidos@officemax.com', '+1-555-0456', 'Calle Oficina 456, Ciudad', 'net_15'),
        ('CleanPro Solutions', 'Carlos López', 'contacto@cleanpro.com', '+1-555-0789', 'Industrial Park 789, Ciudad', 'net_45'),
        ('FoodCorp Internacional', 'Ana Martínez', 'compras@foodcorp.com', '+1-555-0321', 'Zona Industrial 321, Ciudad', 'net_30'),
        ('TextilMax S.R.L.', 'Roberto Silva', 'ventas@textilmax.com', '+1-555-0654', 'Distrito Textil 654, Ciudad', 'net_60')
      ON CONFLICT DO NOTHING
    `;

    // Insert sample customers
    console.log('👥 Creando clientes de ejemplo...');
    await sql`
      INSERT INTO customers (name, email, phone, address, credit_limit)
      VALUES
        ('Empresa ABC S.A.', 'compras@empresaabc.com', '+1-555-1111', 'Av. Principal 111, Ciudad', 5000.00),
        ('Comercial XYZ', 'pedidos@comercialxyz.com', '+1-555-2222', 'Calle Comercio 222, Ciudad', 3000.00),
        ('Distribuidora Beta', 'ventas@distribuidorabeta.com', '+1-555-3333', 'Plaza Central 333, Ciudad', 7500.00),
        ('Cliente Premium Ltda', 'info@clientepremium.com', '+1-555-4444', 'Torre Empresarial 444, Ciudad', 10000.00),
        ('MiniMarket Local', 'administracion@minimarket.com', '+1-555-5555', 'Barrio Norte 555, Ciudad', 2000.00)
      ON CONFLICT DO NOTHING
    `;

    // Insert sample products (need to get category and supplier IDs first)
    const categoryResults = await sql`SELECT id, name FROM categories LIMIT 5`;
    const supplierResults = await sql`SELECT id, name FROM suppliers LIMIT 5`;

    if (categoryResults.length > 0 && supplierResults.length > 0) {
      console.log('🛍️  Creando productos de ejemplo...');
      await sql`
        INSERT INTO products (name, description, sku, category_id, supplier_id, cost_price, sale_price, stock_quantity, min_stock_level, unit)
        VALUES
          ('Laptop Dell Inspiron 15', 'Laptop para oficina con procesador Intel i5', 'LAP-DELL-001', ${categoryResults[0].id}, ${supplierResults[0].id}, 800.00, 1200.00, 15, 5, 'unit'),
          ('Mouse Inalámbrico Logitech', 'Mouse óptico inalámbrico con receptor USB', 'MOU-LOG-001', ${categoryResults[0].id}, ${supplierResults[0].id}, 25.00, 45.00, 50, 10, 'unit'),
          ('Papel Bond A4 500 hojas', 'Resma de papel bond blanco tamaño A4', 'PAP-A4-500', ${categoryResults[1].id}, ${supplierResults[1].id}, 8.00, 15.00, 100, 20, 'pack'),
          ('Detergente Líquido 1L', 'Detergente líquido multiusos concentrado', 'DET-LIQ-1L', ${categoryResults[2].id}, ${supplierResults[2].id}, 3.50, 6.00, 75, 15, 'unit'),
          ('Café Premium 250g', 'Café tostado y molido de origen colombiano', 'CAF-PREM-250', ${categoryResults[3].id}, ${supplierResults[3].id}, 12.00, 20.00, 30, 8, 'unit')
        ON CONFLICT (sku) DO NOTHING
      `;
    }

    // Create sample alerts
    console.log('🔔 Creando alertas de ejemplo...');
    const userResults = await sql`SELECT id FROM users WHERE email = 'admin@tapia.com' LIMIT 1`;
    if (userResults.length > 0) {
      await sql`
        INSERT INTO alerts (type, title, message, severity, user_id)
        VALUES
          ('low_stock', 'Stock Bajo Detectado', 'Varios productos están por debajo del nivel mínimo de stock', 'warning', ${userResults[0].id}),
          ('system', 'Bienvenido al Sistema', 'Sistema de gestión Tapia Distribuidora inicializado correctamente', 'info', ${userResults[0].id}),
          ('custom', 'Recordatorio Mensual', 'Recuerda revisar el inventario y generar reportes mensuales', 'info', ${userResults[0].id})
        ON CONFLICT DO NOTHING
      `;
    }

    console.log('\n✅ Datos de ejemplo insertados correctamente');

  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
    throw error;
  }
}

async function verifyDatabase() {
  console.log('\n🔍 Verificando integridad de la base de datos...\n');

  try {
    // Check table counts
    const tableStats = await sql`
      SELECT
        'users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'categories', COUNT(*) FROM categories
      UNION ALL
      SELECT 'customers', COUNT(*) FROM customers
      UNION ALL
      SELECT 'suppliers', COUNT(*) FROM suppliers
      UNION ALL
      SELECT 'products', COUNT(*) FROM products
      UNION ALL
      SELECT 'sales', COUNT(*) FROM sales
      UNION ALL
      SELECT 'purchases', COUNT(*) FROM purchases
      UNION ALL
      SELECT 'alerts', COUNT(*) FROM alerts
    `;

    console.log('📊 Estadísticas de tablas:');
    tableStats.forEach(stat => {
      console.log(`   ${stat.table_name}: ${stat.count} registros`);
    });

    // Check for low stock products
    const lowStockProducts = await sql`
      SELECT name, stock_quantity, min_stock_level
      FROM products
      WHERE stock_quantity <= min_stock_level
    `;

    if (lowStockProducts.length > 0) {
      console.log('\n⚠️  Productos con stock bajo:');
      lowStockProducts.forEach(product => {
        console.log(`   ${product.name}: ${product.stock_quantity}/${product.min_stock_level}`);
      });
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Inicializando Base de Datos - Tapia Distribuidora\n');
  console.log('================================================\n');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('❌ DATABASE_URL no está configurada en las variables de entorno');
    }

    console.log('🔗 Conectando a la base de datos...');
    console.log(`📍 URL: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//*****@')}\n`);

    await createTables();
    await insertSampleData();
    await verifyDatabase();

    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('\n💡 Puedes ahora:');
    console.log('   • Ejecutar npm run dev para iniciar el servidor');
    console.log('   • Acceder al sistema con admin@tapia.com');
    console.log('   • Explorar las funcionalidades del dashboard\n');

  } catch (error) {
    console.error('\n💥 Error durante la inicialización:', error.message);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = {
  createTables,
  insertSampleData,
  verifyDatabase
};
