import React from 'react'
import { BarChart3, TrendingUp, Target, Award, Users, Calendar } from 'lucide-react'
import { historicalProjects } from '../data/projectHistory'

const ProjectAnalytics: React.FC = () => {
  const totalProjects = historicalProjects.length
  const totalRevenue = historicalProjects.reduce((sum, p) => sum + p.totalCost, 0)
  const avgSuccessRate = historicalProjects.reduce((sum, p) => sum + p.successRate, 0) / totalProjects
  const successfulProjects = historicalProjects.filter(p => p.outcome === 'success').length

  const clientTypeStats = historicalProjects.reduce((acc, project) => {
    if (!acc[project.clientType]) {
      acc[project.clientType] = { count: 0, totalRevenue: 0, avgSuccessRate: 0 }
    }
    acc[project.clientType].count++
    acc[project.clientType].totalRevenue += project.totalCost
    acc[project.clientType].avgSuccessRate += project.successRate
    return acc
  }, {} as Record<string, { count: number; totalRevenue: number; avgSuccessRate: number }>)

  // Calcular promedios
  Object.keys(clientTypeStats).forEach(clientType => {
    clientTypeStats[clientType].avgSuccessRate = Math.round(
      clientTypeStats[clientType].avgSuccessRate / clientTypeStats[clientType].count
    )
  })

  const complexityStats = historicalProjects.reduce((acc, project) => {
    if (!acc[project.complexity]) {
      acc[project.complexity] = { count: 0, avgCost: 0, avgHours: 0 }
    }
    acc[project.complexity].count++
    acc[project.complexity].avgCost += project.totalCost
    acc[project.complexity].avgHours += project.totalHours
    return acc
  }, {} as Record<string, { count: number; avgCost: number; avgHours: number }>)

  // Calcular promedios
  Object.keys(complexityStats).forEach(complexity => {
    complexityStats[complexity].avgCost = Math.round(
      complexityStats[complexity].avgCost / complexityStats[complexity].count
    )
    complexityStats[complexity].avgHours = Math.round(
      complexityStats[complexity].avgHours / complexityStats[complexity].count
    )
  })

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={24} />
          Analytics de Proyectos
        </h2>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Target className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Proyectos</p>
                <p className="text-2xl font-bold text-blue-900">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-green-600 font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Award className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-purple-600 font-medium">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-purple-900">{Math.round(avgSuccessRate)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Users className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-orange-600 font-medium">Proyectos Exitosos</p>
                <p className="text-2xl font-bold text-orange-900">{successfulProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Type Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Tipo de Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(clientTypeStats).map(([clientType, stats]) => (
              <div key={clientType} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{clientType}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Proyectos:</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ingresos:</span>
                    <span className="font-medium">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Éxito:</span>
                    <span className="font-medium text-green-600">{stats.avgSuccessRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complexity Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Complejidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(complexityStats).map(([complexity, stats]) => {
              const complexityLabels = {
                low: 'Baja',
                medium: 'Media',
                high: 'Alta'
              }
              const complexityColors = {
                low: 'text-green-600 bg-green-100',
                medium: 'text-yellow-600 bg-yellow-100',
                high: 'text-red-600 bg-red-100'
              }
              
              return (
                <div key={complexity} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{complexityLabels[complexity as keyof typeof complexityLabels]}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${complexityColors[complexity as keyof typeof complexityColors]}`}>
                      {complexity}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Proyectos:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Costo Promedio:</span>
                      <span className="font-medium">${stats.avgCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Horas Promedio:</span>
                      <span className="font-medium">{stats.avgHours}h</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Recientes</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Proyecto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Costo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Éxito</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historicalProjects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{project.projectName}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{project.clientType}</td>
                      <td className="px-4 py-3 text-gray-700">${project.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-medium">{project.successRate}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          project.outcome === 'success' ? 'bg-green-100 text-green-800' :
                          project.outcome === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.outcome === 'success' ? 'Éxito' : 
                           project.outcome === 'partial' ? 'Parcial' : 'Fallo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectAnalytics 