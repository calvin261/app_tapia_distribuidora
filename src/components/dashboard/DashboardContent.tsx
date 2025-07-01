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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const salesData = [
  { name: 'Ene', ventas: 4000 },
  { name: 'Feb', ventas: 3000 },
  { name: 'Mar', ventas: 2000 },
  { name: 'Abr', ventas: 2780 },
  { name: 'May', ventas: 1890 },
  { name: 'Jun', ventas: 2390 },
];

const productData = [
  { name: 'Electrónicos', value: 400 },
  { name: 'Oficina', value: 300 },
  { name: 'Limpieza', value: 300 },
  { name: 'Otros', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const stats = [
  {
    id: 1,
    name: 'Ventas del mes',
    stat: '$45,231',
    icon: CurrencyDollarIcon,
    change: '+4.75%',
    changeType: 'increase',
  },
  {
    id: 2,
    name: 'Productos en stock',
    stat: '1,247',
    icon: CubeIcon,
    change: '-1.39%',
    changeType: 'decrease',
  },
  {
    id: 3,
    name: 'Clientes activos',
    stat: '312',
    icon: UserGroupIcon,
    change: '+10.18%',
    changeType: 'increase',
  },
  {
    id: 4,
    name: 'Órdenes hoy',
    stat: '24',
    icon: ShoppingCartIcon,
    change: '+5.4%',
    changeType: 'increase',
  },
];

const recentSales = [
  { id: 1, customer: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '$1,999.00' },
  { id: 2, customer: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '$39.00' },
  { id: 3, customer: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '$299.00' },
  { id: 4, customer: 'William Kim', email: 'will@email.com', amount: '$99.00' },
  { id: 5, customer: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '$39.00' },
];

const lowStockProducts = [
  { id: 1, name: 'Laptop HP', stock: 2, minStock: 10 },
  { id: 2, name: 'Mouse Logitech', stock: 5, minStock: 20 },
  { id: 3, name: 'Papel A4', stock: 1, minStock: 50 },
];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-8 w-8 text-slate-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
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
        ))}
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de productos</CardTitle>
            <CardDescription>
              Productos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[productData.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-slate-500">Stock mínimo: {product.minStock}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">{product.stock} unidades</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver todos los productos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>
            Tareas frecuentes para agilizar tu trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <ShoppingCartIcon className="h-6 w-6 mb-2" />
              Nueva venta
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CubeIcon className="h-6 w-6 mb-2" />
              Agregar producto
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <UserGroupIcon className="h-6 w-6 mb-2" />
              Nuevo cliente
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CurrencyDollarIcon className="h-6 w-6 mb-2" />
              Ver reportes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
