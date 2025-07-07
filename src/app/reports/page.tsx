"use client";

import { useEffect, useState } from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import { PageLayout } from '@/components/layout/PageLayout';

// Tipos fuertes para los datos
interface SalesByMonth {
  month: string;
  ventas: number;
  productos?: number; // para gráfico financiero
  costos?: number;
  ganancias?: number;
}


interface TopProduct {
  name: string;
  ventas: number;
  ingresos: number;
}

interface TopCustomer {
  name: string;
  compras: number;
  total: number;
}

interface InventoryStatus {
  category: string;
  count: number;
  color?: string;
}

interface FinancialSummary {
  ingresos: number;
  costos: number;
  ganancias: number;
  ingresosPrevio: number;
  costosPrevio: number;
  gananciasPrevio: number;
}

interface InventoryTurnoverByMonth {
  month: string;
  turnover: number; // veces que rota el inventario ese mes
}

// Función helper para calcular el texto del periodo
const getPeriodText = (period: string): string => {
  switch (period) {
    case 'week': return 'semana';
    case 'month': return 'mes';
   case 'semester': return 'semestre';
    case 'year': return 'año';
    default: return 'periodo';
  }
};

// Función helper para calcular porcentajes
const calculatePercentage = (current: number, previous: number): string => {
  if (previous === 0) return '+100';
  const diff = ((current - previous) / previous) * 100;
  return diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
};

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Estados para datos reales
  const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    ingresos: 0,
    costos: 0,
    ganancias: 0,
    ingresosPrevio: 0,
    costosPrevio: 0,
    gananciasPrevio: 0,
  });
  const [inventoryTurnoverByMonth, setInventoryTurnoverByMonth] = useState<InventoryTurnoverByMonth[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch de datos reales
  useEffect(() => {


    async function fetchReports() {
      setIsLoading(true);
      try {
        // Ventas
        const salesRes = await fetch(`/api/sales?period=${selectedPeriod}&groupBy=month&limit=100`);
        const salesData = await salesRes.json();
        console.log("Datos de ventas:", salesData);
        setSalesByMonth((salesData.monthly ?? []) as SalesByMonth[]);
        setTopProducts((salesData.topProducts ?? []) as TopProduct[]);
        setTopCustomers((salesData.topCustomers ?? []) as TopCustomer[]);

        // Productos/Inventario
        const productsRes = await fetch(`/api/products?period=${selectedPeriod}&limit=100`);
        const productsData = await productsRes.json();
        setInventoryStatus((productsData.inventoryStatus ?? []) as InventoryStatus[]);
        // Simulación de rotación total de inventario por mes (JIT)
        const months = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];
        const simulatedTurnoverByMonth = Array.from({ length: 6 }, (_, i) => ({
          month: months[(new Date().getMonth() - 5 + i + 12) % 12],
          turnover: Math.round(Math.random() * 10 + 2), // Simulación: 2 a 12 rotaciones
        }));
        setInventoryTurnoverByMonth(simulatedTurnoverByMonth);

        // Datos financieros
        const financialRes = await fetch(`/api/sales?period=${selectedPeriod}&financialSummary=true`);
        const financialData = await financialRes.json();

        if (financialData.summary) {
          setFinancialSummary({
            ingresos: financialData.summary.ingresos ?? 0,
            costos: financialData.summary.costos ?? 0,
            ganancias: financialData.summary.ganancias ?? 0,
            ingresosPrevio: financialData.summary.ingresosPrevio ?? 0,
            costosPrevio: financialData.summary.costosPrevio ?? 0,
            gananciasPrevio: financialData.summary.gananciasPrevio ?? 0,
          });
        }
      } catch (error) {
        console.error("Error al cargar reportes:", error);
        setSalesByMonth([]);
        setTopProducts([]);
        setTopCustomers([]);
        setInventoryStatus([]);
        setFinancialSummary({
          ingresos: 0,
          costos: 0,
          ganancias: 0,
          ingresosPrevio: 0,
          costosPrevio: 0,
          gananciasPrevio: 0,
        });
        setInventoryTurnoverByMonth([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, [selectedPeriod]);

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
              <SelectItem value="semester">Este semestre</SelectItem>
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
                    <XAxis dataKey={
                      selectedPeriod === 'week' ? 'day' :
                      selectedPeriod === 'month' ? 'day' :
                      'month'
                    } />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="ventas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotación Total de Inventario</CardTitle>
                <CardDescription>Veces que el inventario total rota por mes (JIT)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryTurnoverByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="turnover" stroke="#10b981" strokeWidth={2} name="Rotación" />
                  </LineChart>
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
                      <p className="font-bold text-green-600">${product.ingresos?.toLocaleString() ?? 0}</p>
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
                  {inventoryStatus.filter(s => s.category === 'Sin Stock').map((s) => (
                    <div key={s.category + '-' + s.count} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Sin Stock</p>
                        <p className="text-sm text-red-600">{s.count} productos</p>
                      </div>
                      <Badge variant="destructive">Crítico</Badge>
                    </div>
                  ))}
                  {inventoryStatus.filter(s => s.category === 'Stock Bajo').map((s) => (
                    <div key={s.category + '-' + s.count} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-800">Stock Bajo</p>
                        <p className="text-sm text-amber-600">{s.count} productos</p>
                      </div>
                      <Badge className="bg-amber-500">Advertencia</Badge>
                    </div>
                  ))}
                  {inventoryStatus.filter(s => s.category === 'Sobrestock').map((s) => (
                    <div key={s.category + '-' + s.count} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Sobrestock</p>
                        <p className="text-sm text-blue-600">{s.count} productos</p>
                      </div>
                      <Badge variant="secondary">Revisar</Badge>
                    </div>
                  ))}
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
                      <p className="font-bold text-blue-600">${customer.total?.toLocaleString() ?? 0}</p>
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
                <div className="text-2xl font-bold text-green-600">${financialSummary.ingresos.toLocaleString()}</div>
                <p className="text-xs text-slate-500">Ingresos del {getPeriodText(selectedPeriod)}</p>
                {financialSummary.ingresosPrevio > 0 && (
                  <div className={`text-sm ${financialSummary.ingresos >= financialSummary.ingresosPrevio ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {calculatePercentage(financialSummary.ingresos, financialSummary.ingresosPrevio)}% vs periodo anterior
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">${financialSummary.costos.toLocaleString()}</div>
                <p className="text-xs text-slate-500">Costos del {getPeriodText(selectedPeriod)}</p>
                {financialSummary.costosPrevio > 0 && (
                  <div className={`text-sm ${financialSummary.costos <= financialSummary.costosPrevio ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {calculatePercentage(financialSummary.costos, financialSummary.costosPrevio)}% vs periodo anterior
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">${financialSummary.ganancias.toLocaleString()}</div>
                <p className="text-xs text-slate-500">Ganancia del {getPeriodText(selectedPeriod)}</p>
                {financialSummary.gananciasPrevio > 0 && (
                  <div className={`text-sm ${financialSummary.ganancias >= financialSummary.gananciasPrevio ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {calculatePercentage(financialSummary.ganancias, financialSummary.gananciasPrevio)}% vs periodo anterior
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja</CardTitle>
              <CardDescription>Ingresos vs gastos por {getPeriodText(selectedPeriod)}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                    <Line type="monotone" dataKey="costos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
                    <Line type="monotone" dataKey="ganancias" stroke="#8b5cf6" strokeWidth={2} name="Ganancias" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PageLayout>
  );
}