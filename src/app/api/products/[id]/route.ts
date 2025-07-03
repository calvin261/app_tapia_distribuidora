import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const products = await sql`
      SELECT
        p.*,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ${id}
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!name || !sku || cost_price === undefined || sale_price === undefined) {
      return NextResponse.json(
        { error: 'Name, SKU, cost_price, and sale_price are required' },
        { status: 400 }
      );
    }

    // First check if product exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${id}
    `;

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU is already used by another product
    const duplicateSku = await sql`
      SELECT id FROM products WHERE sku = ${sku} AND id != ${id}
    `;

    if (duplicateSku.length > 0) {
      return NextResponse.json(
        { error: 'SKU already exists for another product' },
        { status: 409 }
      );
    }

    // Update the product
    const result = await sql`
      UPDATE products
      SET
        name = ${name},
        description = ${description},
        sku = ${sku},
        barcode = ${barcode},
        category_id = ${category_id},
        supplier_id = ${supplier_id},
        cost_price = ${cost_price},
        sale_price = ${sale_price},
        stock_quantity = ${stock_quantity ?? 0},
        min_stock_level = ${min_stock_level ?? 0},
        max_stock_level = ${max_stock_level},
        unit = ${unit ?? 'unit'},
        status = ${status ?? 'active'},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // First check if product exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${id}
    `;

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has any associated sales or purchase items
    const [salesCount, purchaseCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM sale_items WHERE product_id = ${id}`,
      sql`SELECT COUNT(*) as count FROM purchase_items WHERE product_id = ${id}`
    ]);

    if (salesCount[0].count > 0 || purchaseCount[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing sales or purchase records. Consider setting status to inactive instead.' },
        { status: 409 }
      );
    }

    // Delete the product
    await sql`
      DELETE FROM products WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
