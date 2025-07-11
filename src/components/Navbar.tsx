import React from 'react'

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              GUX Hackathon – Cotizador v0
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Herramienta Interna
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 