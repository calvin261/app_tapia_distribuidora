"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  CogIcon,
  BuildingStorefrontIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    tax_id: '',
    logo: ''
  });

  const [notifications, setNotifications] = useState({
    lowStock: false,
    newOrders: false,
    paymentDue: false,
    emailNotifications: false
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: '',
    taxRate: 0,
    lowStockThreshold: 0,
    autoBackup: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.company) setCompanySettings(data.company);
          if (data.notifications) setNotifications(data.notifications);
          if (data.system) setSystemSettings(data.system);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSaveCompany = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company: companySettings }),
      });

      if (response.ok) {
        toast.success('Configuración de empresa guardada');
      } else {
        toast.error('Error al guardar la configuración de empresa');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications }),
      });

      if (response.ok) {
        toast.success('Configuración de notificaciones guardada');
      } else {
        toast.error('Error al guardar la configuración de notificaciones');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleSaveSystem = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ system: systemSettings }),
      });

      if (response.ok) {
        toast.success('Configuración del sistema guardada');
      } else {
        toast.error('Error al guardar la configuración del sistema');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  if (loading) {
    return <PageLayout title="Configuración" description="Administra la configuración del sistema y de tu empresa"><div className="p-8 text-center">Cargando configuración...</div></PageLayout>;
  }

  return (
    <PageLayout title="Configuración" description="Administra la configuración del sistema y de tu empresa">
      <div className="space-y-6">
        {/* Configuración de la Empresa */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="h-5 w-5" />
              <CardTitle>Información de la Empresa</CardTitle>
            </div>
            <CardDescription>
              Configura los datos básicos de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input
                  id="company-name"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  id="company-phone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="company-tax-id">RFC/Tax ID</Label>
                <Input
                  id="company-tax-id"
                  value={companySettings.tax_id}
                  onChange={(e) => setCompanySettings({...companySettings, tax_id: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company-address">Dirección</Label>
              <Textarea
                id="company-address"
                value={companySettings.address}
                onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                placeholder="Dirección completa de la empresa"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveCompany}>
                Guardar Información de Empresa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CogIcon className="h-5 w-5" />
              <CardTitle>Configuración del Sistema</CardTitle>
            </div>
            <CardDescription>
              Ajusta los parámetros generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  className="w-full p-2 border rounded-md"
                  value={systemSettings.currency}
                  onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                >
                  <option value="USD">Dólar (USD)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={systemSettings.taxRate}
                  onChange={(e) => setSystemSettings({...systemSettings, taxRate: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="low-stock">Umbral de Stock Bajo</Label>
                <Input
                  id="low-stock"
                  type="number"
                  value={systemSettings.lowStockThreshold}
                  onChange={(e) => setSystemSettings({...systemSettings, lowStockThreshold: Number(e.target.value)})}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="auto-backup"
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                />
                <Label htmlFor="auto-backup">Respaldo Automático</Label>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSystem}>
                Guardar Configuración del Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
            <CardDescription>
              Configura qué notificaciones quieres recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="low-stock-notifications">Stock Bajo</Label>
                  <p className="text-sm text-gray-500">Recibir alertas cuando el inventario esté bajo</p>
                </div>
                <Switch
                  id="low-stock-notifications"
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-orders-notifications">Nuevas Órdenes</Label>
                  <p className="text-sm text-gray-500">Notificaciones de nuevas órdenes de compra</p>
                </div>
                <Switch
                  id="new-orders-notifications"
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) => setNotifications({...notifications, newOrders: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payment-due-notifications">Pagos Vencidos</Label>
                  <p className="text-sm text-gray-500">Alertas de pagos próximos a vencer</p>
                </div>
                <Switch
                  id="payment-due-notifications"
                  checked={notifications.paymentDue}
                  onCheckedChange={(checked) => setNotifications({...notifications, paymentDue: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-gray-500">Enviar notificaciones al correo electrónico</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>
                Guardar Configuración de Notificaciones
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <CardTitle>Información del Sistema</CardTitle>
            </div>
            <CardDescription>
              Detalles técnicos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Versión del Sistema</Label>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
              <div>
                <Label>Último Respaldo</Label>
                <p className="text-sm text-gray-600">Hoy, 10:30 AM</p>
              </div>
              <div>
                <Label>Base de Datos</Label>
                <p className="text-sm text-gray-600">PostgreSQL</p>
              </div>
              <div>
                <Label>Usuarios Activos</Label>
                <p className="text-sm text-gray-600">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
