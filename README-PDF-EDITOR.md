# 📄 Editor de PDF Integrado

## Funcionalidades Agregadas

He implementado un editor de PDF completo que te permite:

### ✨ Cargar y Editar PDFs
- **Cargar PDF existente**: Sube cualquier archivo PDF desde tu computadora
- **Extracción automática de texto**: El sistema extrae automáticamente el texto de cada página
- **Edición por páginas**: Puedes editar el contenido de cada página individualmente
- **Vista previa original**: Botón para ver la página original del PDF mientras editas

### 🔄 Conversión Automática
- **PDF a Propuesta**: Convierte automáticamente el contenido del PDF al formato de propuesta editable
- **Detección inteligente de secciones**: El sistema intenta identificar títulos y secciones automáticamente
- **Formato JSON**: El contenido extraído se convierte al formato JSON de la aplicación

### 💾 Guardado y Descarga
- **Generar PDF editado**: Crea un nuevo PDF con tus modificaciones
- **Descarga automática**: El PDF editado se descarga automáticamente
- **Conservar formato**: Mantiene el formato y estructura del documento

## 🚀 Cómo Usar

### 1. Cargar un PDF para Editar
```
1. Ve a la sección "Editor de PDF"
2. Haz clic en "Cargar PDF para Editar"
3. Selecciona tu archivo PDF
4. Espera a que se procese (puede tomar unos segundos)
```

### 2. Editar el Contenido
```
1. Una vez cargado, verás el contenido de cada página
2. Haz clic en "Ver Original" para comparar con el PDF original
3. Edita el texto directamente en los campos de texto
4. Los cambios se guardan automáticamente
```

### 3. Guardar PDF Editado
```
1. Haz clic en "Guardar PDF Editado"
2. El sistema generará un nuevo PDF con tus cambios
3. El archivo se descargará automáticamente
```

### 4. Usar como Propuesta
```
1. El contenido extraído se convierte automáticamente a formato de propuesta
2. Puedes editarlo usando la interfaz normal de la aplicación
3. Generar PDF final usando el botón "Descargar PDF"
```

## 🛠️ Tecnologías Utilizadas

- **PDF.js**: Para leer y extraer texto de PDFs
- **PDF-lib**: Para crear y editar PDFs
- **HTML2Canvas**: Para renderizar las vistas previas
- **React**: Para la interfaz de usuario

## 📋 Ejemplo de Uso

### JSON de Ejemplo para Pruebas
He creado un JSON completo con datos de ejemplo que puedes usar para probar la funcionalidad:

```
1. Haz clic en "Ejemplo para PDF"
2. Se cargará automáticamente una propuesta completa
3. Usa "Descargar PDF" para generar el PDF
4. El PDF generado puede ser editado usando "Cargar PDF para Editar"
```

## ⚠️ Limitaciones Actuales

- **Formato básico**: El PDF editado usa un formato simple (texto plano)
- **Sin imágenes**: Las imágenes del PDF original no se conservan en la edición
- **Detección de secciones**: La conversión automática puede requerir ajustes manuales

## 🔧 Instalación de Dependencias

Las nuevas dependencias se instalan automáticamente:

```bash
npm install pdf-lib pdfjs-dist
```

O usa el script incluido:

```bash
./install-deps.sh
```

## 🎯 Flujo Completo de Trabajo

```
1. PDF Original → 2. Cargar para Editar → 3. Extraer Texto → 4. Editar Contenido → 5. Guardar PDF Editado
                                      ↓
6. Usar como Propuesta ← 7. Generar PDF Final ← 8. Editar en Interfaz ← 9. Convertir a Formato Propuesta
```

## 🔍 Solución de Problemas

### PDF no se carga
- Verifica que sea un archivo PDF válido
- Algunos PDFs protegidos pueden no funcionar
- Intenta con un PDF más simple primero

### Texto extraído incorrectamente
- Algunos PDFs escaneados pueden no extraer texto correctamente
- PDFs con formato complejo pueden requerir ajustes manuales
- Usa la función "Ver Original" para comparar

### Error al generar PDF
- Verifica que el contenido editado no esté vacío
- Intenta reducir la cantidad de texto si es muy largo
- Revisa la consola del navegador para errores específicos

## 💡 Consejos de Uso

- **Guarda frecuentemente**: Usa "Guardar PDF Editado" regularmente
- **Prueba con archivos pequeños**: Comienza con PDFs de pocas páginas
- **Revisa el contenido extraído**: Siempre verifica que el texto se extrajo correctamente
- **Usa el ejemplo incluido**: Prueba primero con el "Ejemplo para PDF"

¡La funcionalidad está lista para usar! Puedes cargar cualquier PDF y editarlo directamente desde la aplicación.