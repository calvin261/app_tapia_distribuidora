import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

interface PurchaseItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  discount_amount?: number;
}

export async function GET() {
  try {
    const purchases = await sql`
      SELECT 
        p.*,
        s.name as supplier_name,
        u.name as user_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      supplier_id,
      user_id,
      items,
      expected_delivery,
      payment_terms,
      notes
    } = data;

    if (!supplier_id || !user_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Supplier ID, User ID and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: PurchaseItem) => 
      sum + (item.quantity * item.unit_cost), 0
    );
    const tax_amount = subtotal * 0.16; // 16% tax
    const total_amount = subtotal + tax_amount;

    // Generate order number
    const order_number = `PO-${Date.now()}`;

    // Create purchase order
    const purchaseResult = await sql`
      INSERT INTO purchases (
        supplier_id, user_id, order_number, order_date,
        expected_delivery, subtotal, tax_amount, total_amount,
        payment_terms, payment_status, status, notes
      )
      VALUES (
        ${supplier_id}, ${user_id}, ${order_number}, NOW(),
        ${expected_delivery ?? null}, ${subtotal}, ${tax_amount}, ${total_amount},
        ${payment_terms ?? 'net_30'}, 'pending', 'pending', ${notes}
      )
      RETURNING *
    `;

    const purchase = purchaseResult[0];

    // Create purchase items
    for (const item of items) {
      await sql`
        INSERT INTO purchase_items (
          purchase_id, product_id, quantity, unit_cost, 
          discount_amount, total_amount
        )
        VALUES (
          ${purchase.id}, ${item.product_id}, ${item.quantity}, ${item.unit_cost},
          ${item.discount_amount ?? 0}, ${item.quantity * item.unit_cost}
        )
      `;
    }

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, status, payment_status } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE purchases 
      SET 
        status = COALESCE(${status}, status),
        payment_status = COALESCE(${payment_status}, payment_status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // If purchase is received, update product stock
    if (status === 'received') {
      const purchaseItems = await sql`
        SELECT * FROM purchase_items WHERE purchase_id = ${id}
      `;

      for (const item of purchaseItems) {
        await sql`
          UPDATE products 
          SET stock_quantity = stock_quantity + ${item.quantity},
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
            ${item.product_id}, 'in', ${item.quantity}, 'purchase',
            ${id}, ${result[0].user_id}
          )
        `;
      }
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}
