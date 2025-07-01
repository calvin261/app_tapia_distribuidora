import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET() {
  try {
    const suppliers = await sql`
      SELECT * FROM suppliers 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact_person, email, phone, address, tax_id, payment_terms } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const supplier = await sql`
      INSERT INTO suppliers (name, contact_person, email, phone, address, tax_id, payment_terms)
      VALUES (${name}, ${contact_person}, ${email}, ${phone}, ${address}, ${tax_id}, ${payment_terms})
      RETURNING *
    `;

    return NextResponse.json(supplier[0], { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}
