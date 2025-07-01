"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

interface Sale {
  id: string;
  invoice_number: string;
  customer_name?: string;
  sale_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        setSales(Array.isArray(data) ? data : []);
      } else {
        toast.error('Error al cargar las ventas');
        setSales([]);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error al cargar las ventas');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'confirmed': 'default',
      'draft': 'secondary',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'paid': 'default',
      'pending': 'secondary',
      'overdue': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Gestión de Ventas" description="Administra y registra todas las ventas de tu negocio">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
              <DialogDescription>
                Crea una nueva venta para un cliente
              </DialogDescription>
            </DialogHeader>
            <NewSaleForm onSuccess={() => {
              setIsNewSaleOpen(false);
              fetchSales();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total de Ventas</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{sales.length}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Ventas Hoy</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {sales.filter(sale => {
                      const today = new Date().toDateString();
                      const saleDate = new Date(sale.sale_date).toDateString();
                      return today === saleDate;
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Ventas Pendientes</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {sales.filter(sale => sale.payment_status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Ingresos Total</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    ${sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>
            Lista de todas las ventas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No hay ventas</h3>
              <p className="mt-1 text-sm text-slate-500">Comienza registrando tu primera venta.</p>
              <div className="mt-6">
                <Button onClick={() => setIsNewSaleOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Venta
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer_name || 'Cliente General'}</TableCell>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>${Number(sale.total_amount).toFixed(2)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(sale.payment_status)}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </PageLayout>
  );
}

function NewSaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    payment_method: 'cash',
    notes: ''
  });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For demo purposes, using a default user_id
      const saleData = {
        ...formData,
        user_id: '00000000-0000-0000-0000-000000000000', // This should come from auth
        items: items.filter(item => item.product_id && item.quantity > 0)
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        toast.success('Venta registrada exitosamente');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al registrar la venta');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_method">Método de Pago</Label>
          <select
            id="payment_method"
            className="w-full p-2 border rounded-md"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="credit">Crédito</option>
          </select>
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales"
          />
        </div>
      </div>

      <div>
        <Label>Productos</Label>
        {items.map((item, index) => (
          <div key={`item-${index}-${item.product_id}`} className="flex gap-2 mb-2">
            <Input
              placeholder="ID del producto"
              value={item.product_id}
              onChange={(e) => updateItem(index, 'product_id', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Cantidad"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Precio unitario"
              value={item.unit_price}
              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
            />
            <Button type="button" variant="outline" onClick={() => removeItem(index)}>
              Eliminar
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem}>
          Agregar Producto
        </Button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Venta'}
        </Button>
      </div>
    </form>
  );
}
