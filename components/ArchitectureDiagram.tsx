import React from 'react';
import { Smartphone, Server, Database, Activity, ShieldCheck, Cpu, Lock } from 'lucide-react';

const Box: React.FC<{ title: string; items: string[]; icon: React.ReactNode; color: string }> = ({ title, items, icon, color }) => (
  <div className={`p-4 rounded-xl border-2 ${color} bg-white shadow-sm flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-1 w-full max-w-[280px]`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-100')} text-slate-700`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const Arrow: React.FC<{ vertical?: boolean; label?: string }> = ({ vertical, label }) => (
  <div className={`flex ${vertical ? 'flex-col items-center h-10' : 'items-center px-2 flex-1'} relative`}>
    <div className={`${vertical ? 'w-0.5 h-full' : 'h-0.5 w-full'} bg-slate-300 relative`}>
      <div className={`absolute ${vertical ? 'bottom-0 left-1/2 -translate-x-1/2' : 'right-0 top-1/2 -translate-y-1/2'} w-2.5 h-2.5 bg-slate-300 rotate-45 border-t-2 border-r-2 border-transparent border-slate-300`} />
    </div>
    {label && (
      <span className={`absolute text-[10px] font-bold text-slate-400 bg-slate-50 px-1 ${vertical ? 'left-4 top-1/2 -translate-y-1/2' : 'top-[-12px] left-1/2 -translate-x-1/2'}`}>
        {label}
      </span>
    )}
  </div>
);

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto p-8 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="min-w-[900px] flex flex-col items-center gap-2">
        
        {/* Client Layer */}
        <Box 
          title="Client Layer" 
          items={["Web Apps", "Mobile Apps", "Third-party APIs"]} 
          icon={<Smartphone size={18} />} 
          color="border-blue-500"
        />
        
        <Arrow vertical label="HTTPS/SSL" />

        {/* API Gateway Layer */}
        <div className="w-full flex justify-center items-center gap-4">
           <Box 
            title="API Management (APIM)" 
            items={["Auth (OIDC/JWT)", "Rate Limiting", "API Keys", "Caching"]} 
            icon={<Lock size={18} />} 
            color="border-indigo-600"
          />
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase">Gateway Policy Enforcement</div>
          </div>
        </div>

        <Arrow vertical label="VNet Routing" />

        {/* Compute & Orchestration Layer */}
        <div className="w-full flex justify-between items-start gap-8 px-4">
          <div className="flex-1 flex flex-col gap-4">
            <Box 
              title="AKS Model Serving" 
              items={["K8s ClusterIP Services", "Horizontal Pod Autoscaler", "Nginx Ingress Controller"]} 
              icon={<Server size={18} />} 
              color="border-emerald-500"
            />
          </div>
          
          <div className="flex items-center self-center py-4">
            <Arrow label="Model Sync" />
          </div>

          <div className="flex-1">
            <Box 
              title="Azure ML Workspace" 
              items={["Experiment Management", "Pipeline Step Orch", "Secured Model Registry"]} 
              icon={<Cpu size={18} />} 
              color="border-purple-500"
            />
          </div>
        </div>

        <Arrow vertical />

        {/* Data & Security Layer */}
        <div className="flex gap-8">
          <Box 
            title="Secure Storage" 
            items={["Data Lake Gen2 (RBAC)", "Azure Key Vault", "Private Link Blob"]} 
            icon={<Database size={18} />} 
            color="border-amber-500"
          />
          <Box 
            title="Observability Stack" 
            items={["Grafana (AKS Metrics)", "Prometheus (Scraping)", "Log Analytics"]} 
            icon={<Activity size={18} />} 
            color="border-rose-500"
          />
        </div>

      </div>
    </div>
  );
};