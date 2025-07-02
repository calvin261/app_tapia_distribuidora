"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, ShoppingBagIcon, TruckIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';


interface Purchase {
  id: string;
  order_number: string;
  supplier_name?: string;
  supplier_id: string;
  order_date: string;
  expected_delivery: string;
  total_amount: number;
  status: string;
  payment_status: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/products')
      ]);

      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json();
        setPurchases(purchasesData);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsNewPurchaseOpen(true);
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar la orden de compra "${orderNumber}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Orden de compra eliminada exitosamente');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar la orden de compra');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Error al eliminar la orden de compra');
    }
  };

  const resetForm = () => {
    setEditingPurchase(null);
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (purchase.supplier_name && purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'secondary',
      'confirmed': 'default',
      'received': 'default',
      'cancelled': 'destructive'
    };
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'received': 'Recibida',
      'cancelled': 'Cancelada'
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'paid': 'default',
      'pending': 'secondary',
      'overdue': 'destructive'
    };
    const labels: Record<string, string> = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'overdue': 'Vencido'
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando órdenes de compra...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Órdenes de Compra" description="Gestiona las órdenes de compra y reposición de inventario">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={isNewPurchaseOpen} onOpenChange={(open) => {
            setIsNewPurchaseOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Orden de Compra
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>
                {editingPurchase ? 'Editar Orden de Compra' : 'Crear Nueva Orden de Compra'}
              </DialogTitle>
              <DialogDescription>
                {editingPurchase ? 'Modifica la orden de compra' : 'Registra una nueva orden de compra a un proveedor'}
              </DialogDescription>
            </DialogHeader>
            <NewPurchaseForm
              suppliers={suppliers}
              products={products}
              editingPurchase={editingPurchase}
              onSuccess={() => {
                setIsNewPurchaseOpen(false);
                fetchData();
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Órdenes</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{purchases.length}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-amber-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Pendientes</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {purchases.filter(p => p.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">En Tránsito</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {purchases.filter(p => p.status === 'confirmed').length}
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
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Invertido</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    ${purchases.reduce((sum, purchase) => sum + Number(purchase.total_amount), 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="search">Buscar órdenes de compra</Label>
              <Input
                id="search"
                placeholder="Buscar por número de orden o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases table with tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
          <TabsTrigger value="received">Recibidas</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PurchasesTable
            purchases={filteredPurchases}
            getStatusBadge={getStatusBadge}
            getPaymentStatusBadge={getPaymentStatusBadge}
            onNewPurchase={() => setIsNewPurchaseOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PurchasesTable
            purchases={filteredPurchases.filter(p => p.status === 'pending')}
            getStatusBadge={getStatusBadge}
            getPaymentStatusBadge={getPaymentStatusBadge}
            onNewPurchase={() => setIsNewPurchaseOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="confirmed">
          <PurchasesTable
            purchases={filteredPurchases.filter(p => p.status === 'confirmed')}
            getStatusBadge={getStatusBadge}
            getPaymentStatusBadge={getPaymentStatusBadge}
            onNewPurchase={() => setIsNewPurchaseOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="received">
          <PurchasesTable
            purchases={filteredPurchases.filter(p => p.status === 'received')}
            getStatusBadge={getStatusBadge}
            getPaymentStatusBadge={getPaymentStatusBadge}
            onNewPurchase={() => setIsNewPurchaseOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
      </div>
    </PageLayout>
  );
}

function PurchasesTable({
  purchases,
  getStatusBadge,
  getPaymentStatusBadge,
  onNewPurchase,
  onEdit,
  onDelete
}: {
  purchases: Purchase[];
  getStatusBadge: (status: string) => React.ReactElement;
  getPaymentStatusBadge: (status: string) => React.ReactElement;
  onNewPurchase: () => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string, orderNumber: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes de Compra</CardTitle>
        <CardDescription>
          Lista de todas las órdenes de compra registradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No hay órdenes de compra</h3>
            <p className="mt-1 text-sm text-slate-500">
              Comienza creando tu primera orden de compra.
            </p>
            <div className="mt-6">
              <Button onClick={onNewPurchase}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Orden de Compra
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha de Orden</TableHead>
                <TableHead>Entrega Esperada</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estado de Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.order_number}</TableCell>
                  <TableCell>{purchase.supplier_name || 'N/A'}</TableCell>
                  <TableCell>{new Date(purchase.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {purchase.expected_delivery ? new Date(purchase.expected_delivery).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>${Number(purchase.total_amount).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(purchase.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(purchase)}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(purchase.id, purchase.order_number)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function NewPurchaseForm({
  suppliers,
  products,
  editingPurchase,
  onSuccess
}: {
  suppliers: Supplier[];
  products: Product[];
  editingPurchase?: Purchase | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery: '',
    payment_terms: 'net_30',
    notes: ''
  });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_cost: 0 }]);
  const [formLoading, setFormLoading] = useState(false);

  // Initialize form with editing purchase data
  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        supplier_id: editingPurchase.supplier_id,
        expected_delivery: editingPurchase.expected_delivery,
        payment_terms: 'net_30', // Add payment_terms to Purchase interface if needed
        notes: '' // Add notes to Purchase interface if needed
      });
      // You might need to fetch purchase items from API to populate items state
    } else {
      setFormData({
        supplier_id: '',
        expected_delivery: '',
        payment_terms: 'net_30',
        notes: ''
      });
      setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]);
    }
  }, [editingPurchase]);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_cost: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateItemWithProductPrice = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_cost: product ? product.cost_price : 0
    };
    setItems(newItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingPurchase ? `/api/purchases/${editingPurchase.id}` : '/api/purchases';
      const method = editingPurchase ? 'PUT' : 'POST';

      const purchaseData = {
        ...formData,
        user_id: '00000000-0000-0000-0000-000000000000', // This should come from auth
        items: items.filter(item => item.product_id && item.quantity > 0)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });

      if (response.ok) {
        toast.success(editingPurchase ? 'Orden de compra actualizada exitosamente' : 'Orden de compra creada exitosamente');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || `Error al ${editingPurchase ? 'actualizar' : 'crear'} la orden de compra`);
      }
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.error(`Error al ${editingPurchase ? 'actualizar' : 'crear'} la orden de compra`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="supplier_id">Proveedor *</Label>
          <select
            id="supplier_id"
            className="w-full p-2 border rounded-md"
            value={formData.supplier_id}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
            required
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="expected_delivery">Fecha de Entrega Esperada</Label>
          <Input
            id="expected_delivery"
            type="date"
            value={formData.expected_delivery}
            onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_terms">Términos de Pago</Label>
          <select
            id="payment_terms"
            className="w-full p-2 border rounded-md"
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
          >
            <option value="immediate">Inmediato</option>
            <option value="net_15">Neto 15 días</option>
            <option value="net_30">Neto 30 días</option>
            <option value="net_60">Neto 60 días</option>
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
        <Label>Productos a Ordenar</Label>
        {items.map((item, index) => (
          <div key={`item-${index}`} className="flex gap-2 mb-2">
            <select
              className="flex-1 p-2 border rounded-md"
              value={item.product_id}
              onChange={(e) => updateItemWithProductPrice(index, e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Cantidad"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
              className="w-20"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Costo unitario"
              value={item.unit_cost}
              onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
              className="w-32"
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

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: ${getTotalAmount().toFixed(2)}
        </div>
        <div className="flex space-x-2">
          <Button type="submit" disabled={formLoading}>
            {formLoading ? 'Guardando...' : (editingPurchase ? 'Actualizar Orden de Compra' : 'Crear Orden de Compra')}
          </Button>
        </div>
      </div>
    </form>
  );
}
