import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // Determinar si es para dashboard (sin parámetros de paginación)
    const isDashboard = !limitParam && !offsetParam;
    const limit = parseInt(limitParam ?? (isDashboard ? '100' : '20'), 10);
    const offset = parseInt(offsetParam ?? '0', 10);

    // Obtener el total de registros solo si no es dashboard
    let total = 0;
    if (!isDashboard) {
      const totalResult = await sql`SELECT COUNT(*)::int AS total FROM customers`;
      total = totalResult[0]?.total ?? 0;
    }

    const customers = await sql`
      SELECT * FROM customers 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Para el dashboard, devolver solo el array de clientes
    if (isDashboard) {
      return NextResponse.json(customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email
      })));
    }

    return NextResponse.json({ total, customers });
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
