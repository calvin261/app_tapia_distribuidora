"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function DashboardContent() {
  const router = useRouter();

  const actions = [
    {
      title: 'Agregar Producto',
      description: 'Añadir nuevos productos al inventario',
      icon: CubeIcon,
      action: () => router.push('/inventory'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nueva Venta',
      description: 'Registrar una nueva transacción',
      icon: ShoppingCartIcon,
      action: () => router.push('/sales'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Nuevo Cliente',
      description: 'Registrar un nuevo cliente',
      icon: UserGroupIcon,
      action: () => router.push('/customers'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Ver Reportes',
      description: 'Consultar reportes y estadísticas',
      icon: DocumentTextIcon,
      action: () => window.open('http://localhost:3000/public/dashboard/99055fcb-7a13-4b4b-9067-706bf773d249', '_blank'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:text-4xl sm:tracking-tight">
          Panel de Control
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Selecciona una opción para continuar
        </p>
      </div>

      {/* Action buttons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {actions.map((action) => (
          <Card key={action.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <action.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-6">
                {action.description}
              </p>
              <Button
                onClick={action.action}
                className="w-full py-3 text-lg font-medium"
                size="lg"
              >
                {action.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional info */}
      <div className="text-center text-slate-500 text-sm max-w-2xl mx-auto">
        <p>
          Distribuidora Tapia - Sistema de gestión empresarial.
          Utiliza los botones de arriba para acceder a las diferentes funcionalidades del sistema.
        </p>
      </div>
    </div>
  );
}
