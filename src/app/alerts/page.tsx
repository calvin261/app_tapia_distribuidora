"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PageLayout } from '@/components/layout/PageLayout';

interface Alert {
  id: string;
  type: 'low_stock' | 'high_stock' | 'overdue_payment' | 'system' | 'custom';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

interface AlertConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  threshold?: number;
  email_enabled: boolean;
  push_enabled: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');

  // Fetch de alertas y configuraciones reales
  useEffect(() => {
    async function fetchAlertsAndConfigs() {
      try {
        // Fetch alertas
        const alertsRes = await fetch('/api/alerts');
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(Array.isArray(data) ? data : data.alerts ?? []);
        }
        // Fetch configuraciones
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          // Adaptar a la estructura esperada por la UI
          if (data.notifications && Array.isArray(data.notifications)) {
            setConfigs(data.notifications);
          } else if (data.notifications) {
            // Si es objeto plano, adaptarlo a array
            setConfigs([
              {
                id: 'low_stock',
                type: 'low_stock',
                name: 'Stock bajo',
                enabled: !!data.notifications.lowStock,
                threshold: data.system?.lowStockThreshold ?? 10,
                email_enabled: !!data.notifications.emailNotifications,
                push_enabled: true // Asumimos true por defecto
              },
              {
                id: 'overdue_payment',
                type: 'overdue_payment',
                name: 'Pagos vencidos',
                enabled: !!data.notifications.paymentDue,
                email_enabled: !!data.notifications.emailNotifications,
                push_enabled: true
              },
              {
                id: 'new_orders',
                type: 'new_orders',
                name: 'Nuevas órdenes',
                enabled: !!data.notifications.newOrders,
                email_enabled: !!data.notifications.emailNotifications,
                push_enabled: true
              }
            ]);
          }
        }
      } catch {
        toast.error('Error al cargar alertas o configuraciones');
      }
    }
    fetchAlertsAndConfigs();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'success': return <CheckCircleIcon className="h-5 w-5" />;
      default: return <BellIcon className="h-5 w-5" />;
    }
  };

  // Marcar alerta como leída usando la API
  const handleMarkAsRead = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/read`, { method: 'PUT' });
      if (res.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
        toast.success('Alerta marcada como leída');
      } else {
        toast.error('No se pudo marcar la alerta como leída');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  // Eliminar alerta usando la API
  const handleDeleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
        toast.success('Alerta eliminada');
      } else {
        toast.error('No se pudo eliminar la alerta');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  // Actualizar configuración usando la API
  const handleConfigUpdate = async (configId: string, updates: Partial<AlertConfig>) => {
    try {
      setConfigs(configs.map(config =>
        config.id === configId ? { ...config, ...updates } : config
      ));
      // Enviar cambios a la API de settings
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: configs }),
      });
      toast.success('Configuración actualizada');
    } catch {
      toast.error('Error al actualizar configuración');
    }
  };

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <PageLayout title="Sistema de Alertas" description="Configuración y gestión de alertas del sistema">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">

        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('alerts')}
          >
            <BellIcon className="h-4 w-4 mr-2" />
            Alertas
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Activas</CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `Tienes ${unreadCount} alertas sin leer`
                  : 'No tienes alertas pendientes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay alertas disponibles
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)} ${
                        alert.is_read ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <h3 className="font-medium">{alert.title}</h3>
                            <p className="text-sm mt-1">{alert.message}</p>
                            <p className="text-xs mt-2 opacity-75">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!alert.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              Marcar como leída
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Alertas</CardTitle>
              <CardDescription>
                Personaliza qué alertas recibir y cómo recibirlas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {configs.map((config) => (
                  <div key={config.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{config.name}</h3>
                        <p className="text-sm text-slate-500">
                          {config.type === 'low_stock' && 'Notifica cuando el stock esté por debajo del umbral'}
                          {config.type === 'high_stock' && 'Notifica cuando hay exceso de stock'}
                          {config.type === 'overdue_payment' && 'Notifica sobre pagos vencidos'}
                        </p>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) =>
                          handleConfigUpdate(config.id, { enabled })
                        }
                      />
                    </div>

                    {config.enabled && (
                      <div className="ml-6 space-y-4 p-4 bg-slate-50 rounded-lg">
                        {config.threshold !== undefined && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`threshold-${config.id}`} className="text-right">
                              Umbral:
                            </Label>
                            <Input
                              id={`threshold-${config.id}`}
                              type="number"
                              value={config.threshold}
                              onChange={(e) =>
                                handleConfigUpdate(config.id, {
                                  threshold: parseInt(e.target.value) || 0
                                })
                              }
                              className="col-span-2"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.email_enabled}
                              onCheckedChange={(email_enabled) =>
                                handleConfigUpdate(config.id, { email_enabled })
                              }
                            />
                            <Label>Notificación por email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={config.push_enabled}
                              onCheckedChange={(push_enabled) =>
                                handleConfigUpdate(config.id, { push_enabled })
                              }
                            />
                            <Label>Notificación push</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Global</CardTitle>
              <CardDescription>
                Configuraciones generales para todas las alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sonido de notificación</h3>
                    <p className="text-sm text-slate-500">Reproducir sonido al recibir alertas</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas en horario laboral</h3>
                    <p className="text-sm text-slate-500">Solo recibir alertas durante horario de trabajo</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-frequency" className="text-right">
                    Frecuencia de email:
                  </Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger className="col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Inmediato</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </PageLayout>
  );
}