import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET() {
  try {
    const customers = await sql`
      SELECT * FROM customers 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, address, tax_id, credit_limit } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO customers (name, email, phone, address, tax_id, credit_limit)
      VALUES (${name}, ${email}, ${phone}, ${address}, ${tax_id}, ${credit_limit || 0})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
