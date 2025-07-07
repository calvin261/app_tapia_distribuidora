import { NextResponse } from "next/server";
import { sql } from "@/lib/database";

interface DashboardStats {
  salesThisMonth: number;
  salesLastMonth: number;
  totalProducts: number;
  activeCustomers: number;
  ordersToday: number;
  lowStockCount: number;
  salesGrowth: string;
  productGrowth: string;
  customerGrowth: string;
  ordersGrowth: string;
}

interface SalesByMonth {
  name: string;
  ventas: number;
  month: number;
  year: number;
}

interface TopProduct {
  name: string;
  ventas: number;
  ingresos: number;
}

interface RecentSale {
  id: string;
  customer: string;
  email: string;
  amount: string;
  date: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  min_stock_level: number;
  category_name?: string;
}

// Función para obtener el comienzo y fin del mes actual
function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return {
    start: startOfMonth.toISOString().split('T')[0],
    end: endOfMonth.toISOString().split('T')[0]
  };
}

// Función para obtener el comienzo y fin del mes anterior
function getLastMonthRange() {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  return {
    start: startOfLastMonth.toISOString().split('T')[0],
    end: endOfLastMonth.toISOString().split('T')[0]
  };
}

// Función para obtener el comienzo y fin del día actual
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return {
    start: startOfDay.toISOString().split('T')[0],
    end: endOfDay.toISOString().split('T')[0]
  };
}

// Función para calcular el porcentaje de crecimiento
function calculateGrowth(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const growth = ((current - previous) / previous) * 100;
  return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
}

// Función para obtener estadísticas principales
async function getDashboardStats(): Promise<DashboardStats> {
  const currentMonth = getCurrentMonthRange();
  const lastMonth = getLastMonthRange();
  const today = getTodayRange();

  // Ventas del mes actual
  const currentMonthSales = await sql`
    SELECT
      COALESCE(SUM(total_amount), 0) as total
    FROM sales
    WHERE sale_date >= ${currentMonth.start}
      AND sale_date <= ${currentMonth.end}
      AND status != 'cancelled'
  `;

  // Ventas del mes anterior
  const lastMonthSales = await sql`
    SELECT
      COALESCE(SUM(total_amount), 0) as total
    FROM sales
    WHERE sale_date >= ${lastMonth.start}
      AND sale_date <= ${lastMonth.end}
      AND status != 'cancelled'
  `;

  // Total de productos activos
  const totalProducts = await sql`
    SELECT
      COALESCE(SUM(stock_quantity), 0) as total,
      COUNT(*) as product_count
    FROM products
    WHERE status = 'active'
  `;

  // Clientes activos (que han comprado en los últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const activeCustomers = await sql`
    SELECT COUNT(DISTINCT customer_id) as total
    FROM sales
    WHERE customer_id IS NOT NULL
      AND sale_date >= ${sixMonthsAgo.toISOString().split('T')[0]}
      AND status != 'cancelled'
  `;

  // Órdenes de hoy
  const ordersToday = await sql`
    SELECT COUNT(*) as total
    FROM sales
    WHERE sale_date >= ${today.start}
      AND sale_date <= ${today.end}
      AND status != 'cancelled'
  `;

  // Productos con stock bajo
  const lowStockProducts = await sql`
    SELECT COUNT(*) as total
    FROM products
    WHERE stock_quantity <= min_stock_level
      AND status = 'active'
      AND min_stock_level > 0
  `;

  const salesThisMonth = Number(currentMonthSales[0]?.total || 0);
  const salesLastMonth = Number(lastMonthSales[0]?.total || 0);
  const totalProductsCount = Number(totalProducts[0]?.total || 0);
  const activeCustomersCount = Number(activeCustomers[0]?.total || 0);
  const ordersTodayCount = Number(ordersToday[0]?.total || 0);
  const lowStockCount = Number(lowStockProducts[0]?.total || 0);

  return {
    salesThisMonth,
    salesLastMonth,
    totalProducts: totalProductsCount,
    activeCustomers: activeCustomersCount,
    ordersToday: ordersTodayCount,
    lowStockCount,
    salesGrowth: calculateGrowth(salesThisMonth, salesLastMonth),
    productGrowth: '+0%', // Placeholder - podríamos calcular crecimiento de inventario
    customerGrowth: '+0%', // Placeholder - podríamos calcular nuevos clientes
    ordersGrowth: '+0%' // Placeholder - podríamos calcular vs día anterior
  };
}

// Función para obtener ventas por mes de los últimos 6 meses
async function getSalesByMonth(): Promise<SalesByMonth[]> {
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const now = new Date();

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const salesData = await sql`
    SELECT
      EXTRACT(MONTH FROM sale_date) as month,
      EXTRACT(YEAR FROM sale_date) as year,
      COALESCE(SUM(total_amount), 0) as ventas
    FROM sales
    WHERE sale_date >= ${sixMonthsAgo.toISOString().split('T')[0]}
      AND status != 'cancelled'
    GROUP BY EXTRACT(YEAR FROM sale_date), EXTRACT(MONTH FROM sale_date)
    ORDER BY year, month
  `;

  // Crear array completo de los últimos 6 meses con datos
  const result: SalesByMonth[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const salesForMonth = salesData.find(s =>
      Number(s.month) === month && Number(s.year) === year
    );

    result.push({
      name: months[date.getMonth()],
      ventas: Number(salesForMonth?.ventas || 0),
      month,
      year
    });
  }

  return result;
}

// Función para obtener top productos más vendidos
async function getTopProducts(): Promise<TopProduct[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const topProducts = await sql`
    SELECT
      p.name,
      COALESCE(SUM(si.quantity), 0) as ventas,
      COALESCE(SUM(si.total_amount), 0) as ingresos
    FROM products p
    LEFT JOIN sale_items si ON p.id = si.product_id
    LEFT JOIN sales s ON si.sale_id = s.id
    WHERE s.sale_date >= ${sixMonthsAgo.toISOString().split('T')[0]}
      AND s.status != 'cancelled'
    GROUP BY p.id, p.name
    HAVING SUM(si.quantity) > 0
    ORDER BY ventas DESC
    LIMIT 5
  `;

  return topProducts.map(p => ({
    name: p.name,
    ventas: Number(p.ventas),
    ingresos: Number(p.ingresos)
  }));
}

// Función para obtener ventas recientes
async function getRecentSales(): Promise<RecentSale[]> {
  const recentSales = await sql`
    SELECT
      s.id,
      s.total_amount,
      s.sale_date,
      COALESCE(c.name, 'Cliente General') as customer_name,
      COALESCE(c.email, '') as customer_email
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.status != 'cancelled'
    ORDER BY s.created_at DESC
    LIMIT 5
  `;

  return recentSales.map(sale => ({
    id: sale.id,
    customer: sale.customer_name,
    email: sale.customer_email,
    amount: `$${Number(sale.total_amount).toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
    date: new Date(sale.sale_date).toLocaleDateString('es-MX')
  }));
}

// Función para obtener productos con stock bajo
async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const lowStockProducts = await sql`
    SELECT
      p.id,
      p.name,
      p.stock_quantity as stock,
      p.min_stock_level,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.stock_quantity <= p.min_stock_level
      AND p.status = 'active'
      AND p.min_stock_level > 0
    ORDER BY (p.stock_quantity::float / NULLIF(p.min_stock_level, 0)) ASC
    LIMIT 5
  `;

  return lowStockProducts.map(product => ({
    id: product.id,
    name: product.name,
    stock: Number(product.stock),
    min_stock_level: Number(product.min_stock_level),
    category_name: product.category_name
  }));
}

export async function GET() {
  try {
    // Obtener parámetro de configuración de IVA
    let taxRate = 16;
    try {
      const settings = await sql`SELECT value FROM settings WHERE key = 'taxRate'`;
      if (settings.length > 0) {
        taxRate = Number(settings[0].value);
      }
    } catch (error) {
      console.log('Using default tax rate:', error);
    }

    // Obtener todos los datos del dashboard en paralelo
    const [stats, salesByMonth, topProducts, recentSales, lowStockProducts] = await Promise.all([
      getDashboardStats(),
      getSalesByMonth(),
      getTopProducts(),
      getRecentSales(),
      getLowStockProducts()
    ]);

    return NextResponse.json({
      stats,
      salesByMonth,
      topProducts,
      recentSales,
      lowStockProducts,
      taxRate
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
