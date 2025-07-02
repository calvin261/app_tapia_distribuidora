"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlayIcon, 
  CheckIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  action?: string;
  link?: string;
  completed: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Bienvenido a Tapia Distribuidora",
    description: "Conoce los conceptos básicos del sistema",
    content: "Este sistema te ayudará a gestionar ventas, inventario, clientes y proveedores de manera eficiente. Comenzaremos con un recorrido por las características principales.",
    completed: false
  },
  {
    id: 2,
    title: "Explorando el Dashboard",
    description: "Tu centro de control principal",
    content: "El Dashboard te muestra las métricas más importantes de tu negocio: ventas del día, productos con stock bajo, clientes nuevos y más. Aquí puedes acceder rápidamente a las funciones más usadas.",
    link: "/",
    action: "Ir al Dashboard",
    completed: false
  },
  {
    id: 3,
    title: "Gestión de Clientes",
    description: "Administra tu base de datos de clientes",
    content: "Agrega, edita y gestiona información de tus clientes. Puedes llevar un registro de contactos, historial de compras y generar reportes personalizados.",
    link: "/customers",
    action: "Ver Clientes",
    completed: false
  },
  {
    id: 4,
    title: "Gestión de Proveedores",
    description: "Controla tus proveedores y órdenes de compra",
    content: "Mantén un registro de tus proveedores, gestiona órdenes de compra y controla las entregas de mercancía para mantener tu inventario actualizado.",
    link: "/suppliers",
    action: "Ver Proveedores",
    completed: false
  },
  {
    id: 5,
    title: "Control de Inventario",
    description: "Administra tu stock y productos",
    content: "Agrega productos, controla stock, configura alertas de reposición y gestiona categorías. El sistema te alertará cuando los productos estén por agotarse.",
    link: "/inventory",
    action: "Ver Inventario",
    completed: false
  },
  {
    id: 6,
    title: "Órdenes de Compra",
    description: "Gestiona pedidos a proveedores",
    content: "Crea órdenes de compra, realiza seguimiento de entregas y actualiza automáticamente tu inventario cuando recibas la mercancía.",
    link: "/purchases",
    action: "Ver Órdenes",
    completed: false
  },
  {
    id: 7,
    title: "Reportes y Análisis",
    description: "Analiza el rendimiento de tu negocio",
    content: "Genera reportes detallados de ventas, inventario, clientes y análisis financiero. Usa los gráficos interactivos para tomar decisiones informadas.",
    link: "/reports",
    action: "Ver Reportes",
    completed: false
  },
  {
    id: 9,
    title: "Sistema de Alertas",
    description: "Mantente informado de eventos importantes",
    content: "Configura alertas personalizadas para stock bajo, ventas importantes, pagos pendientes y más. El sistema te mantendrá informado automáticamente.",
    link: "/alerts",
    action: "Configurar Alertas",
    completed: false
  },
  {
    id: 10,
    title: "Chatbot IA",
    description: "Tu asistente virtual inteligente",
    content: "Usa el chatbot IA para hacer consultas rápidas sobre ventas, inventario, clientes y más. Responde en lenguaje natural y accede a los datos de tu negocio.",
    link: "/chatbot",
    action: "Probar Chatbot",
    completed: false
  }
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>(tutorialSteps);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem('tutorial_completed');
    if (completed === 'true') {
      setTutorialCompleted(true);
      setSteps(prevSteps => prevSteps.map(step => ({ ...step, completed: true })));
    }
  }, []);

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const markStepCompleted = (stepId: number) => {
    const newSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    setSteps(newSteps);
    
    // Check if all steps are completed
    const allCompleted = newSteps.every(step => step.completed);
    if (allCompleted) {
      setTutorialCompleted(true);
      localStorage.setItem('tutorial_completed', 'true');
      toast.success('¡Felicitaciones! Has completado el tutorial');
    }
  };

  const resetTutorial = () => {
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    setSteps(resetSteps);
    setTutorialCompleted(false);
    setCurrentStep(0);
    localStorage.removeItem('tutorial_completed');
    toast.success('Tutorial reiniciado');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startInteractiveTutorial = () => {
    setCurrentStep(0);
    setShowTutorial(true);
  };

  return (
    <PageLayout title="Tutorial Interactivo" description="Guía paso a paso del sistema">
      <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        
        <div className="flex space-x-2">
          <Button onClick={startInteractiveTutorial} className="bg-blue-600 hover:bg-blue-700">
            <PlayIcon className="h-4 w-4 mr-2" />
            Iniciar Tutorial
          </Button>
          {tutorialCompleted && (
            <Button variant="outline" onClick={resetTutorial}>
              Reiniciar Tutorial
            </Button>
          )}
        </div>
      </div>

      {/* Progress overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
            Progreso del Tutorial
          </CardTitle>
          <CardDescription>
            {tutorialCompleted 
              ? "¡Has completado todo el tutorial! 🎉" 
              : `Has completado ${completedSteps} de ${steps.length} pasos`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {tutorialCompleted && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  ¡Tutorial completado! Ya dominas el sistema de Tapia Distribuidora.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tutorial steps grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <Card 
            key={step.id} 
            className={`cursor-pointer transition-all duration-200 ${
              step.completed 
                ? 'ring-2 ring-green-500 bg-green-50 hover:bg-green-100' 
                : 'hover:shadow-md hover:scale-105'
            }`}
            onClick={() => {
              setCurrentStep(step.id - 1);
              setShowTutorial(true);
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.completed ? <CheckIcon className="h-4 w-4" /> : step.id}
                  </span>
                  {step.title}
                </CardTitle>
                {step.completed && (
                  <Badge variant="default" className="bg-green-500">
                    Completado
                  </Badge>
                )}
              </div>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{step.content}</p>
              {step.link && (
                <Link href={step.link}>
                  <Button variant="outline" size="sm" className="w-full">
                    {step.action}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick help section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LightBulbIcon className="h-6 w-6 mr-2 text-amber-500" />
            Consejos Rápidos
          </CardTitle>
          <CardDescription>
            Algunos consejos para aprovechar al máximo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Busca en cualquier lugar</h4>
                <p className="text-sm text-slate-600">Usa Ctrl+K para abrir la búsqueda universal y encontrar cualquier cosa rápidamente.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Configura alertas</h4>
                <p className="text-sm text-slate-600">Mantente informado de stock bajo, pagos pendientes y eventos importantes.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Usa el chatbot IA</h4>
                <p className="text-sm text-slate-600">Pregunta al chatbot sobre ventas, inventario o cualquier duda que tengas.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-bold">4</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Revisa reportes regularmente</h4>
                <p className="text-sm text-slate-600">Los reportes te ayudan a entender tendencias y tomar mejores decisiones.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive tutorial modal */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" />
              {steps[currentStep]?.title}
            </DialogTitle>
            <DialogDescription>
              Paso {currentStep + 1} de {steps.length}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
            
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed">
                {steps[currentStep]?.content}
              </p>
            </div>
            
            {steps[currentStep]?.link && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  ¿Listo para explorar esta funcionalidad?
                </p>
                <Link href={steps[currentStep].link ?? '#'}>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      markStepCompleted(steps[currentStep].id);
                      setShowTutorial(false);
                    }}
                  >
                    {steps[currentStep].action}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => markStepCompleted(steps[currentStep].id)}
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Marcar como Completado
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                >
                  Siguiente
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PageLayout>
  );
}