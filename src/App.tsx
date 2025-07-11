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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "proposal" && <ProposalGenerator />}
        </div>
      </div>
    </div>
  );
}

export default App;
