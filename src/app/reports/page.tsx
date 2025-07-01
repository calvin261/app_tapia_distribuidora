"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { PageLayout } from '@/components/layout/PageLayout';

// Sample data for different reports
const salesByMonth = [
  { month: 'Ene', ventas: 4000, productos: 120, clientes: 25 },
  { month: 'Feb', ventas: 3000, productos: 98, clientes: 22 },
  { month: 'Mar', ventas: 2000, productos: 86, clientes: 18 },
  { month: 'Abr', ventas: 2780, productos: 99, clientes: 20 },
  { month: 'May', ventas: 1890, productos: 85, clientes: 17 },
  { month: 'Jun', ventas: 2390, productos: 105, clientes: 24 },
];

const productCategories = [
  { name: 'Electrónicos', value: 400, color: '#0088FE' },
  { name: 'Oficina', value: 300, color: '#00C49F' },
  { name: 'Limpieza', value: 300, color: '#FFBB28' },
  { name: 'Otros', value: 200, color: '#FF8042' },
];

const topProducts = [
  { name: 'Laptop HP', ventas: 45, ingresos: 22500 },
  { name: 'Mouse Logitech', ventas: 120, ingresos: 3600 },
  { name: 'Teclado Mecánico', ventas: 65, ingresos: 9750 },
  { name: 'Monitor LG', ventas: 28, ingresos: 8400 },
  { name: 'Audífonos Sony', ventas: 85, ingresos: 8500 },
];

const topCustomers = [
  { name: 'Empresa ABC', compras: 15, total: 45000 },
  { name: 'Comercial XYZ', compras: 12, total: 38000 },
  { name: 'Oficina 123', compras: 8, total: 22000 },
  { name: 'Tech Solutions', compras: 6, total: 18000 },
  { name: 'Global Corp', compras: 10, total: 35000 },
];

const inventoryStatus = [
  { category: 'Stock Normal', count: 150, color: '#22c55e' },
  { category: 'Stock Bajo', count: 25, color: '#f59e0b' },
  { category: 'Sin Stock', count: 8, color: '#ef4444' },
  { category: 'Sobrestock', count: 12, color: '#6366f1' },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handleExportPDF = () => {
    // Implementation for PDF export
    console.log('Exportando a PDF...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageLayout title="Reportes y Análisis" description="Visualiza métricas y reportes del negocio">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Mes</CardTitle>
                <CardDescription>Tendencia de ventas de los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="ventas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
                <CardDescription>Ventas por categoría de producto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategories.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 5 productos por volumen de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.ventas} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${product.ingresos.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">Ingresos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Inventario</CardTitle>
                <CardDescription>Distribución actual del stock</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de Stock</CardTitle>
                <CardDescription>Productos que necesitan atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Sin Stock</p>
                      <p className="text-sm text-red-600">8 productos</p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-800">Stock Bajo</p>
                      <p className="text-sm text-amber-600">25 productos</p>
                    </div>
                    <Badge className="bg-amber-500">Advertencia</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Sobrestock</p>
                      <p className="text-sm text-blue-600">12 productos</p>
                    </div>
                    <Badge variant="secondary">Revisar</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Reports */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mejores Clientes</CardTitle>
              <CardDescription>Clientes con mayor volumen de compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-slate-500">{customer.compras} órdenes de compra</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">${customer.total.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">Total comprado</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">$158,420</div>
                <p className="text-xs text-slate-500">Ingresos del mes</p>
                <div className="text-sm text-green-600 mt-1">+12.5% vs mes anterior</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">$89,230</div>
                <p className="text-xs text-slate-500">Costos del mes</p>
                <div className="text-sm text-red-600 mt-1">+5.2% vs mes anterior</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">$69,190</div>
                <p className="text-xs text-slate-500">Ganancia del mes</p>
                <div className="text-sm text-green-600 mt-1">+22.8% vs mes anterior</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja</CardTitle>
              <CardDescription>Ingresos vs gastos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="productos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PageLayout>
  );
}