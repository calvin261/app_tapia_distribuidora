import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Find user by email
    const userResult = await sql`
      SELECT id, email, password_hash, name, role, is_active 
      FROM users 
      WHERE email = ${email.toLowerCase()} AND is_active = true
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW() 
      WHERE id = ${user.id}
    `;

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return NextResponse.json({
      user: userData,
      token,
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
