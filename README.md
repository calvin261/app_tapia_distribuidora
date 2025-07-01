# Tapia Distribuidora - Sistema de Gestión Empresarial

Sistema integral de gestión empresarial desarrollado con Next.js, TypeScript, TailwindCSS, Shadcn/UI y Neon Database.

## 🚀 Características Principales

### Funcionalidades de Negocio
- **Gestión de Ventas**: Sistema completo de registro y seguimiento de ventas
- **Control de Inventario**: Administración de productos y stock en tiempo real
- **Órdenes de Compra**: Gestión completa de pedidos a proveedores
- **Base de Datos de Clientes**: Gestión completa de información de clientes
- **Gestión de Proveedores**: Control de proveedores y relaciones comerciales
- **Chatbot IA**: Asistente virtual para consultas rápidas de la base de datos

### Características de UI/UX
- **Interfaz Minimalista**: Diseño limpio y profesional
- **Navegación Intuitiva**: Menús organizados y fáciles de usar
- **Panel de Control**: Dashboard con métricas clave y KPIs
- **Diseño Responsivo**: Optimizado para diferentes dispositivos
- **Tema Claro**: Interfaz clara y profesional
- **Tutorial Interactivo**: Guía paso a paso para nuevos usuarios
- **Ayuda Contextual**: Asistencia automática en cada página

### Características Técnicas
- **Búsqueda Universal**: Búsqueda rápida en toda la aplicación
- **Sistema de Alertas**: Notificaciones personalizables
- **Reportes Visuales**: Gráficos y estadísticas interactivas
- **Facturación Rápida**: Proceso de facturación en un solo paso
- **Plantillas Predefinidas**: Para operaciones frecuentes
- **Tests Unitarios**: Cobertura de pruebas para componentes
- **APIs REST**: Backend completo para todas las operaciones

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15.3.4 + React 19
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + Shadcn/UI
- **Base de Datos**: Neon Database (PostgreSQL)
- **Iconografía**: Heroicons + Lucide React
- **Gráficos**: Recharts
- **Testing**: Vitest + React Testing Library
- **Herramientas**: ESLint, PostCSS

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta en Neon Database

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd app_tapia_distruibuidora
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:
```env
# Database Configuration
DATABASE_URL=your_neon_database_connection_string

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# OpenAI Configuration (para chatbot)
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Inicializar la base de datos**
```bash
# Ejecutar el servidor de desarrollo
npm run dev

# En otra terminal, inicializar la base de datos
curl -X POST http://localhost:3000/api/init-db
```

5. **Ejecutar la aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **users**: Usuarios del sistema
- **customers**: Base de datos de clientes
- **suppliers**: Proveedores
- **categories**: Categorías de productos
- **products**: Inventario de productos
- **sales**: Registro de ventas
- **sale_items**: Detalles de productos vendidos
- **purchases**: Órdenes de compra
- **purchase_items**: Detalles de productos comprados
- **stock_movements**: Movimientos de inventario
- **alerts**: Sistema de alertas

## 🧪 Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con interfaz visual
npm run test:ui
```

### Cobertura de Tests
- Componentes de Dashboard
- Formularios de entrada de datos
- Utilidades y funciones helper
- APIs de backend

## 📱 Uso de la Aplicación

### Dashboard Principal
- Métricas clave del negocio
- Gráficos de ventas y productos
- Alertas de stock bajo
- Acceso rápido a funciones frecuentes

### Facturación Rápida
- Proceso de venta en un solo paso
- Búsqueda inteligente de productos
- Múltiples métodos de pago
- Cálculo automático de impuestos

### Gestión de Ventas
- Registro de nuevas ventas
- Historial de transacciones
- Estados de pago y seguimiento
- Facturación automatizada

### Control de Inventario
- Agregar/editar productos
- Monitoreo de stock
- Alertas de reposición
- Categorización de productos

### Órdenes de Compra
- Crear órdenes a proveedores
- Seguimiento de entregas
- Actualización automática de inventario
- Control de términos de pago

### Tutorial Interactivo
- Guía paso a paso del sistema
- Progreso trackeable
- Enlaces directos a funcionalidades
- Consejos y mejores prácticas

### Ayuda Contextual
- Asistencia automática por página
- Pasos detallados de uso
- Consejos específicos
- Botón de ayuda flotante

### Chatbot IA
- Consultas en lenguaje natural
- Información de ventas
- Estado del inventario
- Estadísticas de clientes y proveedores

## 🎯 Flujos de Trabajo Principales

### Proceso de Venta Rápida (máximo 2 clics)
1. Facturación Rápida → Buscar productos
2. Seleccionar método de pago → Procesar venta

### Proceso de Venta Completa (máximo 3 clics)
1. Dashboard → Nueva Venta
2. Seleccionar productos y cantidades
3. Procesar pago → Venta completada

### Gestión de Inventario
1. Inventario → Nuevo Producto
2. Completar información del producto
3. Guardar → Producto agregado al stock

### Órdenes de Compra
1. Órdenes de Compra → Nueva Orden
2. Seleccionar proveedor y productos
3. Confirmar → Orden enviada

### Consultas con IA
1. Chatbot → Escribir pregunta
2. Recibir respuesta en tiempo real
3. Continuar conversación si es necesario

### Tutorial para Nuevos Usuarios
1. Tutorial → Iniciar Tutorial Interactivo
2. Seguir pasos y marcar como completados
3. Practicar en las secciones reales

### Obtener Ayuda Contextual
1. Hacer clic en el botón de ayuda flotante (?)
2. Leer instrucciones específicas de la página
3. Seguir pasos recomendados

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar versión de producción

# Testing
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:ui      # Interfaz visual de tests

# Linting y formato
npm run lint         # Verificar código con ESLint
```

## 🚀 Despliegue

### Variables de Entorno para Producción
Asegúrate de configurar las siguientes variables en tu plataforma de despliegue:

- `DATABASE_URL`: Conexión a Neon Database
- `NEXTAUTH_SECRET`: Secreto para autenticación
- `OPENAI_API_KEY`: API key para el chatbot (opcional)

### Plataformas Recomendadas
- **Vercel**: Optimizado para Next.js
- **Netlify**: Soporte completo para aplicaciones React
- **Railway**: Fácil configuración de base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Tapia Distribuidora**
