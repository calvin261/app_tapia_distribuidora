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
import { PlusIcon, CreditCardIcon, BanknotesIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  sale_price: number;
  stock_quantity: number;
}

interface InvoiceItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export default function InvoicingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/products')
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando sistema de facturación...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Facturación Rápida" description="Sistema de facturación en un solo paso">
      <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">

        <Dialog open={isQuickInvoiceOpen} onOpenChange={setIsQuickInvoiceOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Facturación Rápida
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Facturación Rápida</DialogTitle>
              <DialogDescription>
                Crea una factura y procesa la venta en un solo paso
              </DialogDescription>
            </DialogHeader>
            <QuickInvoiceForm
              customers={customers}
              products={products}
              onSuccess={() => {
                setIsQuickInvoiceOpen(false);
                toast.success('Factura creada y venta procesada exitosamente');
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick access templates */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsQuickInvoiceOpen(true)}>
          <CardContent className="p-6 text-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Venta con Tarjeta</h3>
            <p className="text-sm text-slate-500">Procesar pago con tarjeta de crédito o débito</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsQuickInvoiceOpen(true)}>
          <CardContent className="p-6 text-center">
            <BanknotesIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Venta en Efectivo</h3>
            <p className="text-sm text-slate-500">Procesar pago en efectivo</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plantillas</h3>
            <p className="text-sm text-slate-500">Usar plantillas de ventas frecuentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices summary */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
          <CardDescription>
            Últimas facturas generadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PrinterIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-500">Las facturas recientes aparecerán aquí</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsQuickInvoiceOpen(true)}>
              Crear Primera Factura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageLayout>
  );
}

function QuickInvoiceForm({
  customers,
  products,
  onSuccess
}: {
  customers: Customer[];
  products: Product[];
  onSuccess: () => void;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addProduct = (product: Product) => {
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      setItems(items.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      const newItem: InvoiceItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
        discount: 0,
        total: product.sale_price
      };
      setItems([...items, newItem]);
    }
    setSearchProduct('');
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      newItems[index].total = (newItems[index].quantity * newItems[index].unit_price) - newItems[index].discount;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.16; // 16% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        customer_id: selectedCustomer || null,
        user_id: '00000000-0000-0000-0000-000000000000', // This should come from auth
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount
        }))
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="invoice">Factura</TabsTrigger>
          <TabsTrigger value="payment">Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Productos</CardTitle>
              <CardDescription>Busca y agrega productos a la factura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchProduct">Buscar Producto</Label>
                  <Input
                    id="searchProduct"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>

                {searchProduct && (
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 text-left"
                        onClick={() => addProduct(product)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-slate-500">SKU: {product.sku} | Stock: {product.stock_quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.sale_price.toFixed(2)}</p>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                            {product.stock_quantity > 0 ? "Disponible" : "Sin Stock"}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Factura</CardTitle>
              <CardDescription>Revisa y ajusta los productos y cantidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Cliente (Opcional)</Label>
                  <select
                    id="customer"
                    className="w-full p-2 border rounded-md"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Cliente General</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item.product_id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                              className="w-20"
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>${item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No hay productos agregados</p>
                    <p className="text-sm text-slate-400">Ve a la pestaña &ldquo;Productos&rdquo; para agregar items</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen y Pago</CardTitle>
              <CardDescription>Confirma los totales y procesa el pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <select
                    id="paymentMethod"
                    className="w-full p-2 border rounded-md"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="credit">Crédito</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (16%):</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || items.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? 'Procesando...' : `Procesar Venta - $${getTotal().toFixed(2)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}