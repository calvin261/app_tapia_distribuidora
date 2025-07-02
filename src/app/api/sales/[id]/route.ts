import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// GET single sale by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      );
    }

    // Get sale with customer information
    const sales = await sql`
      SELECT 
        s.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ${id}
    `;

    if (sales.length === 0) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Get sale items
    const items = await sql`
      SELECT 
        si.*,
        p.name as product_name,
        p.sku as product_sku
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ${id}
    `;

    const sale = sales[0];
    sale.items = items;

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale' },
      { status: 500 }
    );
  }
}

// PUT update sale by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { 
      customer_id, 
      payment_method, 
      payment_status, 
      status, 
      discount_amount, 
      tax_amount, 
      notes, 
      items 
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      );
    }

    // First check if sale exists
    const existingSale = await sql`
      SELECT id, status FROM sales WHERE id = ${id}
    `;

    if (existingSale.length === 0) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Don't allow editing confirmed sales (they affect inventory)
    if (existingSale[0].status === 'confirmed') {
      return NextResponse.json(
        { error: 'Cannot edit confirmed sales as they affect inventory' },
        { status: 409 }
      );
    }

    // Calculate amounts from items
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    }

    const finalDiscountAmount = discount_amount ?? 0;
    const finalTaxAmount = tax_amount ?? 0;
    const total_amount = subtotal - finalDiscountAmount + finalTaxAmount;

    // Update the sale
    const result = await sql`
      UPDATE sales 
      SET 
        customer_id = ${customer_id},
        payment_method = ${payment_method ?? 'cash'},
        payment_status = ${payment_status ?? 'pending'},
        status = ${status ?? 'draft'},
        subtotal = ${subtotal},
        discount_amount = ${finalDiscountAmount},
        tax_amount = ${finalTaxAmount},
        total_amount = ${total_amount},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Update sale items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await sql`DELETE FROM sale_items WHERE sale_id = ${id}`;
      
      // Insert new items
      for (const item of items) {
        if (item.product_id && item.quantity > 0) {
          const itemTotal = item.quantity * item.unit_price - (item.discount_amount ?? 0);
          await sql`
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, total_amount)
            VALUES (${id}, ${item.product_id}, ${item.quantity}, ${item.unit_price}, ${item.discount_amount ?? 0}, ${itemTotal})
          `;
        }
      }
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    );
  }
}

// DELETE sale by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      );
    }

    // First check if sale exists
    const existingSale = await sql`
      SELECT id, status FROM sales WHERE id = ${id}
    `;

    if (existingSale.length === 0) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting confirmed sales (they affect inventory)
    if (existingSale[0].status === 'confirmed') {
      return NextResponse.json(
        { error: 'Cannot delete confirmed sales as they affect inventory. Consider cancelling instead.' },
        { status: 409 }
      );
    }

    // Delete sale items first (foreign key constraint)
    await sql`DELETE FROM sale_items WHERE sale_id = ${id}`;
    
    // Delete the sale
    await sql`DELETE FROM sales WHERE id = ${id}`;

    return NextResponse.json(
      { message: 'Sale deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
