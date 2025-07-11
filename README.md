# GUX Hackathon - Cotizador v0

Una herramienta interna para la estimación de proyectos y generación de propuestas comerciales.

## 🚀 Características

### 📊 Estimación de Proyecto
- Formulario completo para información del proyecto
- Gestión dinámica de roles y tarifas por hora
- Cálculo automático de costos totales
- **Algoritmo inteligente de recomendación** basado en proyectos históricos
- Resumen detallado de la estimación

### 📝 Generador de Propuestas
- 3 plantillas predefinidas (Básica, Detallada, Startup)
- Editor de texto enriquecido
- Reemplazo automático de placeholders
- Vista previa de propuestas
- **Generación real de PDF** con jsPDF y html2canvas

### 🚀 Propuestas para Startups
- **Cuestionario detallado** con 20+ preguntas organizadas por categorías
- **Algoritmo inteligente** de estimación basado en proyectos históricos
- **6 tipos de proyectos** predefinidos (MVP Web, MVP Mobile, E-commerce, SaaS, Marketplace, Social Network)
- **Estimación automática** de horas y costos por categoría
- **Propuesta profesional** con análisis técnico detallado
- **Exportación a Excel** con desglose completo de horas y respuestas
- **Generación de PDF** con formato profesional para startups

### 📋 Propuestas Anteriores
- Tabla con historial de propuestas
- Filtros por estado y búsqueda
- Estadísticas resumidas
- Acciones: ver, descargar, editar, eliminar

### 📈 Analytics de Proyectos
- Dashboard con métricas clave
- Análisis por tipo de cliente
- Análisis por complejidad de proyecto
- Estadísticas de éxito y rentabilidad

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool y dev server
- **Lucide React** - Iconos
- **React Hook Form** - Manejo de formularios
- **jsPDF** - Generación de PDFs
- **html2canvas** - Captura de pantalla para PDFs
- **XLSX** - Exportación a Excel
- **File-saver** - Descarga de archivos

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd COTIZADOR
   ```

2. **Instalación automática (recomendada)**
   ```bash
   ./install-deps.sh
   ```

3. **Instalación manual (alternativa)**
   ```bash
   npm install
   npm install --save-dev @types/file-saver
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### 🧪 Verificación de Funcionalidades

1. **Probar generación de archivos**
   - Ve a la pestaña "Test PDF/Excel"
   - Haz clic en "Test Ambos" para verificar PDF y Excel
   - Si los tests pasan, el generador principal funcionará

2. **Usar el generador principal**
   - Ve a "Propuestas Startups"
   - Completa el cuestionario
   - Genera PDF y Excel

## 🏗️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── StartupProposalGenerator.tsx  # Generador principal
│   ├── StartupQuestionnaire.tsx      # Cuestionario
│   ├── ProjectEstimation.tsx         # Estimación básica
│   ├── ProposalGenerator.tsx         # Generador general
│   ├── PreviousProposals.tsx         # Historial
│   ├── ProjectAnalytics.tsx          # Analytics
│   ├── TestPDF.tsx                   # Componente de prueba
│   └── Navbar.tsx                    # Barra de navegación
├── data/
│   └── startupQuestions.ts           # Preguntas y cálculos
├── types/
│   └── global.d.ts                   # Tipos globales
├── App.tsx                           # Componente principal
├── main.tsx                          # Punto de entrada
└── index.css                         # Estilos globales
```

## 🎨 Características de la UI

- **Diseño Responsivo** - Funciona en desktop, tablet y móvil
- **Navegación por Pestañas** - Interfaz limpia y organizada
- **Tema Moderno** - Colores profesionales y tipografía clara
- **Componentes Reutilizables** - Botones, inputs y cards consistentes
- **Estados Interactivos** - Hover, focus y loading states

## 🔧 Funcionalidades Principales

### Estimación de Proyecto
- Campos: Nombre, Tipo de Cliente, Servicios, Horas, Fechas
- Tabla editable de roles con tarifas y horas
- Cálculo automático de subtotales y totales
- Resumen con métricas clave

### Generador de Propuestas
- Selección de plantillas predefinidas
- Editor de texto con placeholders
- Auto-reemplazo de variables del proyecto
- Vista previa en ventana nueva
- Botones para guardar y generar PDF

### Historial de Propuestas
- Tabla con datos de ejemplo
- Filtros por estado y búsqueda por texto
- Estadísticas resumidas
- Acciones CRUD completas

## 🚧 Funcionalidades Futuras

- [ ] Integración con base de datos
- [ ] Autenticación de usuarios
- [ ] Plantillas personalizables
- [ ] Notificaciones por email
- [ ] Machine Learning para predicciones más avanzadas
- [ ] Integración con CRM
- [ ] Reportes automáticos
- [ ] Más tipos de proyectos especializados
- [ ] Integración con herramientas de gestión de proyectos

## 📝 Notas de Desarrollo

- Los datos son simulados (no hay persistencia real)
- **Generación de PDF completamente funcional** con jsPDF
- **Algoritmo de recomendación** basado en 8 proyectos históricos
- **Cuestionario para startups** con 20+ preguntas detalladas
- **Exportación a Excel** con múltiples hojas de cálculo
- **6 tipos de proyectos** predefinidos para startups
- Las acciones de CRUD muestran alerts de ejemplo
- El diseño es completamente responsivo
- Código TypeScript con tipado estricto

## 🔧 Solución de Problemas

### PDF no se genera
1. Verifica que el navegador permita descargas
2. Asegúrate de completar el cuestionario antes de generar
3. Revisa la consola del navegador para errores
4. Prueba la pestaña "Test PDF/Excel" para verificar las librerías

### Excel no se genera
1. Verifica que tienes permisos de escritura
2. Asegúrate de que el proyecto tenga nombre y cliente
3. Revisa que el cuestionario esté completo
4. Prueba la pestaña "Test PDF/Excel"

### Errores de tipos TypeScript
```bash
# Reinstalar tipos
npm install --save-dev @types/file-saver @types/react @types/react-dom
```

### Problemas con html2canvas
- Asegúrate de que el elemento tenga contenido visible
- Verifica que no haya elementos con `display: none`
- Espera a que el DOM se renderice completamente

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del GUX Hackathon y está destinado para uso interno.

---

**Desarrollado con ❤️ para GUX Hackathon** # licitaciones
