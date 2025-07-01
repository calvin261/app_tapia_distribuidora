import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export async function GET() {
  try {
    const sales = await sql`
      SELECT 
        s.*,
        c.name as customer_name,
        u.name as user_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;
    
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      customer_id,
      user_id,
      items,
      payment_method,
      discount_amount = 0,
      notes
    } = data;

    if (!user_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'User ID and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: SaleItem) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax_amount = subtotal * 0.16; // 16% tax
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate invoice number
    const invoice_number = `INV-${Date.now()}`;

    // Create sale
    const saleResult = await sql`
      INSERT INTO sales (
        customer_id, user_id, invoice_number, sale_date,
        subtotal, tax_amount, discount_amount, total_amount,
        payment_method, payment_status, status, notes
      )
      VALUES (
        ${customer_id}, ${user_id}, ${invoice_number}, NOW(),
        ${subtotal}, ${tax_amount}, ${discount_amount}, ${total_amount},
        ${payment_method}, 'paid', 'confirmed', ${notes}
      )
      RETURNING *
    `;

    const sale = saleResult[0];

    // Create sale items
    for (const item of items) {
      await sql`
        INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price, 
          discount_amount, total_amount
        )
        VALUES (
          ${sale.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price},
          ${item.discount_amount || 0}, ${item.quantity * item.unit_price}
        )
      `;

      // Update product stock
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity - ${item.quantity},
            updated_at = NOW()
        WHERE id = ${item.product_id}
      `;

      // Create stock movement
      await sql`
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, reference_type, 
          reference_id, user_id
        )
        VALUES (
          ${item.product_id}, 'out', ${item.quantity}, 'sale',
          ${sale.id}, ${user_id}
        )
      `;
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}
