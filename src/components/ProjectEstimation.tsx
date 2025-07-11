import React, { useState, useEffect } from 'react'
import { Plus, Trash2, DollarSign, Clock, Brain } from 'lucide-react'
import { getProjectRecommendation, ProjectRecommendation } from '../data/projectHistory'
import ProjectRecommendationComponent from './ProjectRecommendation'

interface Role {
  id: string
  name: string
  hourlyRate: number
  hours: number
}

interface ProjectData {
  projectName: string
  clientType: string
  services: string[]
  estimatedHours: number
  startDate: string
  deadline: string
  roles: Role[]
}

const ProjectEstimation: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: '',
    clientType: '',
    services: [],
    estimatedHours: 0,
    startDate: '',
    deadline: '',
    roles: [
      { id: '1', name: 'UX Designer', hourlyRate: 50, hours: 0 },
      { id: '2', name: 'Developer', hourlyRate: 60, hours: 0 },
      { id: '3', name: 'Project Manager', hourlyRate: 45, hours: 0 }
    ]
  })

  const [recommendation, setRecommendation] = useState<ProjectRecommendation | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)

  const clientTypes = [
    'Startup',
    'Empresa Mediana',
    'Corporación',
    'Organización sin fines de lucro',
    'Gobierno'
  ]

  const availableServices = [
    'Diseño UX/UI',
    'Desarrollo Frontend',
    'Desarrollo Backend',
    'Desarrollo Full Stack',
    'Consultoría',
    'Testing QA',
    'DevOps',
    'Análisis de Datos'
  ]

  const addRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: '',
      hourlyRate: 0,
      hours: 0
    }
    setProjectData(prev => ({
      ...prev,
      roles: [...prev.roles, newRole]
    }))
  }

  const removeRole = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== id)
    }))
  }

  const updateRole = (id: string, field: keyof Role, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      roles: prev.roles.map(role =>
        role.id === id ? { ...role, [field]: value } : role
      )
    }))
  }

  const totalCost = projectData.roles.reduce((sum, role) => {
    return sum + (role.hourlyRate * role.hours)
  }, 0)

  const totalHours = projectData.roles.reduce((sum, role) => {
    return sum + role.hours
  }, 0)

  // Generar recomendación cuando cambien los datos relevantes
  useEffect(() => {
    if (projectData.clientType && projectData.services.length > 0 && projectData.estimatedHours > 0) {
      const newRecommendation = getProjectRecommendation(
        projectData.clientType,
        projectData.services,
        projectData.estimatedHours
      )
      setRecommendation(newRecommendation)
    }
  }, [projectData.clientType, projectData.services, projectData.estimatedHours])

  const applyRecommendation = (template: string, hours: number, cost: number) => {
    // Distribuir las horas recomendadas entre los roles existentes
    const roles = [...projectData.roles]
    const avgHoursPerRole = Math.round(hours / roles.length)
    
    roles.forEach((role, index) => {
      if (index === roles.length - 1) {
        // El último rol toma las horas restantes
        role.hours = hours - (avgHoursPerRole * (roles.length - 1))
      } else {
        role.hours = avgHoursPerRole
      }
    })

    setProjectData(prev => ({
      ...prev,
      estimatedHours: hours,
      roles
    }))

    setShowRecommendation(false)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Estimación de Proyecto
        </h2>

        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              className="input-field"
              value={projectData.projectName}
              onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="Ej: Rediseño de E-commerce"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cliente
            </label>
            <select
              className="input-field"
              value={projectData.clientType}
              onChange={(e) => setProjectData(prev => ({ ...prev, clientType: e.target.value }))}
            >
              <option value="">Seleccionar tipo de cliente</option>
              {clientTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios
            </label>
            <select
              multiple
              className="input-field h-32"
              value={projectData.services}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setProjectData(prev => ({ ...prev, services: selected }))
              }}
            >
              {availableServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples servicios
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Estimadas
              </label>
              <input
                type="number"
                className="input-field"
                value={projectData.estimatedHours}
                onChange={(e) => setProjectData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                className="input-field"
                value={projectData.startDate}
                onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Entrega
            </label>
            <input
              type="date"
              className="input-field"
              value={projectData.deadline}
              onChange={(e) => setProjectData(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
        </div>

        {/* Roles and Rates Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Roles y Tarifas
            </h3>
            <button
              onClick={addRole}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Rol
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Rol
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Tarifa por Hora ($)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Horas
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Subtotal ($)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectData.roles.map((role) => (
                  <tr key={role.id}>
                    <td className="border border-gray-200 px-4 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={role.name}
                        onChange={(e) => updateRole(role.id, 'name', e.target.value)}
                        placeholder="Nombre del rol"
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={role.hourlyRate}
                        onChange={(e) => updateRole(role.id, 'hourlyRate', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={role.hours}
                        onChange={(e) => updateRole(role.id, 'hours', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      ${(role.hourlyRate * role.hours).toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        onClick={() => removeRole(role.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={projectData.roles.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendation */}
        {recommendation && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="text-blue-600" size={20} />
                Recomendación Inteligente
              </h3>
              <button
                onClick={() => setShowRecommendation(!showRecommendation)}
                className="btn-secondary"
              >
                {showRecommendation ? 'Ocultar' : 'Ver'} Recomendación
              </button>
            </div>
            {showRecommendation && (
              <ProjectRecommendationComponent
                recommendation={recommendation}
                clientType={projectData.clientType}
                onApplyRecommendation={applyRecommendation}
              />
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Estimación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total de Horas</p>
                <p className="text-xl font-bold text-gray-900">{totalHours}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-gray-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-xl font-bold text-green-600">
                  ${totalCost.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-gray-500" size={20} />
              <div>
                <p className="text-sm text-gray-600">Costo Promedio por Hora</p>
                <p className="text-xl font-bold text-blue-600">
                  ${totalHours > 0 ? (totalCost / totalHours).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectEstimation 