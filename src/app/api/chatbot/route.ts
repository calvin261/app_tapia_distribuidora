import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple query processing - in a real app, you'd use OpenAI or similar
    const response = await processQuery(message.toLowerCase());

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

async function processQuery(query: string): Promise<string> {
  try {
    // Sales related queries
    if (query.includes('ventas') || query.includes('sales')) {
      if (query.includes('hoy') || query.includes('today')) {
        const result = await sql`
          SELECT COUNT(*) as count, SUM(total_amount) as total
          FROM sales
          WHERE DATE(sale_date) = CURRENT_DATE
        `;
        const { count, total } = result[0];
        return `Hoy se han realizado ${count} ventas por un total de $${total || 0}.`;
      }

      if (query.includes('mes') || query.includes('month')) {
        const result = await sql`
          SELECT COUNT(*) as count, SUM(total_amount) as total
          FROM sales
          WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const { count, total } = result[0];
        return `Este mes se han realizado ${count} ventas por un total de $${total || 0}.`;
      }

      const result = await sql`
        SELECT COUNT(*) as count, SUM(total_amount) as total
        FROM sales
      `;
      const { count, total } = result[0];
      return `En total se han realizado ${count} ventas por un monto de $${total || 0}.`;
    }

    // Product/inventory queries
    if (query.includes('productos') || query.includes('inventario') || query.includes('stock')) {
      if (query.includes('bajo') || query.includes('low')) {
        const result = await sql`
          SELECT name, stock_quantity, min_stock_level
          FROM products
          WHERE stock_quantity <= min_stock_level
          AND status = 'active'
          ORDER BY stock_quantity ASC
          LIMIT 5
        `;

        if (result.length === 0) {
          return 'No hay productos con stock bajo en este momento.';
        }

        let response = 'Productos con stock bajo:\n';
        result.forEach((product) => {
          response += `- ${product.name}: ${product.stock_quantity} unidades (mínimo: ${product.min_stock_level})\n`;
        });
        return response;
      }

      const result = await sql`
        SELECT COUNT(*) as count, SUM(stock_quantity) as total_stock
        FROM products
        WHERE status = 'active'
      `;
      const { count, total_stock } = result[0];
      return `Tienes ${count} productos activos con un total de ${total_stock || 0} unidades en stock.`;
    }

    // Customer queries
    if (query.includes('clientes') || query.includes('customers')) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM customers
      `;
      const { count } = result[0];
      return `Tienes ${count} clientes registrados en la base de datos.`;
    }

    // Suppliers queries
    if (query.includes('proveedores') || query.includes('suppliers')) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM suppliers
      `;
      const { count } = result[0];
      return `Tienes ${count} proveedores registrados en la base de datos.`;
    }

    // General help
    if (query.includes('ayuda') || query.includes('help')) {
      return `Puedo ayudarte con información sobre:
- Ventas (hoy, este mes, totales)
- Productos e inventario (stock bajo, totales)
- Clientes (cantidad total)
- Proveedores (cantidad total)

¿Sobre qué te gustaría saber más?`;
    }

    return 'No entendí tu consulta. Puedes preguntarme sobre ventas, productos, clientes o proveedores. Escribe "ayuda" para más información.';
  } catch (error) {
    console.error('Error in processQuery:', error);
    return 'Lo siento, ocurrió un error al procesar tu consulta.';
  }
}
