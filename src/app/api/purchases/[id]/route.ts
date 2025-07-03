import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// GET single purchase by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // Get purchase with supplier information
    const purchases = await sql`
      SELECT
        p.*,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ${id}
    `;

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Get purchase items
    const items = await sql`
      SELECT
        pi.*,
        prod.name as product_name,
        prod.sku as product_sku
      FROM purchase_items pi
      LEFT JOIN products prod ON pi.product_id = prod.id
      WHERE pi.purchase_id = ${id}
    `;

    const purchase = purchases[0];
    purchase.items = items;

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    );
  }
}

// PUT update purchase by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const {
      supplier_id,
      expected_delivery,
      payment_terms,
      status,
      payment_status,
      notes,
      items
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    if (!supplier_id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // First check if purchase exists
    const existingPurchase = await sql`
      SELECT id, status FROM purchases WHERE id = ${id}
    `;

    if (existingPurchase.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Don't allow editing received or cancelled purchases
    if (existingPurchase[0].status === 'received' || existingPurchase[0].status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot edit received or cancelled purchases' },
        { status: 409 }
      );
    }

    // Calculate total amount from items
    let total_amount = 0;
    if (items && Array.isArray(items)) {
      total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    }

    // Update the purchase
    const result = await sql`
      UPDATE purchases
      SET
        supplier_id = ${supplier_id},
        expected_delivery = ${expected_delivery},
        payment_terms = ${payment_terms ?? 'net_30'},
        status = ${status ?? 'pending'},
        payment_status = ${payment_status ?? 'pending'},
        notes = ${notes},
        total_amount = ${total_amount},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Update purchase items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await sql`DELETE FROM purchase_items WHERE purchase_id = ${id}`;

      // Insert new items
      for (const item of items) {
        if (item.product_id && item.quantity > 0) {
          await sql`
            INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost)
            VALUES (${id}, ${item.product_id}, ${item.quantity}, ${item.unit_cost}, ${item.quantity * item.unit_cost})
          `;
        }
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

// DELETE purchase by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // First check if purchase exists
    const existingPurchase = await sql`
      SELECT id, status FROM purchases WHERE id = ${id}
    `;

    if (existingPurchase.length === 0) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting received purchases (they affect inventory)
    if (existingPurchase[0].status === 'received') {
      return NextResponse.json(
        { error: 'Cannot delete received purchases as they affect inventory. Consider cancelling instead.' },
        { status: 409 }
      );
    }

    // Delete purchase items first (foreign key constraint)
    await sql`DELETE FROM purchase_items WHERE purchase_id = ${id}`;

    // Delete the purchase
    await sql`DELETE FROM purchases WHERE id = ${id}`;

    return NextResponse.json(
      { message: 'Purchase deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}
