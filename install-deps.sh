#!/bin/bash

echo "🚀 Instalando dependencias para el Cotizador GUX..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado. Por favor instala Node.js 16+ primero."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Limpiar instalación previa si existe
echo "🧹 Limpiando instalación previa..."
rm -rf node_modules package-lock.json

# Instalar dependencias principales
echo "📦 Instalando dependencias principales..."
npm install

# Instalar tipos adicionales
echo "📦 Instalando tipos adicionales..."
npm install --save-dev @types/file-saver

# Instalar dependencias para edición de PDF
echo "📄 Instalando dependencias para edición de PDF..."
npm install pdf-lib pdfjs-dist

# Verificar que todas las dependencias estén instaladas
echo "🔍 Verificando dependencias críticas..."
npm list jspdf html2canvas xlsx file-saver pdf-lib pdfjs-dist

# Verificar tipos
echo "🔍 Verificando tipos..."
npm list @types/file-saver @types/react @types/react-dom

echo ""
echo "✅ Instalación completada exitosamente!"
echo ""
echo "📋 Para iniciar la aplicación:"
echo "   npm run dev"
echo ""
echo "🧪 Para probar las funcionalidades:"
echo "   1. Abre la aplicación en el navegador"
echo "   2. Usa 'Ejemplo para PDF' para cargar datos de prueba"
echo "   3. Prueba la generación de PDF con 'Descargar PDF'"
echo "   4. Prueba la edición de PDF con 'Cargar PDF para Editar'"
echo "   5. Sube archivos de licitación para generar propuestas automáticamente"
echo ""
echo "🔧 Si hay problemas:"
echo "   - Revisa la consola del navegador (F12)"
echo "   - Verifica que no haya bloqueadores de popups"
echo "   - Intenta con un navegador diferente"
echo "" 