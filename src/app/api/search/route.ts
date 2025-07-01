import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Search in customers
    const customers = await sql`
      SELECT 'customer' as type, id, name, email, phone, '' as description
      FROM customers 
      WHERE LOWER(name) LIKE ${searchTerm} 
         OR LOWER(email) LIKE ${searchTerm}
         OR phone LIKE ${searchTerm}
      LIMIT 5
    `;

    // Search in products
    const products = await sql`
      SELECT 'product' as type, id, name, sku as email, '' as phone, description
      FROM products 
      WHERE LOWER(name) LIKE ${searchTerm} 
         OR LOWER(sku) LIKE ${searchTerm}
         OR LOWER(description) LIKE ${searchTerm}
      LIMIT 5
    `;

    // Search in suppliers
    const suppliers = await sql`
      SELECT 'supplier' as type, id, name, email, phone, '' as description
      FROM suppliers 
      WHERE LOWER(name) LIKE ${searchTerm} 
         OR LOWER(email) LIKE ${searchTerm}
         OR phone LIKE ${searchTerm}
      LIMIT 5
    `;

    // Search in sales
    const sales = await sql`
      SELECT 'sale' as type, s.id, 
             CONCAT('Venta #', s.invoice_number) as name,
             c.name as email,
             CAST(s.total_amount as VARCHAR) as phone,
             CONCAT('Total: $', s.total_amount) as description
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE LOWER(s.invoice_number) LIKE ${searchTerm}
         OR CAST(s.total_amount as VARCHAR) LIKE ${searchTerm}
      LIMIT 5
    `;

    const results = [
      ...customers.map(item => ({
        ...item,
        category: 'Clientes',
        href: `/customers`
      })),
      ...products.map(item => ({
        ...item,
        category: 'Productos',
        href: `/inventory`
      })),
      ...suppliers.map(item => ({
        ...item,
        category: 'Proveedores',
        href: `/suppliers`
      })),
      ...sales.map(item => ({
        ...item,
        category: 'Ventas',
        href: `/sales`
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 });
  }
}
