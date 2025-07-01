import { NextResponse } from 'next/server';
import { initializeDatabase, insertSampleData } from '@/lib/database';

export async function POST() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Insert sample data
    await insertSampleData();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database initialization endpoint. Use POST to initialize.' 
  });
}
