import { neon } from '@neondatabase/serverless';

// Database connection
export const sql = neon(process.env.DATABASE_URL!);

// Database schema types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  credit_limit?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  unit: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: string;
  customer_id?: string;
  user_id: string;
  invoice_number: string;
  sale_date: Date;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  payment_status: 'pending' | 'paid' | 'partial' | 'overdue';
  status: 'draft' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
  created_at: Date;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  user_id: string;
  purchase_order_number: string;
  purchase_date: Date;
  delivery_date?: Date;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
  created_at: Date;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  reference_id?: string;
  notes?: string;
  user_id: string;
  created_at: Date;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'high_stock' | 'overdue_payment' | 'system' | 'custom';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  user_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: Date;
  expires_at?: Date;
}

// Database initialization and migration functions
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function createTables() {
  // Users table
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
  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_id UUID REFERENCES suppliers(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      purchase_order_number VARCHAR(50) UNIQUE NOT NULL,
      purchase_date TIMESTAMP NOT NULL,
      delivery_date TIMESTAMP,
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'draft',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Purchase items table
  await sql`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id),
      quantity DECIMAL(10,2) NOT NULL,
      unit_cost DECIMAL(10,2) NOT NULL,
      total_cost DECIMAL(10,2) NOT NULL,
      received_quantity DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Stock movements table
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

  // Create indexes for better performance
  await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, is_read)`;
}

// Sample data insertion for testing
export async function insertSampleData() {
  try {
    // Insert sample user
    await sql`
      INSERT INTO users (email, name, role) 
      VALUES ('admin@tapia.com', 'Administrador', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;

    // Insert sample categories
    await sql`
      INSERT INTO categories (name, description) 
      VALUES 
        ('Electrónicos', 'Productos electrónicos y tecnología'),
        ('Oficina', 'Suministros y material de oficina'),
        ('Limpieza', 'Productos de limpieza y mantenimiento')
      ON CONFLICT DO NOTHING
    `;

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}
