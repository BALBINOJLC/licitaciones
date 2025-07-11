import React from 'react'
import { TrendingUp, Clock, DollarSign, Target, BarChart3 } from 'lucide-react'
import { ProjectRecommendation, HistoricalProject, getClientTypeStats } from '../data/projectHistory'

interface ProjectRecommendationProps {
  recommendation: ProjectRecommendation
  clientType: string
  onApplyRecommendation: (template: string, hours: number, cost: number) => void
}

const ProjectRecommendationComponent: React.FC<ProjectRecommendationProps> = ({
  recommendation,
  clientType,
  onApplyRecommendation
}) => {
  const clientStats = getClientTypeStats(clientType)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">
          Recomendación Inteligente
        </h3>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {recommendation.confidence}% confianza
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-green-600" size={20} />
            <span className="font-medium text-gray-900">Plantilla Recomendada</span>
          </div>
          <p className="text-lg font-bold text-green-600">{recommendation.recommendedTemplate}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600" size={20} />
            <span className="font-medium text-gray-900">Horas Estimadas</span>
          </div>
          <p className="text-lg font-bold text-blue-600">{recommendation.estimatedHours}h</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-purple-600" size={20} />
            <span className="font-medium text-gray-900">Costo Estimado</span>
          </div>
          <p className="text-lg font-bold text-purple-600">${recommendation.estimatedCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Razonamiento</h4>
        <p className="text-gray-700 text-sm">{recommendation.reasoning}</p>
      </div>

      {clientStats && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Estadísticas para {clientType}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Proyectos</div>
              <div className="text-lg font-bold text-gray-900">{clientStats.totalProjects}</div>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Costo Promedio</div>
              <div className="text-lg font-bold text-gray-900">${clientStats.averageCost.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Horas Promedio</div>
              <div className="text-lg font-bold text-gray-900">{clientStats.averageHours}h</div>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Tasa de Éxito</div>
              <div className="text-lg font-bold text-green-600">{clientStats.successRate}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Proyectos Similares</h4>
        <div className="space-y-2">
          {recommendation.similarProjects.map((project) => (
            <div key={project.id} className="bg-white rounded p-3 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{project.projectName}</div>
                  <div className="text-sm text-gray-600">{project.clientType}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">${project.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{project.totalHours}h</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  project.outcome === 'success' ? 'bg-green-100 text-green-800' :
                  project.outcome === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.outcome === 'success' ? 'Éxito' : 
                   project.outcome === 'partial' ? 'Parcial' : 'Fallo'}
                </span>
                <span className="text-gray-500">{project.successRate}% éxito</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onApplyRecommendation(
            recommendation.recommendedTemplate,
            recommendation.estimatedHours,
            recommendation.estimatedCost
          )}
          className="btn-primary flex items-center gap-2"
        >
          <BarChart3 size={16} />
          Aplicar Recomendación
        </button>
        <button className="btn-secondary">
          Ver Más Detalles
        </button>
      </div>
    </div>
  )
}

export default ProjectRecommendationComponent 