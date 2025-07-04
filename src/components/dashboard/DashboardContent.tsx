"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Strict TypeScript interfaces for dashboard data
interface Stat {
  id: number;
  name: string;
  stat: string | number;
  icon: React.ElementType;
  change: string;
  changeType: 'increase' | 'decrease';
}

interface Sale {
  id: string;
  sale_date: string;
  total_amount: number;
  customer_name?: string;
  products?: { name: string; quantity: number }[];
}

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level?: number;
  category_id?: string;
  stock?: number; // for low stock badge
}

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface RecentSale {
  id: string;
  customer: string;
  email: string;
  amount: string;
}

export function DashboardContent() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; ventas: number }[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; ventas: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iva, setIva] = useState<number>(16);
  const router = useRouter();

  useEffect(() => {
    console.log("DashboardContent mounted");

    // Cargar datos reales del backend
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch IVA from settings
      let ivaValue = 16;
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.taxRate !== undefined) ivaValue = Number(settings.taxRate);
        }
      } catch {}
      setIva(ivaValue);

      // Ventas
      const salesRes = await fetch('/api/sales');
      const sales: Sale[] = salesRes.ok ? await salesRes.json() : [];
      // Productos
      const productsRes = await fetch('/api/products');
      const products: Product[] = productsRes.ok ? await productsRes.json() : [];
      // Clientes
      const customersRes = await fetch('/api/customers');
      const customers: Customer[] = customersRes.ok ? await customersRes.json() : [];

      // Estadísticas
      setStats([
        {
          id: 1,
          name: 'Ventas del mes',
          stat: `$${sales.filter((s) => new Date(s.sale_date).getMonth() === new Date().getMonth()).reduce((acc, s) => acc + Number(s.total_amount) * (1 + ivaValue / 100), 0).toLocaleString('es-MX', {minimumFractionDigits:2})}`,
          icon: CurrencyDollarIcon,
          change: '+0%',
          changeType: 'increase',
        },
        {
          id: 2,
          name: 'Productos en stock',
          stat: products.reduce((acc, p) => acc + Number(p.stock_quantity), 0).toLocaleString('es-MX'),
          icon: CubeIcon,
          change: '+0%',
          changeType: 'increase',
        },
        {
          id: 3,
          name: 'Clientes activos',
          stat: customers.length.toLocaleString('es-MX'),
          icon: UserGroupIcon,
          change: '+0%',
          changeType: 'increase',
        },
        {
          id: 4,
          name: 'Órdenes hoy',
          stat: sales.filter((s) => new Date(s.sale_date).toDateString() === new Date().toDateString()).length,
          icon: ShoppingCartIcon,
          change: '+0%',
          changeType: 'increase',
        },
      ]);

      // Gráfica de ventas por mes (últimos 6 meses)
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const now = new Date();
      const salesByMonth = Array.from({length: 6}).map((_,i) => {
        const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
        const monthSales = sales.filter((s) => {
          const sd = new Date(s.sale_date);
          return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        });
        return {
          name: months[d.getMonth()],
          ventas: monthSales.reduce((acc, s) => acc + Number(s.total_amount), 0)
        };
      });
      setSalesData(salesByMonth);

      // Top productos más vendidos (últimos 6 meses)
      const productSalesMap: Record<string, { name: string; ventas: number }> = {};
      sales.forEach((s) => {
        if (s.products) {
          s.products.forEach((p) => {
            console.log(p);

            if (!productSalesMap[p.name]) productSalesMap[p.name] = { name: p.name, ventas: 0 };
            productSalesMap[p.name].ventas = Number(productSalesMap[p.name].ventas) + Number(p.quantity);
          });
        }
      });
      const top = Object.values(productSalesMap).sort((a, b) => b.ventas - a.ventas).slice(0, 5);


      setTopProducts(top);

      // Ventas recientes
      setRecentSales(sales.slice(0,5).map((s) => ({
        id: s.id,
        customer: s.customer_name ?? 'Cliente General',
        email: '',
        amount: `$${Number(s.total_amount).toLocaleString('es-MX', {minimumFractionDigits:2})}`
      })));

      // Productos con bajo stock
      setLowStockProducts(products.filter((p) => Number(p.stock_quantity) <= Number(p.min_stock_level ?? 0)).slice(0,5));
    } catch {
      setError('Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4'>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resumen general de tu negocio
          </p>
        </div>
        {/* Stats loading */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="p-6 bg-slate-100 rounded-lg animate-pulse h-28" />
          ))}
        </div>
        {/* Charts loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-100 rounded-lg animate-pulse h-80" />
          <div className="bg-slate-100 rounded-lg animate-pulse h-80" />
        </div>
        {/* Lists loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-100 rounded-lg animate-pulse h-48" />
          <div className="bg-slate-100 rounded-lg animate-pulse h-48" />
        </div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4'>
        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen general de tu negocio
        </p>
        <div className="ml-auto mt-4 flex">
          <Button variant="outline" className="flex justify-center" onClick={() => router.push('/sales')}>
            <ShoppingCartIcon className="h-6 w-6" />
            Nueva venta
          </Button>
          <Button variant="outline" className="flex justify-center" onClick={() => router.push('/inventory')}>
            <CubeIcon className="h-6 w-6" />
            Agregar producto
          </Button>
          <Button variant="outline" className="flex justify-center" onClick={() => router.push('/customers')}>
            <UserGroupIcon className="h-6 w-6" />
            Nuevo cliente
          </Button>
          <Button variant="outline" className="flex justify-center" onClick={() => router.push('/reports')}>
            <CurrencyDollarIcon className="h-6 w-6" />
            Ver reportes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-4 flex justify-end items-center mb-2">
          <span className="text-xs text-slate-500 flex items-center" title="IVA actual parametrizado en configuración">
            <InformationCircleIcon className="h-4 w-4 mr-1" /> IVA: {iva}%
          </span>
        </div>
        {stats.length === 0 ? (
          <div className="col-span-4 text-center text-slate-400 py-8 flex flex-col items-center">
            <InformationCircleIcon className="h-8 w-8 mb-2" />
            No hay estadísticas para mostrar.
          </div>
        ) : (
          stats.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-slate-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate flex items-center">
                        {item.name}
                        <span className="ml-1" title={item.name + ' - tooltip'}>
                          <InformationCircleIcon className="h-4 w-4 text-slate-300 inline" />
                        </span>
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-slate-900">{item.stat}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.changeType === 'increase' ? (
                            <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                          ) : (
                            <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
                          )}
                          <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por mes</CardTitle>
            <CardDescription>
              Tendencia de ventas de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <div className="text-center text-slate-400 py-16 flex flex-col items-center">
                <InformationCircleIcon className="h-8 w-8 mb-2" />
                No hay datos de ventas para mostrar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ fontSize: '14px' }} />
                  <Bar dataKey="ventas" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
            <CardDescription>
              Top 5 productos por cantidad vendida (últimos 6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center text-slate-400 py-16 flex flex-col items-center">
                <InformationCircleIcon className="h-8 w-8 mb-2" />
                No hay productos vendidos para mostrar.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <li key={p.name} className="flex items-center justify-between py-2">
                    <span className="font-medium text-slate-700">{idx + 1}. {p.name}</span>
                    <span className="text-slate-500">{p.ventas} unidades</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
            <CardDescription>
              Últimas transacciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center text-slate-400 py-8 flex flex-col items-center">
                <InformationCircleIcon className="h-8 w-8 mb-2" />
                No hay ventas recientes.
              </div>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{sale.customer}</p>
                      <p className="text-sm text-slate-500">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
              Alertas de stock bajo
            </CardTitle>
            <CardDescription>
              Productos que necesitan reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center text-slate-400 py-8 flex flex-col items-center">
                <InformationCircleIcon className="h-8 w-8 mb-2" />
                No hay productos con bajo stock.
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                      <p className="text-sm text-slate-500">Stock mínimo: {product.min_stock_level ?? 0}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">{product.stock} unidades</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => router.push('/inventory')}>
                Ver todos los productos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
