import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const period = searchParams.get('period');

    // Si es para reportería, manejar datos específicos
    if (period) {
      return await handleProductReports();
    }

    // Determinar si es para dashboard (sin parámetros de paginación)
    const isDashboard = !limitParam && !offsetParam;
    const limit = parseInt(limitParam ?? (isDashboard ? '100' : '20'), 10);
    const offset = parseInt(offsetParam ?? '0', 10);

    // Obtener el total de registros solo si no es dashboard
    let total = 0;
    if (!isDashboard) {
      const totalResult = await sql`SELECT COUNT(*)::int AS total FROM products`;
      total = totalResult[0]?.total ?? 0;
    }

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

    // Para el dashboard, devolver solo el array de productos
    if (isDashboard) {
      return NextResponse.json(products.map(product => ({
        id: product.id,
        name: product.name,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        category_id: product.category_id,
        stock: product.stock_quantity // alias para compatibilidad
      })));
    }

    return NextResponse.json({ total, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Función para manejar reportes de productos
async function handleProductReports() {
  // Obtener categorías de productos y sus ventas
  const categories = await sql`
    SELECT
      c.name,
      COUNT(DISTINCT p.id) as value,
      '#' || LPAD(FLOOR(RANDOM() * 16777215)::int::text, 6, '0') as color
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id, c.name
    ORDER BY value DESC
  `;

  // Obtener estado del inventario
  const inventoryStatus = await sql`
    SELECT
      CASE
        WHEN stock_quantity = 0 THEN 'Sin Stock'
        WHEN stock_quantity <= min_stock_level THEN 'Stock Bajo'
        WHEN stock_quantity > min_stock_level * 2 THEN 'Sobrestock'
        ELSE 'Stock Normal'
      END as category,
      COUNT(*) as count
    FROM products
    WHERE status = 'active'
    GROUP BY
      CASE
        WHEN stock_quantity = 0 THEN 'Sin Stock'
        WHEN stock_quantity <= min_stock_level THEN 'Stock Bajo'
        WHEN stock_quantity > min_stock_level * 2 THEN 'Sobrestock'
        ELSE 'Stock Normal'
      END
  `;

  return NextResponse.json({
    categories,
    inventoryStatus
  });
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
