export interface HistoricalProject {
  id: string
  projectName: string
  clientType: string
  services: string[]
  totalHours: number
  totalCost: number
  successRate: number // 0-100
  template: string
  duration: number // semanas
  teamSize: number
  complexity: 'low' | 'medium' | 'high'
  outcome: 'success' | 'partial' | 'failure'
}

export const historicalProjects: HistoricalProject[] = [
  {
    id: '1',
    projectName: 'E-commerce Redesign',
    clientType: 'Startup',
    services: ['Diseño UX/UI', 'Desarrollo Frontend', 'Desarrollo Backend'],
    totalHours: 320,
    totalCost: 25000,
    successRate: 95,
    template: 'Propuesta Startup',
    duration: 8,
    teamSize: 3,
    complexity: 'medium',
    outcome: 'success'
  },
  {
    id: '2',
    projectName: 'Mobile App Development',
    clientType: 'Empresa Mediana',
    services: ['Diseño UX/UI', 'Desarrollo Frontend', 'Testing QA'],
    totalHours: 480,
    totalCost: 35000,
    successRate: 88,
    template: 'Propuesta Detallada',
    duration: 12,
    teamSize: 4,
    complexity: 'high',
    outcome: 'success'
  },
  {
    id: '3',
    projectName: 'Corporate Website',
    clientType: 'Corporación',
    services: ['Diseño UX/UI', 'Desarrollo Frontend'],
    totalHours: 160,
    totalCost: 12000,
    successRate: 92,
    template: 'Propuesta Básica',
    duration: 4,
    teamSize: 2,
    complexity: 'low',
    outcome: 'success'
  },
  {
    id: '4',
    projectName: 'ERP System',
    clientType: 'Corporación',
    services: ['Desarrollo Backend', 'Desarrollo Full Stack', 'DevOps'],
    totalHours: 800,
    totalCost: 60000,
    successRate: 75,
    template: 'Propuesta Detallada',
    duration: 20,
    teamSize: 5,
    complexity: 'high',
    outcome: 'partial'
  },
  {
    id: '5',
    projectName: 'Startup MVP',
    clientType: 'Startup',
    services: ['Diseño UX/UI', 'Desarrollo Full Stack'],
    totalHours: 240,
    totalCost: 18000,
    successRate: 98,
    template: 'Propuesta Startup',
    duration: 6,
    teamSize: 2,
    complexity: 'medium',
    outcome: 'success'
  },
  {
    id: '6',
    projectName: 'Government Portal',
    clientType: 'Gobierno',
    services: ['Desarrollo Backend', 'Análisis de Datos', 'Testing QA'],
    totalHours: 600,
    totalCost: 45000,
    successRate: 82,
    template: 'Propuesta Detallada',
    duration: 15,
    teamSize: 4,
    complexity: 'high',
    outcome: 'success'
  },
  {
    id: '7',
    projectName: 'Non-profit Website',
    clientType: 'Organización sin fines de lucro',
    services: ['Diseño UX/UI', 'Desarrollo Frontend'],
    totalHours: 120,
    totalCost: 8000,
    successRate: 90,
    template: 'Propuesta Básica',
    duration: 3,
    teamSize: 2,
    complexity: 'low',
    outcome: 'success'
  },
  {
    id: '8',
    projectName: 'SaaS Platform',
    clientType: 'Empresa Mediana',
    services: ['Desarrollo Full Stack', 'DevOps', 'Análisis de Datos'],
    totalHours: 720,
    totalCost: 55000,
    successRate: 85,
    template: 'Propuesta Detallada',
    duration: 18,
    teamSize: 4,
    complexity: 'high',
    outcome: 'success'
  }
]

// Algoritmo de decisión para recomendar plantilla y estimaciones
export interface ProjectRecommendation {
  recommendedTemplate: string
  estimatedHours: number
  estimatedCost: number
  confidence: number
  similarProjects: HistoricalProject[]
  reasoning: string
}

export function getProjectRecommendation(
  clientType: string,
  services: string[],
  estimatedHours: number
): ProjectRecommendation {
  // Filtrar proyectos similares
  const similarProjects = historicalProjects.filter(project => {
    const clientMatch = project.clientType === clientType
    const serviceMatch = services.some(service => 
      project.services.includes(service)
    )
    return clientMatch || serviceMatch
  })

  if (similarProjects.length === 0) {
    // Si no hay proyectos similares, usar todos los proyectos
    return {
      recommendedTemplate: 'Propuesta Detallada',
      estimatedHours: estimatedHours,
      estimatedCost: estimatedHours * 60, // Tarifa promedio
      confidence: 50,
      similarProjects: historicalProjects.slice(0, 3),
      reasoning: 'No se encontraron proyectos similares. Usando estimación estándar.'
    }
  }

  // Calcular métricas de proyectos similares
  const avgSuccessRate = similarProjects.reduce((sum, p) => sum + p.successRate, 0) / similarProjects.length
  const avgCostPerHour = similarProjects.reduce((sum, p) => sum + (p.totalCost / p.totalHours), 0) / similarProjects.length
  
  // Determinar plantilla recomendada basada en el tipo de cliente
  let recommendedTemplate = 'Propuesta Detallada'
  if (clientType === 'Startup') {
    recommendedTemplate = 'Propuesta Startup'
  } else if (clientType === 'Corporación' || clientType === 'Gobierno') {
    recommendedTemplate = 'Propuesta Detallada'
  } else {
    recommendedTemplate = 'Propuesta Básica'
  }

  // Ajustar estimaciones basadas en proyectos similares
  const adjustedHours = Math.round(estimatedHours * (avgSuccessRate / 90)) // Ajustar por tasa de éxito
  const estimatedCost = Math.round(adjustedHours * avgCostPerHour)

  // Calcular confianza basada en similitud y cantidad de datos
  const confidence = Math.min(95, 50 + (similarProjects.length * 10) + (avgSuccessRate - 80))

  return {
    recommendedTemplate,
    estimatedHours: adjustedHours,
    estimatedCost,
    confidence: Math.round(confidence),
    similarProjects: similarProjects.slice(0, 3),
    reasoning: `Basado en ${similarProjects.length} proyectos similares con ${Math.round(avgSuccessRate)}% de éxito promedio.`
  }
}

// Función para obtener estadísticas de proyectos por tipo de cliente
export function getClientTypeStats(clientType: string) {
  const projects = historicalProjects.filter(p => p.clientType === clientType)
  if (projects.length === 0) return null

  const avgCost = projects.reduce((sum, p) => sum + p.totalCost, 0) / projects.length
  const avgHours = projects.reduce((sum, p) => sum + p.totalHours, 0) / projects.length
  const successRate = projects.reduce((sum, p) => sum + p.successRate, 0) / projects.length

  return {
    totalProjects: projects.length,
    averageCost: Math.round(avgCost),
    averageHours: Math.round(avgHours),
    successRate: Math.round(successRate),
    mostUsedTemplate: getMostUsedTemplate(projects)
  }
}

function getMostUsedTemplate(projects: HistoricalProject[]): string {
  const templateCounts: { [key: string]: number } = {}
  projects.forEach(p => {
    templateCounts[p.template] = (templateCounts[p.template] || 0) + 1
  })
  
  return Object.entries(templateCounts)
    .sort(([,a], [,b]) => b - a)[0][0]
} 