#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración de páginas para migrar
const pagesToMigrate = [
  {
    path: 'src/app/purchases/page.tsx',
    title: 'Órdenes de Compra',
    description: 'Gestiona las órdenes de compra a proveedores'
  },
  {
    path: 'src/app/invoicing/page.tsx',
    title: 'Facturación Rápida',
    description: 'Sistema de facturación en un solo paso'
  },
  {
    path: 'src/app/reports/page.tsx',
    title: 'Reportes y Análisis',
    description: 'Visualiza métricas y reportes del negocio'
  },
  {
    path: 'src/app/alerts/page.tsx',
    title: 'Sistema de Alertas',
    description: 'Configuración y gestión de alertas del sistema'
  },
  {
    path: 'src/app/chatbot/page.tsx',
    title: 'Asistente Virtual',
    description: 'Chatbot con IA para consultas del negocio'
  },
  {
    path: 'src/app/tutorial/page.tsx',
    title: 'Tutorial Interactivo',
    description: 'Guía paso a paso del sistema'
  }
];

function migratePageToLayout(filePath, title, description) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar si ya usa PageLayout
  if (content.includes('PageLayout')) {
    console.log(`✅ ${filePath} ya usa PageLayout`);
    return true;
  }

  // Agregar import de PageLayout
  const importRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*$/m;
  const lastImportMatch = content.match(/import\s+[^;]+;/g);
  
  if (lastImportMatch) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    content = content.replace(lastImport, lastImport + '\nimport { PageLayout } from \'@/components/layout/PageLayout\';');
  }

  // Buscar el return principal de la función (excluyendo loading states)
  const returnRegex = /return\s*\(\s*<div\s+className="space-y-6">/;
  const headerRegex = /<div[^>]*>\s*<h1[^>]*>([^<]+)<\/h1>\s*<p[^>]*>([^<]+)<\/p>\s*<\/div>/;
  
  // Encontrar y reemplazar el header existente
  content = content.replace(headerRegex, '');
  
  // Reemplazar el return principal
  content = content.replace(
    returnRegex,
    `return (\n    <PageLayout title="${title}" description="${description}">\n      <div className="space-y-6">`
  );

  // Buscar el cierre del div principal y agregar cierre de PageLayout
  const lastDivCloseRegex = /(\s*)<\/div>\s*\);\s*}?\s*$/;
  content = content.replace(
    lastDivCloseRegex,
    '$1</div>\n    </PageLayout>\n  );\n}'
  );

  // Guardar el archivo
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Migrado: ${filePath}`);
  return true;
}

console.log('🚀 Iniciando migración automática a PageLayout...\n');

let migratedCount = 0;
let totalCount = pagesToMigrate.length;

pagesToMigrate.forEach(({ path: filePath, title, description }) => {
  if (migratePageToLayout(filePath, title, description)) {
    migratedCount++;
  }
});

console.log(`\n📊 Resumen de migración:`);
console.log(`   ✅ Migradas: ${migratedCount}/${totalCount}`);
console.log(`   📝 Verificar manualmente si hay errores de sintaxis`);
console.log(`   🔧 Ejecutar: npm run lint para validar`);
