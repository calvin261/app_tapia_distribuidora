"use client";

import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Readonly<HeaderProps>) {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-slate-700 lg:hidden" onClick={onMenuClick}>
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">

        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white">
                  3
                </Badge>
                <span className="sr-only">Ver notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <h3 className="text-sm font-medium text-slate-900">Notificaciones</h3>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Stock bajo</p>
                  <p className="text-sm text-slate-500">Producto ABC tiene solo 5 unidades</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Pago vencido</p>
                  <p className="text-sm text-slate-500">Cliente XYZ tiene facturas vencidas</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Nueva orden</p>
                  <p className="text-sm text-slate-500">Orden de compra #1234 recibida</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
                <span className="hidden md:block text-sm text-slate-700">
                  {user?.name ?? 'Usuario'}
                </span>
                <span className="sr-only">Abrir menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {(() => {
                    if (user?.role === 'admin') return 'Administrador';
                    if (user?.role === 'manager') return 'Gerente';
                    return 'Empleado';
                  })()}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Tu perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
