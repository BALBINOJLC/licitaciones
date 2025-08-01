import { useState } from "react";
import Navbar from "./components/Navbar";
import ProposalGenerator from "./components/ProposalGenerator";

type TabType = "proposal";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("proposal");

  const tabs = [
    { id: "proposal", label: "Generador de Propuestas", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl lg:text-3xl">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  GUX - Generador de Propuestas
                </h1>
                <p className="text-blue-100 text-sm lg:text-base mt-1">
                  Crea propuestas profesionales de forma rápida y fácil
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 text-blue-100 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation mejorado */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "bg-white/60 text-gray-600 hover:bg-white hover:text-gray-800 border border-gray-200/50 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content con mejor espaciado */}
        <div className="space-y-6">
          {activeTab === "proposal" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <ProposalGenerator />
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-600 text-sm">
              💡 <strong>Consejo:</strong> Carga un JSON de ejemplo para comenzar a crear tu propuesta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
