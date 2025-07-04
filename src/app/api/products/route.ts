import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const totalResult = await sql`SELECT COUNT(*)::int AS total FROM products`;
    const total = totalResult[0]?.total || 0;
    const products = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return NextResponse.json({ total, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      name, 
      description, 
      sku, 
      barcode, 
      category_id, 
      supplier_id, 
      cost_price, 
      sale_price, 
      stock_quantity, 
      min_stock_level, 
      max_stock_level, 
      unit, 
      status 
    } = data;

    if (!name || !sku || !cost_price || !sale_price) {
      return NextResponse.json(
        { error: 'Name, SKU, cost_price, and sale_price are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (
        name, description, sku, barcode, category_id, supplier_id,
        cost_price, sale_price, stock_quantity, min_stock_level, 
        max_stock_level, unit, status
      )
      VALUES (
        ${name}, ${description}, ${sku}, ${barcode}, ${category_id}, ${supplier_id},
        ${cost_price}, ${sale_price}, ${stock_quantity || 0}, ${min_stock_level || 0},
        ${max_stock_level}, ${unit || 'unit'}, ${status || 'active'}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
