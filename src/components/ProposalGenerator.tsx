import React, { useState, useRef } from 'react'
import { FileText, Download, Eye, Save } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ProposalTemplate {
  id: string
  name: string
  description: string
  content: string
}

const ProposalGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [proposalContent, setProposalContent] = useState('')
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const proposalRef = useRef<HTMLDivElement>(null)

  const templates: ProposalTemplate[] = [
    {
      id: 'template1',
      name: 'Propuesta Básica',
      description: 'Plantilla simple y directa para proyectos pequeños',
      content: `Estimado/a [CLIENTE],

Nos complace presentarle nuestra propuesta para el proyecto "[NOMBRE_PROYECTO]".

**Resumen del Proyecto:**
[NOMBRE_PROYECTO] es un proyecto que incluirá los siguientes servicios:
- [SERVICIOS]

**Alcance del Trabajo:**
Nuestro equipo trabajará en colaboración con usted para entregar una solución completa y de alta calidad.

**Inversión:**
El costo total del proyecto es de $[COSTO_TOTAL].

**Cronograma:**
- Fecha de inicio: [FECHA_INICIO]
- Fecha de entrega: [FECHA_ENTREGA]

**Próximos Pasos:**
1. Revisión y aprobación de la propuesta
2. Firma del contrato
3. Inicio del proyecto

Quedamos a su disposición para cualquier consulta.

Saludos cordiales,
Equipo GUX`
    },
    {
      id: 'template2',
      name: 'Propuesta Detallada',
      description: 'Plantilla completa con secciones detalladas',
      content: `# Propuesta de Proyecto: [NOMBRE_PROYECTO]

## Información del Cliente
**Cliente:** [CLIENTE]
**Tipo de Cliente:** [TIPO_CLIENTE]
**Fecha de Propuesta:** [FECHA_ACTUAL]

## Resumen Ejecutivo
Esta propuesta presenta nuestra solución integral para [NOMBRE_PROYECTO], diseñada para cumplir con sus objetivos de negocio y expectativas de calidad.

## Servicios Incluidos
[SERVICIOS]

## Metodología de Trabajo
Nuestro enfoque se basa en metodologías ágiles y mejores prácticas de la industria:

1. **Fase de Descubrimiento**
   - Análisis de requerimientos
   - Investigación de usuarios
   - Definición de arquitectura

2. **Fase de Diseño**
   - Diseño de experiencia de usuario
   - Diseño de interfaz
   - Prototipado

3. **Fase de Desarrollo**
   - Desarrollo frontend y backend
   - Integración de sistemas
   - Testing y QA

4. **Fase de Entrega**
   - Despliegue
   - Capacitación
   - Soporte post-lanzamiento

## Equipo Asignado
- **UX Designer:** [HORAS_UX] horas a $[TARIFA_UX]/hora
- **Developer:** [HORAS_DEV] horas a $[TARIFA_DEV]/hora
- **Project Manager:** [HORAS_PM] horas a $[TARIFA_PM]/hora

## Inversión
**Costo Total del Proyecto:** $[COSTO_TOTAL]
**Horas Totales:** [HORAS_TOTALES]

## Cronograma
- **Fecha de Inicio:** [FECHA_INICIO]
- **Fecha de Entrega:** [FECHA_ENTREGA]
- **Duración:** [DURACION] semanas

## Entregables
- Documentación completa del proyecto
- Código fuente y documentación técnica
- Manual de usuario
- Capacitación del equipo

## Términos y Condiciones
- Pago del 50% al inicio del proyecto
- Pago del 50% restante al completar el proyecto
- 3 meses de soporte post-entrega incluido
- Propiedad intelectual transferida al cliente

## Garantía
Ofrecemos una garantía de 6 meses para todos los entregables del proyecto.

## Contacto
Para cualquier consulta sobre esta propuesta, no dude en contactarnos.

**Equipo GUX**
Email: contacto@gux.com
Teléfono: +1 (555) 123-4567`
    },
    {
      id: 'template3',
      name: 'Propuesta Startup',
      description: 'Plantilla optimizada para startups y proyectos ágiles',
      content: `# Propuesta Ágil: [NOMBRE_PROYECTO]

¡Hola [CLIENTE]!

Estamos emocionados de trabajar contigo en [NOMBRE_PROYECTO]. Como startup, entendemos la importancia de la velocidad y la flexibilidad.

## Lo que haremos
[SERVICIOS]

## Nuestro Enfoque Ágil
- **Sprints de 2 semanas** con entregables funcionales
- **Comunicación constante** y feedback rápido
- **Iteraciones basadas en datos** y feedback de usuarios
- **Flexibilidad** para adaptar el proyecto según evolucionen tus necesidades

## Inversión
**Total:** $[COSTO_TOTAL]
- 25% al iniciar
- 25% al completar el primer sprint
- 25% al completar el segundo sprint
- 25% al entregar el proyecto final

## Timeline
- **Inicio:** [FECHA_INICIO]
- **Entrega:** [FECHA_ENTREGA]
- **Duración:** [DURACION] semanas

## Equipo
- UX/UI Designer
- Full Stack Developer
- Project Manager

## ¿Por qué elegirnos?
✅ Experiencia con startups
✅ Entregas rápidas y funcionales
✅ Comunicación transparente
✅ Soporte post-lanzamiento

¡Empecemos a construir algo increíble juntos!

**Equipo GUX**`
    }
  ]

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setProposalContent(template.content)
      setSelectedTemplate(templateId)
    }
  }

  const replacePlaceholders = (content: string) => {
    return content
      .replace(/\[NOMBRE_PROYECTO\]/g, projectName || '[NOMBRE_PROYECTO]')
      .replace(/\[CLIENTE\]/g, clientName || '[CLIENTE]')
      .replace(/\[COSTO_TOTAL\]/g, totalCost || '[COSTO_TOTAL]')
      .replace(/\[FECHA_INICIO\]/g, '[FECHA_INICIO]')
      .replace(/\[FECHA_ENTREGA\]/g, '[FECHA_ENTREGA]')
      .replace(/\[SERVICIOS\]/g, '[SERVICIOS]')
  }

  const generatePDF = async () => {
    if (!proposalRef.current) return

    setIsGeneratingPDF(true)
    try {
      const canvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `${projectName || 'propuesta'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const previewProposal = () => {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Vista Previa - ${projectName}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              h1, h2, h3 { color: #2563eb; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GUX - Propuesta de Proyecto</h1>
            </div>
            ${replacePlaceholders(proposalContent).replace(/\n/g, '<br>')}
          </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const saveProposal = () => {
    // Placeholder para guardar propuesta
    alert('Propuesta guardada exitosamente')
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Generador de Propuestas
        </h2>

        {/* Template Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar Plantilla
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => loadTemplate(template.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={20} className="text-primary-600" />
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Proyecto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                className="input-field"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ej: Rediseño de E-commerce"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente
              </label>
              <input
                type="text"
                className="input-field"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Empresa ABC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Total ($)
              </label>
              <input
                type="number"
                className="input-field"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contenido de la Propuesta
          </h3>
          <textarea
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            value={proposalContent}
            onChange={(e) => setProposalContent(e.target.value)}
            placeholder="Escribe o edita el contenido de tu propuesta aquí..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Usa [NOMBRE_PROYECTO], [CLIENTE], [COSTO_TOTAL] como placeholders que se reemplazarán automáticamente
          </p>
        </div>

        {/* PDF Preview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vista Previa para PDF
          </h3>
          <div 
            ref={proposalRef}
            className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto"
            style={{ minHeight: '800px' }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">GUX</h1>
              <p className="text-lg text-gray-600">Propuesta de Proyecto</p>
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: replacePlaceholders(proposalContent)
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/# (.*?)\n/g, '<h1>$1</h1>')
                  .replace(/## (.*?)\n/g, '<h2>$1</h2>')
                  .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                  .replace(/- (.*?)\n/g, '<li>$1</li>')
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={previewProposal}
            className="btn-secondary flex items-center gap-2"
          >
            <Eye size={16} />
            Vista Previa
          </button>
          <button
            onClick={saveProposal}
            className="btn-secondary flex items-center gap-2"
          >
            <Save size={16} />
            Guardar Propuesta
          </button>
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} />
            {isGeneratingPDF ? 'Generando PDF...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProposalGenerator 