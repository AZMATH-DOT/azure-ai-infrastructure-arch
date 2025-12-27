
import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell 
} from 'recharts';

const data = [
  { time: '10:00', cpu: 45, mem: 60, latency: 45 },
  { time: '10:05', cpu: 52, mem: 62, latency: 48 },
  { time: '10:10', cpu: 48, mem: 65, latency: 52 },
  { time: '10:15', cpu: 61, mem: 68, latency: 85 },
  { time: '10:20', cpu: 55, mem: 70, latency: 60 },
  { time: '10:25', cpu: 42, mem: 66, latency: 42 },
  { time: '10:30', cpu: 38, mem: 63, latency: 38 },
];

const modelHealth = [
  { name: 'Model A', value: 99.8, color: '#10b981' },
  { name: 'Model B', value: 98.5, color: '#3b82f6' },
  { name: 'Inference Svc', value: 95.2, color: '#f59e0b' },
];

export const MonitoringDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      
      {/* Metrics Stat Cards */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cluster CPU', value: '54.2%', change: '+2.1%', trend: 'up' },
          { label: 'Cluster Memory', value: '12.8 GB', change: '-104MB', trend: 'down' },
          { label: 'Avg Latency', value: '42ms', change: '-5ms', trend: 'down' },
          { label: 'Requests/s', value: '1,248', change: '+12%', trend: 'up' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              <span className={`text-[10px] font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Resource Chart */}
      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          CPU & Memory Utilization (AKS)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="mem" stroke="#8b5cf6" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Availability / Performance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Model Availability
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelHealth} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569'}} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {modelHealth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
