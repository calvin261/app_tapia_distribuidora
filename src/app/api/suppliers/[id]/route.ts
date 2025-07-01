import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supplier = await sql`
      SELECT * FROM suppliers WHERE id = ${id}
    `;

    if (supplier.length === 0) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(supplier[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Error al obtener proveedor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, contact_person, email, phone, address, tax_id, payment_terms } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const supplier = await sql`
      UPDATE suppliers
      SET name = ${name},
          contact_person = ${contact_person},
          email = ${email},
          phone = ${phone},
          address = ${address},
          tax_id = ${tax_id},
          payment_terms = ${payment_terms},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (supplier.length === 0) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(supplier[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supplier = await sql`
      DELETE FROM suppliers WHERE id = ${id}
      RETURNING *
    `;

    if (supplier.length === 0) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}
