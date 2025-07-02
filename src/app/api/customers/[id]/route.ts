import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

// GET single customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const customers = await sql`
      SELECT * FROM customers
      WHERE id = ${id}
    `;

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customers[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT update customer by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { name, email, phone, address, tax_id, credit_limit } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // First check if customer exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE id = ${id}
    `;

    if (existingCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update the customer
    const result = await sql`
      UPDATE customers
      SET
        name = ${name},
        email = ${email},
        phone = ${phone},
        address = ${address},
        tax_id = ${tax_id},
        credit_limit = ${credit_limit || 0},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE customer by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // First check if customer exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE id = ${id}
    `;

    if (existingCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has any associated sales before deleting
    const salesCount = await sql`
      SELECT COUNT(*) as count FROM sales WHERE customer_id = ${id}
    `;

    if (salesCount[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing sales records. Consider deactivating instead.' },
        { status: 409 }
      );
    }

    // Delete the customer
    await sql`
      DELETE FROM customers WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
