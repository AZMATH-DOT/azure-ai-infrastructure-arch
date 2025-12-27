
import React, { useState } from 'react';
import { 
  Menu, Bell, Settings, Search, ChevronRight, 
  ExternalLink, Github, Info, Cpu
} from 'lucide-react';
import { NAV_ITEMS, SNIPPETS } from './constants';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { CodeViewer } from './components/CodeViewer';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { AIChatbot } from './components/AIChatbot';
import { ArchitectSandbox } from './components/ArchitectSandbox';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">System Architecture</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Info size={14} />
                Interactive Diagram
              </div>
            </div>
            <ArchitectureDiagram />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Model Serving</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilizing Azure Kubernetes Service (AKS) for scalable model endpoints. Each service is encapsulated in an optimized Docker container.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">ML Lifecycle</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Azure Machine Learning provides the control plane for experiments, model versions, and automated pipeline orchestration.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Observability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Full-stack monitoring with Grafana and Prometheus integrated into AKS, providing real-time insights into model performance and infrastructure health.
              </p>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'sandbox') {
      return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-14rem)]">
          <ArchitectSandbox />
        </div>
      );
    }

    if (activeTab === 'monitoring') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Real-time Observability</h2>
            <button className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2">
              Launch Grafana <ExternalLink size={14} />
            </button>
          </div>
          <MonitoringDashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <CodeViewer snippet={SNIPPETS.monitoring[0]} />
            <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Settings size={18} className="text-indigo-400" />
                Monitoring Insights
              </h3>
              <ul className="space-y-4">
                {[
                  { title: 'Scrape Frequency', desc: 'Prometheus pulls metrics every 15s from AKS pods.' },
                  { title: 'Azure Monitor Logs', desc: 'Aggregated logs from App Insights for deep trace analysis.' },
                  { title: 'Custom Metrics', desc: 'ML-specific KPIs like prediction drift and model accuracy tracked via custom exporters.' },
                  { title: 'Alerting', desc: 'Critical alerts configured in Grafana with PagerDuty integration.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Default: Code-heavy pages (Containers, Pipelines, Security, Cost)
    const pageSnippets = SNIPPETS[activeTab] || [];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 h-[calc(100vh-12rem)] min-h-[600px]">
        <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
          {pageSnippets.map((snippet) => (
            <div key={snippet.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {snippet.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4">{snippet.description}</p>
              <div className="h-[400px]">
                <CodeViewer snippet={snippet} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm h-full flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-6">
            <Github size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Infrastructure as Code</h3>
          <p className="text-slate-600 max-w-sm mb-8">
            All components are managed through Terraform and standardized YAML manifests, ensuring reproducible and secure AI environments.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">
              View Repo
            </button>
            <button className="px-6 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
              Documentation
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Cpu size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-slate-800 text-sm leading-tight">AI Infra</h1>
              <p className="text-[10px] text-slate-500 font-medium">Architect Showcase</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
            {isSidebarOpen && <span className="text-sm font-semibold">Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search architecture..." 
              className="bg-transparent border-none text-sm w-full focus:outline-none text-slate-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl relative">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">Architect</p>
                <p className="text-[10px] text-slate-500 font-medium">Infrastructure Lead</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://picsum.photos/100/100" alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
              <span>Azure AI Infra</span>
              <ChevronRight size={12} />
              <span className="text-slate-400">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                </h1>
                <p className="text-slate-600 text-sm max-w-2xl">
                  {activeTab === 'sandbox' ? "Experiment with multi-modal Gemini models for infrastructure visualization and analysis." : `Deep dive into the ${activeTab} layer of our high-performance AI infrastructure on Azure.`}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                   Download Specs
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  Deploy Stack
                </button>
              </div>
            </div>

            <hr className="border-slate-200" />

            {renderContent()}
          </div>
        </div>
      </main>

      {/* AI Assistant */}
      <AIChatbot />

    </div>
  );
};

export default App;
