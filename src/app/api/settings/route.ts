import { NextResponse } from 'next/server';
import { getAllSettings, setMultipleSettings } from '@/lib/database';

// Todas las operaciones de settings se realizan directamente en la base de datos

export async function GET() {
  try {
    // Recupera todas las configuraciones desde la base de datos
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Guarda las configuraciones recibidas en la base de datos
    const body = await req.json();
    await setMultipleSettings(body);
    // Devuelve el estado actualizado desde la base de datos
    const settings = await getAllSettings();
    return NextResponse.json({ message: 'Settings updated successfully', settings });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
