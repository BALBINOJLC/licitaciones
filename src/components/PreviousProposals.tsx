import React, { useState } from 'react'
import { Eye, Download, Edit, Trash2, Search, Filter, FileText } from 'lucide-react'

interface Proposal {
  id: string
  projectName: string
  client: string
  date: string
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  cost: number
  template: string
}

const PreviousProposals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Datos de ejemplo
  const [proposals] = useState<Proposal[]>([
    {
      id: '1',
      projectName: 'Rediseño de E-commerce',
      client: 'TechCorp',
      date: '2024-01-15',
      status: 'sent',
      cost: 25000,
      template: 'Propuesta Detallada'
    },
    {
      id: '2',
      projectName: 'App Móvil de Delivery',
      client: 'FoodExpress',
      date: '2024-01-10',
      status: 'approved',
      cost: 1000,
      template: 'Propuesta Startup'
    },
    {
      id: '3',
      projectName: 'Sistema de Gestión ERP',
      client: 'Manufacturing Inc',
      date: '2024-01-05',
      status: 'draft',
      cost: 3500,
      template: 'Propuesta Básica'
    },
    {
      id: '4',
      projectName: 'Portal Web Corporativo',
      client: 'Global Solutions',
      date: '2023-12-20',
      status: 'rejected',
      cost: 2500,
      template: 'Propuesta Detallada'
    },
    {
      id: '5',
      projectName: 'Dashboard Analytics',
      client: 'DataFlow',
      date: '2023-12-15',
      status: 'approved',
      cost: 3400,
      template: 'Propuesta Startup'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador'
      case 'sent':
        return 'Enviada'
      case 'approved':
        return 'Aprobada'
      case 'rejected':
        return 'Rechazada'
      default:
        return status
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const viewProposal = (id: string) => {
    alert(`Vista previa de propuesta ${id}`)
  }

  const downloadProposal = (id: string) => {
    alert(`Descargando propuesta ${id}`)
  }

  const editProposal = (id: string) => {
    alert(`Editando propuesta ${id}`)
  }

  const deleteProposal = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) {
      alert(`Propuesta ${id} eliminada`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Propuestas Anteriores
        </h2>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por proyecto o cliente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={20} />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Proyecto
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Cliente
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Fecha
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Estado
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Costo ($)
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Plantilla
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-900">{proposal.projectName}</div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">
                    {proposal.client}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">
                    {new Date(proposal.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">
                    ${proposal.cost.toLocaleString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">
                    {proposal.template}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewProposal(proposal.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Ver propuesta"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => downloadProposal(proposal.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => editProposal(proposal.id)}
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Editar propuesta"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProposal(proposal.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar propuesta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron propuestas
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primera propuesta en la sección de Generador de Propuestas'
              }
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {filteredProposals.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {filteredProposals.length}
              </div>
              <div className="text-sm text-blue-700">Total de Propuestas</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                ${filteredProposals.reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Valor Total</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {filteredProposals.filter(p => p.status === 'approved').length}
              </div>
              <div className="text-sm text-purple-700">Aprobadas</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {filteredProposals.filter(p => p.status === 'sent').length}
              </div>
              <div className="text-sm text-orange-700">Enviadas</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PreviousProposals 