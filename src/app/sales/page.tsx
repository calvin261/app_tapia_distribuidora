"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, ShoppingCartIcon, XMarkIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Sale {
  id: string;
  invoice_number: string;
  customer_name?: string;
  customer_id?: string;
  sale_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  sale_price: number;
  stock_quantity: number;
  unit: string;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface SaleItemWithName {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total_amount?: number;
}

interface SaleWithItems extends Sale {
  items: SaleItemWithName[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 20;

  return (
    <ProtectedRoute>
      <SalesPageContent
        sales={sales}
        setSales={setSales}
        total={total}
        setTotal={setTotal}
        page={page}
        setPage={setPage}
        pageSize={PAGE_SIZE}
        customers={customers}
        setCustomers={setCustomers}
        products={products}
        setProducts={setProducts}
        loading={loading}
        setLoading={setLoading}
        isNewSaleOpen={isNewSaleOpen}
        setIsNewSaleOpen={setIsNewSaleOpen}
        editingSale={editingSale}
        setEditingSale={setEditingSale}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </ProtectedRoute>
  );
}

function SalesPageContent({
  sales,
  setSales,
  total,
  setTotal,
  page,
  setPage,
  pageSize,
  customers,
  setCustomers,
  products,
  setProducts,
  loading,
  setLoading,
  isNewSaleOpen,
  setIsNewSaleOpen,
  editingSale,
  setEditingSale,
  searchTerm,
  setSearchTerm,
}: {
  sales: SaleWithItems[];
  setSales: React.Dispatch<React.SetStateAction<SaleWithItems[]>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isNewSaleOpen: boolean;
  setIsNewSaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingSale: Sale | null;
  setEditingSale: React.Dispatch<React.SetStateAction<Sale | null>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const salesRes = await fetch(`/api/sales?limit=${pageSize}&offset=${offset}`);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(Array.isArray(salesData.sales) ? salesData.sales : []);
        setTotal(salesData.total || 0);
      } else {
        setSales([]);
        setTotal(0);
      }
      // Clientes y productos no requieren paginación aquí
      const customersRes = await fetch('/api/customers?limit=1000');
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(Array.isArray(customersData.customers) ? customersData.customers : customersData);
      }
      const productsRes = await fetch('/api/products?limit=1000');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData.products) ? productsData.products : productsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, setSales, setTotal, setCustomers, setProducts, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsNewSaleOpen(true);
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar la venta "${invoiceNumber}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Venta eliminada exitosamente');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar la venta');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Error al eliminar la venta');
    }
  };

  const resetForm = () => {
    setEditingSale(null);
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );


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
        <div className="text-lg">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Gestión de Ventas" description="Administra y registra todas las ventas de tu negocio">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={isNewSaleOpen} onOpenChange={(open) => {
            setIsNewSaleOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] max-h-[95vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? 'Editar Venta' : 'Registrar Nueva Venta'}
              </DialogTitle>
              <DialogDescription>
                {editingSale ? 'Modifica los datos de la venta' : 'Crea una nueva venta para un cliente'}
              </DialogDescription>
            </DialogHeader>
            <NewSaleForm
              customers={customers}
              products={products}
              editingSale={editingSale}
              onSuccess={() => {
                setIsNewSaleOpen(false);
                fetchData();
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="search">Buscar ventas</Label>
              <Input
                id="search"
                placeholder="Buscar por número de factura o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales summary cards */}
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                    ${total.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>
            Lista de todas las ventas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No hay ventas</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'No se encontraron ventas con ese criterio.' : 'Comienza registrando tu primera venta.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setIsNewSaleOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nueva Venta
                  </Button>
                </div>
              )}
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
                  <TableHead>Productos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <>
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                      <TableCell>{sale.customer_name || 'Cliente General'}</TableCell>
                      <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell>${Number(sale.total_amount).toFixed(2)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(sale.payment_status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                        >
                          {expandedSaleId === sale.id ? (
                            <ChevronUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 inline" />
                          )}
                          Ver productos
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sale.id, sale.invoice_number)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSaleId === sale.id && sale.items && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-slate-50">
                          <div className="py-2">
                            <div className="font-semibold mb-2">Productos vendidos:</div>
                            <ul className="pl-4 list-disc">
                              {(sale.items.length === 0) ? (
                                <li className="text-slate-400">Sin productos</li>
                              ) : null}
                              {sale.items.length > 0 && sale.items.map((item) => (
                                <li key={item.product_id}>
                                  {item.quantity} x {item.product_name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {/* Pagination Controls */}
        {total > pageSize && (
          <div className="flex justify-center items-center gap-2 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span>Página {page} de {Math.ceil(total / pageSize)}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>
      </div>
    </PageLayout>
  );
}

interface NewSaleFormProps {
  customers: Customer[];
  products: Product[];
  editingSale: Sale | null;
  onSuccess: () => void;
}

function NewSaleForm({ customers, products, editingSale, onSuccess }: NewSaleFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customer_id: '',
    payment_method: 'cash',
    payment_status: 'paid',
    status: 'draft',
    notes: ''
  });
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [taxRate, setTaxRate] = useState<number | null>(null);

  useEffect(() => {
    if (editingSale) {
      setFormData({
        customer_id: editingSale.customer_id || '',
        payment_method: 'cash', // Default, could be loaded from editingSale if available
        payment_status: editingSale.payment_status || 'paid',
        status: editingSale.status || 'draft',
        notes: '' // Could be loaded from editingSale if available
      });
      // Load existing items if editing (would need to fetch from API)
    }
  }, [editingSale]);

  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.system && typeof data.system.taxRate === 'number') {
            setTaxRate(data.system.taxRate / 100);
          } else if (typeof data.taxRate === 'number') {
            setTaxRate(data.taxRate);
          } else {
            setTaxRate(0.16);
          }
        } else {
          setTaxRate(0.16);
        }
      } catch {
        setTaxRate(0.16);
      }
    };

    fetchTaxRate();
  }, []);

  const addProductToSale = (product: Product) => {
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      // Increase quantity if product already exists
      const newQuantity = existingItem.quantity + 1;
      const unitPrice = Number(existingItem.unit_price || 0);
      setItems(items.map(item =>
        item.product_id === product.id
          ? {
              ...item,
              quantity: newQuantity,
              total: Number((newQuantity * unitPrice).toFixed(2))
            }
          : item
      ));
    } else {
      // Add new product
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: Number(product.sale_price),
        total: Number(Number(product.sale_price).toFixed(2))
      };
      setItems([...items, newItem]);
    }
    setProductSearch('');
    setShowProductSearch(false);
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(items.map(item =>
      item.product_id === productId
        ? {
            ...item,
            quantity,
            total: Number((quantity * Number(item.unit_price || 0)).toFixed(2))
          }
        : item
    ));
  };

  const updateItemPrice = (productId: string, unitPrice: number) => {
    setItems(items.map(item =>
      item.product_id === productId
        ? {
            ...item,
            unit_price: unitPrice,
            total: Number((Number(item.quantity || 0) * unitPrice).toFixed(2))
          }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = Number(item.total) || 0;
    return sum + itemTotal;
  }, 0);
  const tax = subtotal * (taxRate ?? 0.16); // fallback a 16% si no está disponible
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto a la venta');
      return;
    }

    setLoading(true);

    try {


      const saleData = {
        ...formData,
        user_id: user?.id || '',
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };


      const url = editingSale ? `/api/sales/${editingSale.id}` : '/api/sales';
      const method = editingSale ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      console.log(response);

      if (response.ok) {
        toast.success(editingSale ? 'Venta actualizada exitosamente' : 'Venta registrada exitosamente');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <select
          id="customer"
          className="w-full p-2 border rounded-md"
          value={formData.customer_id}
          onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
        >
          <option value="">Cliente General</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.email && `(${customer.email})`}
            </option>
          ))}
        </select>
      </div>

      {/* Product Search and Selection */}
      <div>
        <Label>Buscar y Agregar Productos</Label>
        <div className="relative">
          <Input
            placeholder="Buscar productos por nombre o SKU..."
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setShowProductSearch(e.target.value.length > 0);
            }}
            onFocus={() => setShowProductSearch(productSearch.length > 0)}
          />
          {showProductSearch && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => addProductToSale(product)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      <div className="text-sm text-gray-500">Stock: {product.stock_quantity} {product.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${Number(product.sale_price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Products */}
      {items.length > 0 && (
        <div>
          <Label>Productos Seleccionados</Label>
          <div className="mt-2 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => updateItemQuantity(item.product_id, Number(e.target.value || 1))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={Number(item.unit_price || 0).toFixed(2)}
                        onChange={(e) => updateItemPrice(item.product_id, Number(e.target.value || 0))}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>${Number(item.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos ({taxRate === null ? 'Cargando...' : (taxRate * 100) + '%' }):</span>
              <span>{taxRate === null ? 'Cargando...' : `$${tax.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment and Additional Info */}
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

      <div className="flex flex-col">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales sobre la venta"
        />
      </div>
      </div>


      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || items.length === 0}>
          {loading ? 'Procesando...' : (editingSale ? 'Actualizar Venta' : 'Registrar Venta')}
        </Button>
      </div>
    </form>
  );
}
