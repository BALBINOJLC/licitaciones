import React, { useState, useRef } from 'react'
import { FileText, Download, Eye, Upload, Plus, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Section {
  id: string
  title: string
  type: 'text' | 'table' | 'list' | 'image' | 'chart'
  content: any
  pageBreak?: boolean
}

interface ProposalData {
  projectInfo: {
    name: string
    client: string
    date: string
    totalCost: number
    timeline: string
  }
  sections: Section[]
  styling?: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
}

const ProposalGenerator: React.FC = () => {
  const [proposalData, setProposalData] = useState<ProposalData>({
    projectInfo: {
      name: '',
      client: '',
      date: new Date().toLocaleDateString('es-ES'),
      totalCost: 0,
      timeline: ''
    },
    sections: []
  })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [documentsError, setDocumentsError] = useState('')
  const [documents, setDocuments] = useState<any[]>([])
  const proposalRef = useRef<HTMLDivElement>(null)

  // Función para cargar documentos desde API
  const loadDocumentsFromAPI = async () => {
    setIsLoadingDocuments(true)
    setDocumentsError('')
    
    try {
      // Aquí puedes cambiar la URL por tu servicio real
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setDocuments(data)
      console.log('Documentos cargados:', data)
      
    } catch (error) {
      console.error('Error cargando documentos:', error)
      setDocumentsError(`Error al cargar documentos: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  // Función para cargar un documento específico
  const loadDocumentById = async (id: number) => {
    setIsLoadingDocuments(true)
    setDocumentsError('')
    
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Documento cargado:', data)
      
      // Aquí puedes convertir el documento a formato de propuesta si es necesario
      // Por ahora solo lo mostramos en consola
      
    } catch (error) {
      console.error('Error cargando documento:', error)
      setDocumentsError(`Error al cargar documento: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  // Función para cargar datos desde JSON
  const loadFromJSON = () => {
    setJsonError('')
    
    if (!jsonInput.trim()) {
      setJsonError('Por favor, ingresa un JSON válido en el campo de texto.')
      return
    }

    try {
      const data = JSON.parse(jsonInput)
      
      // Validar estructura básica del JSON
      if (!data.projectInfo || !data.sections) {
        setJsonError('El JSON debe contener "projectInfo" y "sections". Verifica el formato.')
        return
      }

      // Validar projectInfo
      if (!data.projectInfo.name || !data.projectInfo.client) {
        setJsonError('El JSON debe contener información del proyecto (name, client). Verifica el formato.')
        return
      }

      // Validar sections
      if (!Array.isArray(data.sections) || data.sections.length === 0) {
        setJsonError('El JSON debe contener al menos una sección en el array "sections". Verifica el formato.')
        return
      }

      // Validar cada sección
      for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i]
        if (!section.id || !section.title || !section.type || !section.content) {
          setJsonError(`La sección ${i + 1} debe contener id, title, type y content. Verifica el formato.`)
          return
        }
      }

      setProposalData(data)
      setJsonError('')
    } catch (error) {
      console.error('Error parsing JSON:', error)
      setJsonError(`Error al parsear el JSON: ${error instanceof Error ? error.message : 'Formato inválido'}`)
    }
  }

  // Función para generar JSON de ejemplo
  const generateExampleJSON = () => {
    const exampleData: ProposalData = {
      projectInfo: {
        name: 'Sistema de Gestión de Inventarios',
        client: 'Empresa ABC',
        date: new Date().toLocaleDateString('es-ES'),
        totalCost: 25000,
        timeline: '8 semanas'
      },
      sections: [
        {
          id: '1',
          title: 'Resumen Ejecutivo',
          type: 'text',
          content: 'Esta propuesta presenta nuestra solución integral para el desarrollo de un sistema de gestión de inventarios que optimizará los procesos de la empresa y mejorará la eficiencia operativa.',
          pageBreak: true
        },
        {
          id: '2',
          title: 'Servicios Incluidos',
          type: 'list',
          content: [
            'Desarrollo de aplicación web responsive',
            'Sistema de autenticación y autorización',
            'Módulo de gestión de productos',
            'Módulo de control de inventarios',
            'Reportes y dashboards',
            'Integración con sistemas existentes'
          ]
        },
        {
          id: '3',
          title: 'Equipo y Horas',
          type: 'table',
          content: {
            headers: ['Rol', 'Horas', 'Tarifa', 'Subtotal'],
            rows: [
              ['Project Manager', 40, '$80/h', '$3,200'],
              ['UX/UI Designer', 60, '$70/h', '$4,200'],
              ['Frontend Developer', 120, '$75/h', '$9,000'],
              ['Backend Developer', 140, '$80/h', '$11,200'],
              ['QA Tester', 40, '$60/h', '$2,400']
            ]
          }
        },
        {
          id: '4',
          title: 'Cronograma del Proyecto',
          type: 'text',
          content: 'El proyecto se desarrollará en 4 fases principales:\n\nFase 1 (Semanas 1-2): Análisis y diseño\nFase 2 (Semanas 3-4): Desarrollo frontend\nFase 3 (Semanas 5-6): Desarrollo backend\nFase 4 (Semanas 7-8): Testing y entrega',
          pageBreak: true
        },
        {
          id: '5',
          title: 'Entregables',
          type: 'list',
          content: [
            'Código fuente completo y documentado',
            'Documentación técnica detallada',
            'Manual de usuario',
            'Manual de administración',
            'Capacitación del equipo (8 horas)',
            'Soporte post-lanzamiento (3 meses)'
          ]
        },
        {
          id: '6',
          title: 'Términos y Condiciones',
          type: 'text',
          content: 'Pago del 40% al inicio del proyecto\nPago del 30% al completar la Fase 2\nPago del 30% restante al entregar el proyecto\nGarantía de 6 meses incluida\nSoporte técnico por 3 meses'
        }
      ],
      styling: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        fontFamily: 'Arial, sans-serif'
      }
    }
    
    setJsonInput(JSON.stringify(exampleData, null, 2))
    setProposalData(exampleData)
  }

  // Función para cargar JSON específico del Sistema UTFSM
  const loadUTFSMJSON = () => {
    const utfsmData: ProposalData = {
      projectInfo: {
        name: "Sistema de Medición de Competencias Transversales Sello",
        client: "Universidad Técnica Federico Santa María",
        date: "Mayo 2025",
        totalCost: 45000000,
        timeline: "5 meses"
      },
      sections: [
        {
          id: "1",
          title: "Resumen Ejecutivo",
          type: "text",
          content: "La presente propuesta responde a la necesidad de la Universidad Técnica Federico Santa María (UTFSM) de contar con un servicio especializado para el desarrollo e implementación de un Sistema de Medición, Control y Reporte de Competencias Transversales, que permita evaluar el progreso formativo de sus estudiantes de manera sistemática, integrada y basada en datos.\n\nEsta solución tiene por objetivo fortalecer los procesos institucionales de evaluación y seguimiento, entregando herramientas tecnológicas que contribuyan a la mejora continua de la calidad educativa.",
          pageBreak: true
        },
        {
          id: "2",
          title: "Alcance del Servicio",
          type: "list",
          content: [
            "Desarrollar una plataforma web alojada en la nube, moderna, segura e inclusiva",
            "Diseñar e implementar mecanismos de medición y reporte de competencias transversales",
            "Incorporar un sistema flexible de creación, gestión y aplicación de rúbricas de evaluación",
            "Proporcionar funcionalidades de acceso personalizado para distintos perfiles de usuarios",
            "Facilitar la autoevaluación estudiantil mediante una interfaz intuitiva",
            "Generar reportes analíticos y visualizaciones de indicadores clave de desempeño"
          ]
        },
        {
          id: "3",
          title: "Funcionalidades Clave del Sistema",
          type: "text",
          content: "El sistema considera los siguientes módulos principales:\n\n• Gestor de Competencias: Módulo en el cual el usuario Administrador podrá crear, editar, organizar y actualizar competencias transversales que se evalúan en la institución.\n\n• Gestor de Rúbricas de Evaluación: Módulo en el cual el usuario Administrador podrá crear, agregar, modificar y/o eliminar las distintas rúbricas de evaluación para cada competencia transversal.\n\n• Módulo de Evaluación y Seguimiento: Módulo en el cual tanto los estudiantes como los jefes de carrera podrán realizar procesos de evaluación y autoevaluación.\n\n• Panel de Control y Reportería Avanzada: Módulo central de gestión estratégica donde el Administrador podrá monitorear el uso del sistema y generar reportes personalizados.",
          pageBreak: true
        },
        {
          id: "4",
          title: "Tipos de Usuarios y Permisos",
          type: "table",
          content: {
            headers: ["Perfil de Usuario", "Descripción", "Permisos Principales"],
            rows: [
              ["Administrador", "Equipo de gestión institucional", "Crear/editar competencias, gestionar rúbricas, supervisar uso del sistema"],
              ["Jefe de Carrera", "Docente con responsabilidad sobre coordinación", "Visualizar resultados por carrera, participar en evaluaciones"],
              ["Estudiante", "Alumnado regular de la UTFSM", "Acceder a competencias, realizar autoevaluaciones, visualizar historial"]
            ]
          }
        },
        {
          id: "5",
          title: "Infraestructura Tecnológica",
          type: "text",
          content: "La solución propuesta contempla una infraestructura tecnológica moderna, escalable y segura:\n\n• Backend: Framework Django sobre Python, permitiendo una arquitectura robusta y modular.\n\n• Frontend: Desarrollo basado en React, utilizado para la construcción de interfaces de usuario dinámicas e interactivas.\n\n• Base de Datos: Uso combinado de PostgreSQL (para datos estructurados) y MongoDB (para datos semiestructurados).\n\n• Infraestructura: Implementación sobre servidores Linux utilizando contenedores con Docker y orquestación a través de Kubernetes.\n\n• Integraciones: API RESTful para integración bidireccional con SIGA y Moodle, autenticación unificada con Microsoft EntraID.",
          pageBreak: true
        },
        {
          id: "6",
          title: "Equipo de Trabajo Asignado",
          type: "table",
          content: {
            headers: ["Rol", "Responsabilidades Principales", "Experiencia Requerida"],
            rows: [
              ["Project Manager", "Planificación, coordinación y control del proyecto", "Más de 10 años en gestión de proyectos tecnológicos"],
              ["Tech Lead / Arquitecto", "Define la arquitectura del sistema y estándares técnicos", "Experiencia en arquitecturas de sistemas educativos"],
              ["Front-End Developer", "Desarrolla la interfaz de usuario según principios de usabilidad", "React, TypeScript, diseño responsive"],
              ["Back-End Developer", "Desarrolla la lógica de negocio y APIs RESTful", "Django, Python, APIs RESTful"],
              ["UX/UI Designer", "Diseña la experiencia y la interfaz de usuario", "Diseño centrado en usuario, accesibilidad"],
              ["QA / Tester Funcional", "Diseña y ejecuta pruebas automatizadas y manuales", "Testing automatizado, casos de uso educativos"]
            ]
          }
        },
        {
          id: "7",
          title: "Metodología de Implementación",
          type: "text",
          content: "La implementación se realizará bajo la modalidad \"llave en mano\", utilizando un enfoque metodológico basado en Disciplined Agile del PMI:\n\nFase 1 - Inception (1 mes):\n• Refinamiento del alcance y visión del producto\n• Consolidación del equipo multidisciplinario\n• Consolidación de la arquitectura técnica\n• Confirmación del backlog inicial y priorización de requisitos\n\nFase 2 - Construction (3 meses):\n• Desarrollo incremental de los módulos\n• Iteraciones cortas (1-2 semanas) con demostraciones frecuentes\n• Implementación progresiva de las integraciones\n• Pruebas técnicas continuas\n\nFase 3 - Transition (1 mes):\n• Pruebas finales y transferencia tecnológica\n• Capacitación de personal técnico\n• Despliegue en producción\n• Activación de plan de soporte",
          pageBreak: true
        },
        {
          id: "8",
          title: "Garantías y Soporte Post-implementación",
          type: "text",
          content: "GUX ofrece una política de garantía y soporte post-implementación que asegura la continuidad operativa del sistema:\n\nGarantía Técnica (6 meses):\n• Corrección sin costo de errores funcionales, bugs o defectos atribuibles al código fuente\n• Corrección de errores de configuración en los entornos implementados\n• Revisión y ajuste de integraciones con sistemas institucionales\n• Actualización de la documentación técnica cuando se aplique alguna corrección\n\nSoporte Acompañado:\n• Resolución de consultas operativas y funcionales para usuarios autorizados\n• Acompañamiento en el monitoreo de integraciones y flujos críticos\n• Aplicación de ajustes menores de configuración\n• Participación en reuniones técnicas mensuales"
        },
        {
          id: "9",
          title: "Plan de Capacitación",
          type: "list",
          content: [
            "Capacitación funcional: 6 horas distribuidas en 2 a 3 sesiones según perfil",
            "Capacitación técnica (TI): 6 a 8 horas distribuidas en sesiones especializadas",
            "Acompañamiento supervisado: 4 semanas posteriores a la puesta en marcha",
            "Acceso permanente a materiales asincrónicos",
            "Manuales de usuario diferenciados por perfil",
            "Cápsulas de video por funcionalidad clave (2 a 5 minutos)",
            "Documentación técnica estructurada",
            "Entorno de prueba (sandbox) disponible por 30 días"
          ]
        },
        {
          id: "10",
          title: "Experiencia y Referencias",
          type: "text",
          content: "GUX cuenta con más de 20 años de experiencia en desarrollo de productos digitales, con presencia en Latinoamérica y Europa. Experiencia relevante en el sector educativo:\n\n• Pontificia Universidad Católica de Chile: Plataforma de Evaluación de Madurez en Gestión TI\n• Universidad Santo Tomás: Plataforma administrativa con hiperautomatización\n• Universidad Alberto Hurtado: Plataforma administrativa con hiperautomatización\n• Universidad de Las Américas: Plataforma para apoyo a personas con discapacidad cognitiva\n• Bomberos de Chile: Apoyo integral a la Academia Nacional de Bomberos\n\nEl equipo cuenta con especialistas en tecnologías educativas (EdTech), desarrolladores full-stack, arquitectos de software, y especialistas en experiencia de usuario.",
          pageBreak: true
        },
        {
          id: "11",
          title: "Factores Clave para el Éxito",
          type: "list",
          content: [
            "Coordinación y ejecución de entrevistas y focus groups con participación activa de la UTFSM",
            "Disponibilidad de APIs de SIGA y Moodle dentro de los plazos definidos",
            "Documentación clara de APIs, ambientes de prueba y autenticación segura",
            "Ambientes estables para QA y producción desde etapas tempranas",
            "Dedicación de colaboradores clave de la UTFSM para validación y ejecución",
            "Gestión de licencias de software, hardware especializado o insumos específicos por parte de la UTFSM",
            "Cumplimiento normativo y alineación con regulaciones vigentes en Chile"
          ]
        },
        {
          id: "12",
          title: "Cronograma Detallado del Proyecto",
          type: "table",
          content: {
            headers: ["Etapa", "Duración", "Actividades Principales", "Entregables"],
            rows: [
              ["Inception", "1 mes", "Definición de requerimientos, análisis preliminar", "Documento de especificación detallado y roadmap del proyecto"],
              ["Construction", "3 meses", "Desarrollo iterativo-incremental de módulos", "Versiones funcionales incrementales de la plataforma"],
              ["Transition", "1 mes", "Pruebas finales, transferencia tecnológica", "Solución operativa en ambiente de la UTFSM"]
            ]
          }
        },
        {
          id: "13",
          title: "Inversión y Condiciones de Pago",
          type: "text",
          content: "Costo Total del Proyecto: $45.000.000 (pesos chilenos)\n\nDesglose de Costos:\n• Desarrollo de plataforma web: $32.000.000\n• Integraciones con sistemas institucionales: $8.000.000\n• Capacitación y transferencia tecnológica: $3.000.000\n• Documentación y soporte inicial: $2.000.000\n\nCondiciones de Pago:\n• 30% al inicio del proyecto (firma de contrato)\n• 40% al completar la Fase de Construction\n• 30% al completar la Fase de Transition y aceptación del sistema\n\nGarantías Incluidas:\n• Garantía técnica por 6 meses\n• Soporte post-implementación por 6 meses\n• Actualizaciones de seguridad gratuitas\n• Capacitación completa del equipo técnico"
        }
      ],
      styling: {
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
        fontFamily: "Arial, sans-serif"
      }
    }
    
    setJsonInput(JSON.stringify(utfsmData, null, 2))
    setProposalData(utfsmData)
  }

  // Función para agregar nueva sección
  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'Nueva Sección',
      type: 'text',
      content: 'Contenido de la nueva sección...'
    }
    
    setProposalData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  // Función para eliminar sección
  const removeSection = (sectionId: string) => {
    setProposalData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))
  }

  // Función para actualizar sección
  const updateSection = (sectionId: string, field: keyof Section, value: any) => {
    setProposalData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }))
  }

  // Función para renderizar contenido según el tipo
  const renderSectionContent = (section: Section) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {section.content}
          </div>
        )
      
      case 'list':
        return (
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {Array.isArray(section.content) && section.content.map((item: string, index: number) => (
              <li key={index} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        )
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {section.content.headers.map((header: string, index: number) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.content.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      
      default:
        return <div className="text-gray-500">Tipo de contenido no soportado</div>
    }
  }

  // Función para generar PDF
  const generatePDF = async () => {
    if (!proposalRef.current) return

    setIsGeneratingPDF(true)
    try {
      const canvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
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

      const fileName = `${proposalData.projectInfo.name || 'propuesta'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intenta de nuevo.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Licitaciones</h1>
          <p className="text-gray-600">Gestión y generación de propuestas comerciales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vista de Propuesta y Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* JSON Input Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cargar Datos desde JSON
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={generateExampleJSON}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Generar JSON de Ejemplo
                  </button>
                  <button
                    onClick={loadUTFSMJSON}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Cargar JSON UTFSM
                  </button>
                  <button
                    onClick={loadFromJSON}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Cargar JSON Personalizado
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value)
                    setJsonError('')
                  }}
                  placeholder="Pega aquí tu JSON con los datos de la propuesta..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                {jsonError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{jsonError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Proyecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={proposalData.projectInfo.name}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={proposalData.projectInfo.client}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, client: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Total
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={proposalData.projectInfo.totalCost}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, totalCost: Number(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Sections Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Secciones de la Propuesta
                </h3>
                <button
                  onClick={addSection}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Agregar Sección
                </button>
              </div>
              <div className="space-y-4">
                {proposalData.sections.map((section, index) => (
                  <div key={section.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            className="input-field"
                            value={section.type}
                            onChange={(e) => updateSection(section.id, 'type', e.target.value)}
                          >
                            <option value="text">Texto</option>
                            <option value="list">Lista</option>
                            <option value="table">Tabla</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`pageBreak-${section.id}`}
                            checked={section.pageBreak}
                            onChange={(e) => updateSection(section.id, 'pageBreak', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`pageBreak-${section.id}`} className="text-sm text-gray-700">
                            Salto de página
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenido
                      </label>
                      {section.type === 'text' && (
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={section.content}
                          onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                          placeholder="Escribe el contenido de esta sección..."
                        />
                      )}
                      {section.type === 'list' && (
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={Array.isArray(section.content) ? section.content.join('\n') : ''}
                          onChange={(e) => updateSection(section.id, 'content', e.target.value.split('\n').filter(item => item.trim()))}
                          placeholder="Escribe cada elemento en una línea separada..."
                        />
                      )}
                      {section.type === 'table' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Encabezados (separados por comas)
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              value={section.content?.headers?.join(', ') || ''}
                              onChange={(e) => updateSection(section.id, 'content', {
                                ...section.content,
                                headers: e.target.value.split(',').map(h => h.trim())
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Filas (una fila por línea, valores separados por comas)
                            </label>
                            <textarea
                              className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              value={section.content?.rows?.map((row: string[]) => row.join(', ')).join('\n') || ''}
                              onChange={(e) => updateSection(section.id, 'content', {
                                ...section.content,
                                rows: e.target.value.split('\n').filter(row => row.trim()).map(row => 
                                  row.split(',').map(cell => cell.trim())
                                )
                              })}
                              placeholder="Fila 1, Fila 2, Fila 3&#10;Valor 1, Valor 2, Valor 3"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Preview */}
            {proposalData.sections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Previa de la Propuesta
                </h3>
                <div 
                  ref={proposalRef}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto"
                  style={{ minHeight: '1000px' }}
                >
                  {/* Header */}
                  <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">GUX</h1>
                    <p className="text-lg text-gray-600">Propuesta de Desarrollo</p>
                  </div>

                  {/* Project Info */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {proposalData.projectInfo.name || 'Nombre del Proyecto'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Cliente:</span>
                        <p className="text-gray-900">{proposalData.projectInfo.client || 'Nombre del Cliente'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fecha:</span>
                        <p className="text-gray-900">{proposalData.projectInfo.date}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Costo Total:</span>
                        <p className="text-gray-900 font-bold">${proposalData.projectInfo.totalCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-8">
                    {proposalData.sections.map((section, index) => (
                      <div 
                        key={section.id}
                        className={section.pageBreak ? 'page-break' : ''}
                      >
                        <h3 className="text-xl font-bold text-blue-600 mb-4">
                          {section.title}
                        </h3>
                        {renderSectionContent(section)}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-gray-600">
                    <p>Equipo GUX - Especialistas en Desarrollo de Software</p>
                    <p>Email: contacto@gux.com | Tel: +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generador de PDF */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Download className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Generador de PDF</h3>
              </div>
              <div className="space-y-4">
                <button
                  onClick={generatePDF}
                  disabled={proposalData.sections.length === 0 || isGeneratingPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                  {isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
                </button>
              </div>
              {isGeneratingPDF && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">Generando PDF... Esto puede tomar unos segundos.</p>
                </div>
              )}
            </div>

            {/* Observaciones y Correcciones (opcional) */}
          {/*   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Observaciones y Correcciones</h3>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Escriba aquí sus observaciones, comentarios o correcciones para la propuesta..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Eye size={16} />
                  Aplicar Correcciones
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Las correcciones se aplicarán automáticamente a la propuesta
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalGenerator 