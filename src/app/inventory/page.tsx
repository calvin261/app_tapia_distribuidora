"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, CubeIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

interface Product {
  id: string;
  name: string;
  sku: string;
  category_name?: string;
  supplier_name?: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock_level: number;
  status: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const response = await fetch(`/api/products?limit=${PAGE_SIZE}&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotal(data.total || 0);
      } else {
        toast.error('Error al cargar los productos');
        setProducts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsNewProductOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Producto eliminado exitosamente');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const lowStockProducts = Array.isArray(products) ? products.filter(product =>
    product.stock_quantity <= product.min_stock_level
  ) : [];

  const getStockStatusBadge = (product: Product) => {
    if (product.stock_quantity <= product.min_stock_level) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    } else if (product.stock_quantity <= product.min_stock_level * 1.5) {
      return <Badge variant="outline">Stock Medio</Badge>;
    } else {
      return <Badge variant="default">Stock Bueno</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Gestión de Inventario" description="Controla el stock y administra tus productos">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Dialog open={isNewProductOpen} onOpenChange={(open) => {
            setIsNewProductOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Modifica la información del producto' : 'Registra un nuevo producto en el inventario'}
              </DialogDescription>
            </DialogHeader>
            <NewProductForm
              editingProduct={editingProduct}
              onSuccess={() => {
                setIsNewProductOpen(false);
                fetchProducts();
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
                <CubeIcon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Productos</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Stock Bajo</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{lowStockProducts.length}</dd>
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
                  <dt className="text-sm font-medium text-slate-500 truncate">Valor Total</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    ${products.reduce((sum, product) =>
                      sum + (product.stock_quantity * product.cost_price), 0
                    ).toFixed(2)}
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
                  <dt className="text-sm font-medium text-slate-500 truncate">Productos Activos</dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {products.filter(product => product.status === 'active').length}
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
              <Label htmlFor="search">Buscar productos</Label>
              <Input
                id="search"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Alerta de Stock Bajo
            </CardTitle>
            <CardDescription className="text-amber-700">
              Los siguientes productos necesitan reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">
                    {product.stock_quantity} / {product.min_stock_level} min
                  </Badge>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <p className="text-sm text-amber-600">
                  Y {lowStockProducts.length - 3} productos más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            Lista completa de productos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <CubeIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No hay productos</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'No se encontraron productos con ese criterio.' : 'Comienza agregando tu primer producto.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setIsNewProductOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>

                  <TableHead>Stock</TableHead>
                  <TableHead>Precio Costo</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Estado Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>

                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>${Number(product.cost_price).toFixed(2)}</TableCell>
                    <TableCell>${Number(product.sale_price).toFixed(2)}</TableCell>
                    <TableCell>{getStockStatusBadge(product)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
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

          {/* Pagination Controls */}
          {total > PAGE_SIZE && (
            <div className="flex justify-center items-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span>Página {page} de {Math.ceil(total / PAGE_SIZE)}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PageLayout>
  );
}

function NewProductForm({
  editingProduct,
  onSuccess
}: {
  editingProduct?: Product | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    cost_price: '',
    sale_price: '',
    stock_quantity: '',
    min_stock_level: '',
    unit: 'unit'
  });
  const [formLoading, setFormLoading] = useState(false);

  // Initialize form with editing product data
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku: editingProduct.sku,
        description: '', // Add description to Product interface if needed
        cost_price: editingProduct.cost_price.toString(),
        sale_price: editingProduct.sale_price.toString(),
        stock_quantity: editingProduct.stock_quantity.toString(),
        min_stock_level: editingProduct.min_stock_level.toString(),
        unit: 'unit' // Add unit to Product interface if needed
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        cost_price: '',
        sale_price: '',
        stock_quantity: '',
        min_stock_level: '',
        unit: 'unit'
      });
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cost_price: Number(formData.cost_price),
          sale_price: Number(formData.sale_price),
          stock_quantity: Number(formData.stock_quantity),
          min_stock_level: Number(formData.min_stock_level)
        })
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || `Error al ${editingProduct ? 'actualizar' : 'agregar'} el producto`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Error al ${editingProduct ? 'actualizar' : 'agregar'} el producto`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre del producto"
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Código único del producto"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripción del producto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost_price">Precio de Costo *</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            value={formData.cost_price}
            onChange={(e) => handleChange('cost_price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="sale_price">Precio de Venta *</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={(e) => handleChange('sale_price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock_quantity">Cantidad Inicial</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => handleChange('stock_quantity', e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="min_stock_level">Stock Mínimo</Label>
          <Input
            id="min_stock_level"
            type="number"
            value={formData.min_stock_level}
            onChange={(e) => handleChange('min_stock_level', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="unit">Unidad de Medida</Label>
        <select
          id="unit"
          className="w-full p-2 border rounded-md"
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
        >
          <option value="unit">Unidad</option>
          <option value="kg">Kilogramo</option>
          <option value="g">Gramo</option>
          <option value="l">Litro</option>
          <option value="ml">Mililitro</option>
          <option value="m">Metro</option>
          <option value="cm">Centímetro</option>
          <option value="pack">Paquete</option>
          <option value="box">Caja</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={formLoading}>
          {formLoading ? 'Guardando...' : (editingProduct ? 'Actualizar Producto' : 'Agregar Producto')}
        </Button>
      </div>
    </form>
  );
}
