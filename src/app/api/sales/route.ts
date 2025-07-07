import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";


interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

// Función para obtener el filtro de fecha según el periodo
function getDateFilter(period: string | null) {
  if (!period) return sql`1 = 1`; // Sin filtro

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'semester': {
      // Determina el semestre actual (1: enero-junio, 2: julio-diciembre)
      const month = now.getMonth(); // 0-based
      const semesterStartMonth = month < 6 ? 6 : 0;
      startDate = new Date(now.getFullYear(), semesterStartMonth, 1);
      break;
    }
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  console.log(startDate);

  console.log(`s.sale_date >= ${startDate.toISOString().split('T')[0]}`);

  return sql`s.sale_date >= ${startDate.toISOString().split('T')[0]}`;
}

// Función para manejar reportes mensuales
async function handleMonthlyReports(period: string | null) {
  const dateFilter = getDateFilter(period);

  // Obtener ventas agrupadas por mes
  const salesByMonth = await sql`
    SELECT
      TO_CHAR(s.sale_date, 'Mon') as month,
      SUM(s.total_amount) as ventas,
      COUNT(*) as productos,
      SUM(s.total_amount * 0.7) as costos,
      SUM(s.total_amount * 0.3) as ganancias
    FROM sales s
    WHERE ${dateFilter}
    GROUP BY DATE_TRUNC('month', s.sale_date), TO_CHAR(s.sale_date, 'Mon')
    ORDER BY DATE_TRUNC('month', s.sale_date)
  `;

  // Obtener top productos
  const topProducts = await sql`
    SELECT
      p.name,
      SUM(si.quantity) as ventas,
      SUM(si.total_amount) as ingresos
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE ${dateFilter}
    GROUP BY p.id, p.name
    ORDER BY ingresos DESC
    LIMIT 5
  `;

  // Obtener top clientes
  const topCustomers = await sql`
    SELECT
      c.name,
      COUNT(s.id) as compras,
      SUM(s.total_amount) as total
    FROM sales s
    JOIN customers c ON s.customer_id = c.id
    WHERE ${dateFilter}
    GROUP BY c.id, c.name
    ORDER BY total DESC
    LIMIT 5
  `;

  return NextResponse.json({
    monthly: salesByMonth,
    topProducts,
    topCustomers
  });
}

// Función para manejar resumen financiero
async function handleFinancialSummary(period: string | null) {
  const dateFilter = getDateFilter(period);

  // Obtener resumen financiero del periodo actual
  const currentSummary = await sql`
    SELECT
      SUM(s.total_amount) as ingresos,
      SUM(s.total_amount * 0.7) as costos,
      SUM(s.total_amount * 0.3) as ganancias
    FROM sales s
    WHERE ${dateFilter}
  `;

  // Obtener resumen del periodo anterior para comparación
  const previousDateFilter = getPreviousDateFilter(period);
  const previousSummary = await sql`
    SELECT
      SUM(s.total_amount) as ingresos,
      SUM(s.total_amount * 0.7) as costos,
      SUM(s.total_amount * 0.3) as ganancias
    FROM sales s
    WHERE ${previousDateFilter}
  `;

  const current = currentSummary[0] ?? { ingresos: 0, costos: 0, ganancias: 0 };
  const previous = previousSummary[0] ?? { ingresos: 0, costos: 0, ganancias: 0 };

  return NextResponse.json({
    summary: {
      ingresos: current.ingresos ?? 0,
      costos: current.costos ?? 0,
      ganancias: current.ganancias ?? 0,
      ingresosPrevio: previous.ingresos ?? 0,
      costosPrevio: previous.costos ?? 0,
      gananciasPrevio: previous.ganancias ?? 0,
    }
  });
}

// Función para obtener el filtro de fecha del periodo anterior
function getPreviousDateFilter(period: string | null) {
  if (!period) return sql`1 = 1`;

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'quarter': {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart - 3, 1);
      endDate = new Date(now.getFullYear(), quarterStart, 0);
      break;
    }
    case 'year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      // Caso por defecto diferente para evitar duplicación
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  return sql`s.sale_date >= ${startDate.toISOString().split('T')[0]} AND s.sale_date <= ${endDate.toISOString().split('T')[0]}`;
}

export async function GET(request: NextRequest) {
  try {
    // Leer parámetros de la URL
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const period = searchParams.get('period');
    const groupBy = searchParams.get('groupBy');
    const financialSummary = searchParams.get('financialSummary') === 'true';

    // Si es para reportería con resumen financiero
    if (financialSummary) {
      return await handleFinancialSummary(period);
    }

    // Si es para reportería con agrupación por mes
    if (groupBy === 'month') {
      return await handleMonthlyReports(period);
    }

    // Determinar si es para dashboard (sin parámetros de paginación) o para paginación
    const isDashboard = !limitParam && !offsetParam && !period;
    const limit = parseInt(limitParam ?? (isDashboard ? '100' : '20'), 10);
    const offset = parseInt(offsetParam ?? '0', 10);

    // Obtener el total de registros solo si no es dashboard
    let total = 0;
    if (!isDashboard) {
      const totalResult = await sql`SELECT COUNT(*)::int AS total FROM sales`;
      total = totalResult[0]?.total ?? 0;
    }

    // Obtener ventas ordenadas
    const sales = await sql`
      SELECT
        s.*,
        c.name as customer_name,
        u.name as user_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Define types for sales
    interface SaleRow {
      id: string;
      customer_id: string | null;
      user_id: string;
      invoice_number: string;
      sale_date: string;
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      total_amount: number;
      payment_method: string;
      payment_status: string;
      status: string;
      notes: string | null;
      created_at: string;
      updated_at: string;
      customer_name?: string;
      user_name?: string;
    }

    interface SaleItemRow {
      sale_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      total_amount: number;
    }

    const saleIds = (sales as SaleRow[]).map((s) => s.id);
    let saleItems: SaleItemRow[] = [];

    if (saleIds.length > 0) {
      saleItems = (await sql`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ANY(${saleIds})
      `) as SaleItemRow[];
    }

    // Attach items to each sale
    const salesWithItems = (sales as SaleRow[]).map((sale) => ({
      ...sale,
      items: saleItems.filter((item) => item.sale_id === sale.id)
    }));

    // Para el dashboard, devolver solo el array de ventas en formato simple
    if (isDashboard) {
      return NextResponse.json(salesWithItems.map(sale => ({
        id: sale.id,
        sale_date: sale.sale_date,
        total_amount: sale.total_amount,
        customer_name: sale.customer_name,
        products: sale.items?.map(item => ({
          name: item.product_name,
          quantity: item.quantity
        })) ?? []
      })));
    }

    // Para paginación, devolver el objeto completo con total
    return NextResponse.json({ total, sales: salesWithItems });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("xD");

    const data = await request.json();
    const {
      customer_id,
      items,
      payment_method,
      payment_status = "pending",
      status = "draft",
      discount_amount = 0,
      notes,
      user_id
    } = data;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: SaleItem) => sum + item.quantity * item.unit_price,
      0
    );
    const tax_amount = subtotal * 0.16; // 16% tax
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate invoice number
    const invoice_number = `INV-${Date.now()}`;

    // Convert empty string customer_id to null for DB compatibility
    const safeCustomerId = customer_id === '' ? null : customer_id;

    // Create sale using the authenticated user's ID
    const saleResult = await sql`
      INSERT INTO sales (
        customer_id, user_id, invoice_number, sale_date,
        subtotal, tax_amount, discount_amount, total_amount,
        payment_method, payment_status, status, notes
      )
      VALUES (
        ${safeCustomerId}, ${user_id}, ${invoice_number}, NOW(),
        ${subtotal}, ${tax_amount}, ${discount_amount}, ${total_amount},
        ${payment_method}, ${payment_status}, ${status}, ${notes}
      )
      RETURNING *
    `;
    console.log("Sale created:", saleResult);
    const sale = saleResult[0];

    // Create sale items
    for (const item of items) {
      await sql`
        INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price,
          discount_amount, total_amount
        )
        VALUES (
          ${sale.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price},
          ${item.discount_amount ?? 0}, ${item.quantity * item.unit_price}
        )
      `;

      // Update product stock
      await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity},
            updated_at = NOW()
        WHERE id = ${item.product_id}
      `;

      // Create stock movement
      await sql`
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, reference_type,
          reference_id, user_id
        )
        VALUES (
          ${item.product_id}, 'out', ${item.quantity}, 'sale',
          ${sale.id}, ${user_id}
        )
      `;
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
