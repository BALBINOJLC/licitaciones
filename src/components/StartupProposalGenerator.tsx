import React, { useState, useRef } from 'react'
import { FileText, Download, Eye, Save, FileSpreadsheet, Brain } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import StartupQuestionnaire from './StartupQuestionnaire'

interface StartupProposalData {
  projectName: string
  clientName: string
  clientEmail: string
  answers: Record<string, any>
  calculations: any
  additionalNotes: string
}

const StartupProposalGenerator: React.FC = () => {
  const [proposalData, setProposalData] = useState<StartupProposalData>({
    projectName: '',
    clientName: '',
    clientEmail: '',
    answers: {},
    calculations: null,
    additionalNotes: ''
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)
  const [error, setError] = useState<string>('')
  const proposalRef = useRef<HTMLDivElement>(null)

  const handleQuestionnaireComplete = (answers: Record<string, any>, calculations: any) => {
    setProposalData(prev => ({
      ...prev,
      answers,
      calculations
    }))
    setError('') // Limpiar errores previos
  }

  const generateDetailedProposal = (): string => {
    const { projectName, clientName, answers, calculations } = proposalData
    
    return `# Propuesta de Desarrollo - ${projectName}

## Información del Cliente
**Cliente:** ${clientName}
**Fecha de Propuesta:** ${new Date().toLocaleDateString('es-ES')}
**Tipo de Proyecto:** ${answers['project-type'] || 'No especificado'}

## Resumen Ejecutivo

Nos complace presentarle nuestra propuesta integral para el desarrollo de **${projectName}**, un proyecto diseñado específicamente para startups que buscan validar su idea de negocio y escalar rápidamente en el mercado.

### Nuestro Enfoque para Startups

Como especialistas en desarrollo para startups, entendemos la importancia de:
- **Velocidad de ejecución** sin comprometer la calidad
- **Escalabilidad** desde el primer día
- **Validación de mercado** a través de MVPs funcionales
- **Flexibilidad** para adaptar el producto según el feedback de usuarios

## Análisis del Proyecto

### Tipo de Proyecto
${answers['project-type'] || 'No especificado'}

### Público Objetivo
${answers['target-audience'] || 'No especificado'}

### Modelo de Negocio
${answers['business-model'] || 'No especificado'}

## Alcance Técnico Detallado

### Funcionalidades Core

#### Autenticación y Gestión de Usuarios
${answers['authentication'] ? answers['authentication'].map((auth: string) => `- ${auth}`).join('\n') : '- Sistema de autenticación básico'}

#### Gestión de Contenido
${answers['content-management'] ? answers['content-management'].map((content: string) => `- ${content}`).join('\n') : '- Gestión de contenido básica'}

### Integraciones

#### Pasarelas de Pago
${answers['payment-integration'] ? answers['payment-integration'].map((payment: string) => `- ${payment}`).join('\n') : '- Integración de pagos básica'}

#### Integraciones de Terceros
${answers['third-party-integrations'] ? answers['third-party-integrations'].map((integration: string) => `- ${integration}`).join('\n') : '- Sin integraciones externas'}

### Diseño y Experiencia de Usuario

#### Requisitos de Diseño
${answers['design-requirements'] ? answers['design-requirements'].map((design: string) => `- ${design}`).join('\n') : '- Diseño responsive básico'}

#### Stack Tecnológico
${answers['tech-stack'] || 'React + Node.js (Recomendado para startups)'}

### Escalabilidad y Infraestructura

#### Requisitos de Escalabilidad
${answers['scalability-requirements'] ? answers['scalability-requirements'].map((scalability: string) => `- ${scalability}`).join('\n') : '- Arquitectura básica escalable'}

#### Volumen de Usuarios Esperado
${answers['expected-users'] || 'No especificado'}

### Funcionalidades Avanzadas

#### Características Especiales
${answers['advanced-features'] ? answers['advanced-features'].map((feature: string) => `- ${feature}`).join('\n') : '- Funcionalidades básicas'}

#### Requisitos de Seguridad
${answers['security-requirements'] ? answers['security-requirements'].map((security: string) => `- ${security}`).join('\n') : '- Seguridad estándar'}

## Estimación Detallada

### Resumen de Horas por Categoría
${calculations ? Object.entries(calculations.breakdown).map(([category, hours]) => `- **${category}:** ${hours} horas`).join('\n') : ''}

### Timeline de Desarrollo
- **Duración Total:** ${calculations ? calculations.timeline : 0} semanas
- **Equipo Recomendado:** 2-3 desarrolladores
- **Metodología:** Agile con sprints de 2 semanas

### Fases de Desarrollo

#### Fase 1: MVP (Semanas 1-4)
- Configuración del proyecto y arquitectura base
- Desarrollo de funcionalidades core
- Diseño de interfaz básica
- Testing inicial

#### Fase 2: Funcionalidades Avanzadas (Semanas 5-8)
- Integraciones de terceros
- Funcionalidades avanzadas
- Optimización de performance
- Testing completo

#### Fase 3: Lanzamiento (Semanas 9-12)
- Deployment y configuración de producción
- Optimización final
- Documentación
- Capacitación del equipo

## Inversión

### Costo Total del Proyecto
**$${calculations ? calculations.estimatedCost.toLocaleString() : 0}**

### Desglose de Costos
- **Desarrollo:** $${calculations ? Math.round(calculations.estimatedCost * 0.8).toLocaleString() : 0}
- **Diseño UX/UI:** $${calculations ? Math.round(calculations.estimatedCost * 0.15).toLocaleString() : 0}
- **Testing y QA:** $${calculations ? Math.round(calculations.estimatedCost * 0.05).toLocaleString() : 0}

### Condiciones de Pago
- **40%** al inicio del proyecto
- **30%** al completar la Fase 1
- **30%** al completar la Fase 2

## Entregables

### Código y Documentación
- Código fuente completo y documentado
- Documentación técnica detallada
- Manual de usuario
- Manual de administración

### Capacitación y Soporte
- Capacitación del equipo (8 horas)
- Soporte post-lanzamiento (3 meses)
- Mantenimiento y actualizaciones

### Optimización y Marketing
- Optimización SEO básica
- Configuración de analytics
- Estrategia de lanzamiento

## Por Qué Elegirnos para tu Startup

### Experiencia Comprobada
- Más de 50 proyectos de startups exitosos
- Tasa de éxito del 95% en validación de mercado
- Especialización en tecnologías modernas

### Metodología Ágil
- Sprints de 2 semanas con entregables funcionales
- Feedback constante y iteraciones rápidas
- Adaptación a cambios de requerimientos

### Soporte Continuo
- Disponibilidad 24/7 durante el desarrollo
- Mentoring en estrategia de producto
- Conexiones con inversores y aceleradoras

## Próximos Pasos

1. **Revisión de la propuesta** (1-2 días)
2. **Firma del contrato** (1 día)
3. **Kickoff del proyecto** (1 semana)
4. **Inicio del desarrollo** (Inmediato)

## Garantías

- **Garantía de funcionamiento** por 6 meses
- **Soporte técnico** incluido por 3 meses
- **Actualizaciones de seguridad** gratuitas
- **Escalabilidad garantizada** para el crecimiento

## Contacto

**Equipo GUX**
Email: startup@gux.com
Teléfono: +1 (555) 123-4567
Web: www.gux.com/startups

---

*Esta propuesta es válida por 30 días desde la fecha de emisión.*

**¡Construyamos juntos el futuro de tu startup!**`
  }

  const generatePDF = async () => {
    if (!proposalRef.current) {
      setError('No se puede generar el PDF. Asegúrate de completar el cuestionario primero.')
      return
    }

    setIsGeneratingPDF(true)
    setError('')

    try {
      // Esperar un momento para que el DOM se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: proposalRef.current.scrollWidth,
        height: proposalRef.current.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
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

      const fileName = `${proposalData.projectName || 'startup_proposal'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      console.log('PDF generado exitosamente:', fileName)
    } catch (error) {
      console.error('Error generando PDF:', error)
      setError('Error al generar el PDF. Verifica que tienes permisos para descargar archivos.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generateExcel = () => {
    if (!proposalData.calculations) {
      setError('No se puede generar el Excel. Asegúrate de completar el cuestionario primero.')
      return
    }

    setIsGeneratingExcel(true)
    setError('')

    try {
      const { answers, calculations } = proposalData

      // Crear workbook
      const wb = XLSX.utils.book_new()

      // Hoja 1: Resumen
      const summaryData = [
        ['PROPUESTA DE DESARROLLO - STARTUP'],
        [''],
        ['Información del Proyecto'],
        ['Nombre del Proyecto', proposalData.projectName || 'No especificado'],
        ['Cliente', proposalData.clientName || 'No especificado'],
        ['Email', proposalData.clientEmail || 'No especificado'],
        ['Fecha', new Date().toLocaleDateString('es-ES')],
        [''],
        ['Estimación'],
        ['Horas Totales', calculations?.totalHours || 0],
        ['Costo Total', calculations?.estimatedCost || 0],
        ['Timeline (semanas)', calculations?.timeline || 0],
        ['Tarifa Promedio', '$60/hora']
      ]

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen')

      // Hoja 2: Desglose de Horas
      if (calculations?.breakdown) {
        const breakdownData = [
          ['DESGLOSE DE HORAS POR CATEGORÍA'],
          [''],
          ['Categoría', 'Horas', 'Porcentaje', 'Costo Estimado']
        ]

        Object.entries(calculations.breakdown).forEach(([category, hours]) => {
          const hoursNum = typeof hours === 'number' ? hours : 0
          const totalHours = calculations.totalHours || 1
          const percentage = ((hoursNum / totalHours) * 100).toFixed(1)
          const cost = hoursNum * 60
          breakdownData.push([category, hoursNum.toString(), `${percentage}%`, `$${cost.toLocaleString()}`])
        })

        const breakdownWs = XLSX.utils.aoa_to_sheet(breakdownData)
        XLSX.utils.book_append_sheet(wb, breakdownWs, 'Desglose de Horas')
      }

      // Hoja 3: Respuestas del Cuestionario
      const answersData = [
        ['RESPUESTAS DEL CUESTIONARIO'],
        [''],
        ['Pregunta', 'Respuesta']
      ]

      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        let answerText = ''
        
        if (Array.isArray(answer)) {
          answerText = answer.join(', ')
        } else if (typeof answer === 'string') {
          answerText = answer
        } else if (typeof answer === 'number') {
          answerText = answer.toString()
        } else {
          answerText = 'No especificado'
        }
        
        answersData.push([question, answerText])
      })

      const answersWs = XLSX.utils.aoa_to_sheet(answersData)
      XLSX.utils.book_append_sheet(wb, answersWs, 'Cuestionario')

      // Guardar archivo
      const fileName = `${proposalData.projectName || 'startup_proposal'}_estimacion_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      console.log('Excel generado exitosamente:', fileName)
    } catch (error) {
      console.error('Error generando Excel:', error)
      setError('Error al generar el Excel. Verifica que tienes permisos para descargar archivos.')
    } finally {
      setIsGeneratingExcel(false)
    }
  }

  const previewProposal = () => {
    if (!proposalData.calculations) {
      setError('No se puede generar la vista previa. Asegúrate de completar el cuestionario primero.')
      return
    }

    setError('')
    
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Propuesta Startup - ${proposalData.projectName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 40px; 
                max-width: 800px; 
                color: #333;
              }
              h1, h2, h3 { color: #2563eb; }
              .header { 
                border-bottom: 2px solid #2563eb; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
                text-align: center; 
              }
              .highlight { 
                background-color: #f0f9ff; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .cost { 
                font-size: 24px; 
                font-weight: bold; 
                color: #059669; 
              }
              ul { margin-left: 20px; }
              li { margin-bottom: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GUX - Propuesta de Desarrollo para Startups</h1>
              <p>Especialistas en desarrollo ágil y escalable</p>
            </div>
            ${generateDetailedProposal().replace(/\n/g, '<br>')}
          </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const canGenerateDocuments = () => {
    return proposalData.calculations && 
           proposalData.projectName && 
           proposalData.clientName
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Brain className="text-blue-600" size={24} />
          Generador de Propuestas para Startups
        </h2>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Client Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                className="input-field"
                value={proposalData.projectName}
                onChange={(e) => setProposalData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Ej: MiApp - Plataforma de Delivery"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                className="input-field"
                value={proposalData.clientName}
                onChange={(e) => setProposalData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Cliente
              </label>
              <input
                type="email"
                className="input-field"
                value={proposalData.clientEmail}
                onChange={(e) => setProposalData(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="juan@startup.com"
              />
            </div>
          </div>
        </div>

        {/* Questionnaire */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cuestionario Detallado
          </h3>
          <StartupQuestionnaire onComplete={handleQuestionnaireComplete} />
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notas Adicionales
          </h3>
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={proposalData.additionalNotes}
            onChange={(e) => setProposalData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            placeholder="Agrega cualquier información adicional, requisitos especiales, o consideraciones específicas..."
          />
        </div>

        {/* PDF Preview */}
        {proposalData.calculations && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista Previa de la Propuesta
            </h3>
            <div 
              ref={proposalRef}
              className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto"
              style={{ minHeight: '1000px' }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">GUX</h1>
                <p className="text-lg text-gray-600">Propuesta de Desarrollo para Startups</p>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: generateDetailedProposal()
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
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={previewProposal}
            disabled={!canGenerateDocuments()}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            Vista Previa
          </button>
          <button
            onClick={generateExcel}
            disabled={!canGenerateDocuments() || isGeneratingExcel}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={16} />
            {isGeneratingExcel ? 'Generando Excel...' : 'Exportar Excel'}
          </button>
          <button
            onClick={generatePDF}
            disabled={!canGenerateDocuments() || isGeneratingPDF}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {isGeneratingPDF ? 'Generando PDF...' : 'Generar PDF'}
          </button>
        </div>

        {/* Status Messages */}
        {isGeneratingPDF && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">Generando PDF... Esto puede tomar unos segundos.</p>
          </div>
        )}
        
        {isGeneratingExcel && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">Generando Excel... Esto puede tomar unos segundos.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartupProposalGenerator 