"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  tips?: string[];
}

const helpContent: Record<string, HelpContent> = {
  '/': {
    title: 'Dashboard Principal',
    description: 'Tu centro de control con las métricas más importantes del negocio.',
    steps: [
      'Revisa las métricas clave en las tarjetas superiores',
      'Analiza los gráficos de ventas y tendencias',
      'Verifica las alertas de stock bajo',
      'Usa los accesos rápidos para funciones frecuentes'
    ],
    tips: [
      'El dashboard se actualiza automáticamente cada 5 minutos',
      'Haz clic en cualquier métrica para ver más detalles',
      'Usa Ctrl+K para abrir la búsqueda universal'
    ]
  },
  '/customers': {
    title: 'Gestión de Clientes',
    description: 'Administra tu base de datos de clientes de manera eficiente.',
    steps: [
      'Haz clic en "Nuevo Cliente" para agregar un cliente',
      'Usa la barra de búsqueda para encontrar clientes específicos',
      'Revisa las estadísticas de clientes en las tarjetas superiores',
      'Haz clic en "Editar" para modificar información del cliente'
    ],
    tips: [
      'Mantén actualizada la información de contacto',
      'Usa las etiquetas para categorizar clientes',
      'Revisa el historial de compras regularmente'
    ]
  },
  '/suppliers': {
    title: 'Gestión de Proveedores',
    description: 'Controla tus proveedores y relaciones comerciales.',
    steps: [
      'Agrega nuevos proveedores con toda su información',
      'Mantén actualizada la información de contacto',
      'Revisa el historial de órdenes de compra',
      'Evalúa el rendimiento de cada proveedor'
    ],
    tips: [
      'Incluye múltiples formas de contacto',
      'Documenta términos de pago y condiciones',
      'Mantén respaldos de contratos importantes'
    ]
  },
  '/inventory': {
    title: 'Control de Inventario',
    description: 'Gestiona tu stock y productos de manera inteligente.',
    steps: [
      'Agrega productos con información completa (SKU, precios, stock)',
      'Configura niveles mínimos de stock para alertas automáticas',
      'Usa las categorías para organizar productos',
      'Revisa regularmente los productos con stock bajo'
    ],
    tips: [
      'Mantén los códigos SKU únicos y descriptivos',
      'Actualiza precios según cambios del mercado',
      'Configura alertas antes de quedarte sin stock'
    ]
  },
  '/sales': {
    title: 'Gestión de Ventas',
    description: 'Registra y administra todas las ventas de tu negocio.',
    steps: [
      'Haz clic en "Nueva Venta" para registrar una venta',
      'Selecciona o agrega productos a la venta',
      'Elige el método de pago apropiado',
      'Confirma los totales antes de procesar'
    ],
    tips: [
      'Verifica siempre el stock antes de vender',
      'Usa la facturación rápida para ventas simples',
      'Mantén registro de todas las transacciones'
    ]
  },
  '/purchases': {
    title: 'Órdenes de Compra',
    description: 'Gestiona pedidos a proveedores y reposición de inventario.',
    steps: [
      'Crea una nueva orden seleccionando un proveedor',
      'Agrega productos y cantidades necesarias',
      'Establece fecha de entrega esperada',
      'Confirma los totales y términos de pago'
    ],
    tips: [
      'Planifica compras basándote en alertas de stock',
      'Negocia mejores precios por volumen',
      'Mantén seguimiento de entregas pendientes'
    ]
  },
  '/invoicing': {
    title: 'Facturación Rápida',
    description: 'Procesa ventas en un solo paso de manera eficiente.',
    steps: [
      'Usa la búsqueda de productos para agregar items',
      'Ajusta cantidades y precios si es necesario',
      'Selecciona el método de pago',
      'Procesa la venta y genera la factura'
    ],
    tips: [
      'Este método es ideal para ventas rápidas en mostrador',
      'Verifica siempre la disponibilidad de stock',
      'Puedes agregar descuentos por producto si es necesario'
    ]
  },
  '/reports': {
    title: 'Reportes y Análisis',
    description: 'Analiza el rendimiento de tu negocio con reportes detallados.',
    steps: [
      'Selecciona el tipo de reporte que necesitas',
      'Ajusta el rango de fechas para el análisis',
      'Revisa los gráficos y métricas mostradas',
      'Exporta los datos si necesitas análisis externos'
    ],
    tips: [
      'Revisa reportes semanalmente para identificar tendencias',
      'Compara períodos para evaluar crecimiento',
      'Usa los insights para tomar decisiones de negocio'
    ]
  },
  '/alerts': {
    title: 'Sistema de Alertas',
    description: 'Configura notificaciones para eventos importantes del negocio.',
    steps: [
      'Revisa las alertas activas en el panel principal',
      'Configura nuevas alertas según tus necesidades',
      'Ajusta umbrales para stock bajo y otros eventos',
      'Establece frecuencia de notificaciones'
    ],
    tips: [
      'Configura alertas antes de que ocurran problemas',
      'No configures demasiadas alertas para evitar spam',
      'Revisa y ajusta configuraciones regularmente'
    ]
  },
  '/chatbot': {
    title: 'Chatbot IA',
    description: 'Tu asistente virtual para consultas rápidas y análisis.',
    steps: [
      'Escribe tu pregunta en lenguaje natural',
      'El chatbot accederá a tus datos para responder',
      'Haz preguntas de seguimiento si necesitas más información',
      'Configura tu API key si planeas usar funciones avanzadas'
    ],
    tips: [
      'Puedes preguntar sobre ventas, inventario, clientes, etc.',
      'Sé específico en tus preguntas para mejores respuestas',
      'El chatbot aprende de tus interacciones'
    ]
  },
  '/tutorial': {
    title: 'Tutorial Interactivo',
    description: 'Aprende a usar todas las funcionalidades paso a paso.',
    steps: [
      'Sigue el tutorial paso a paso para aprender el sistema',
      'Marca pasos como completados cuando los hayas dominado',
      'Practica en las secciones reales del sistema',
      'Reinicia el tutorial si necesitas repasar conceptos'
    ],
    tips: [
      'No te saltes pasos importantes del tutorial',
      'Practica cada funcionalidad en tiempo real',
      'Vuelve al tutorial cuando agregues nuevas funciones'
    ]
  }
};

interface ContextualHelpProps {
  className?: string;
}

export function ContextualHelp({ className = '' }: ContextualHelpProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(true);

  const currentHelp = helpContent[pathname];

  useEffect(() => {
    // Show help automatically for new users
    const hasSeenHelp = localStorage.getItem(`help_seen_${pathname}`);
    if (!hasSeenHelp && currentHelp) {
      setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Show after 2 seconds
    }
  }, [pathname, currentHelp]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`help_seen_${pathname}`, 'true');
  };

  const dismissHelp = () => {
    setShowHelpButton(false);
    localStorage.setItem('contextual_help_dismissed', 'true');
  };

  useEffect(() => {
    const isDismissed = localStorage.getItem('contextual_help_dismissed');
    if (isDismissed === 'true') {
      setShowHelpButton(false);
    }
  }, []);

  if (!currentHelp || !showHelpButton) {
    return null;
  }

  return (
    <>
      {/* Floating help button */}
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            <QuestionMarkCircleIcon className="h-6 w-6 text-white" />
          </Button>

          {/* Dismiss button */}
          <button
            onClick={dismissHelp}
            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-500 hover:bg-slate-600 rounded-full flex items-center justify-center"
            title="Ocultar ayuda"
          >
            <XMarkIcon className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>

      {/* Help modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
              {currentHelp.title}
            </DialogTitle>
            <DialogDescription>
              {currentHelp.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Steps */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Cómo usar esta página:</h4>
              <ol className="space-y-2">
                {currentHelp.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {currentHelp.tips && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Consejos útiles:</h4>
                <ul className="space-y-2">
                  {currentHelp.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mr-3 mt-2"></span>
                      <span className="text-slate-600 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Entendido, no mostrar de nuevo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook para mostrar ayuda programáticamente
export function useContextualHelp() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const showHelp = () => setIsHelpOpen(true);
  const hideHelp = () => setIsHelpOpen(false);

  return {
    isHelpOpen,
    showHelp,
    hideHelp
  };
}
