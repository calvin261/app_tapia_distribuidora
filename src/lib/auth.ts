import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-this-in-production';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = verifyToken(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Acceso no autorizado' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, user);
  };
}

export function requireRole(roles: string[]) {
  return function(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
    return async (request: NextRequest): Promise<Response> => {
      const user = verifyToken(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Acceso no autorizado' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (!roles.includes(user.role)) {
        return new Response(
          JSON.stringify({ error: 'Permisos insuficientes' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return handler(request, user);
    };
  };
}
