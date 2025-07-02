import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    // Get user data from database
    const userResult = await sql`
      SELECT id, email, name, role, is_active 
      FROM users 
      WHERE id = ${decoded.userId} AND is_active = true
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}
