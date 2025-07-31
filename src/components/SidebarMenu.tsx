import React from 'react';
import { 
  FileText, 
  Palette, 
  Settings, 
  Download, 
  Layers, 
  Image,
  Grid,
  Plus
} from 'lucide-react';

export type MenuTab = 
  | 'elements' 
  | 'pages' 
  | 'background' 
  | 'format' 
  | 'style' 
  | 'export';

interface SidebarMenuProps {
  activeTab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
}

interface MenuItem {
  id: MenuTab;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'elements',
    icon: Plus,
    label: '元素',
    description: '添加和管理元素'
  },
  {
    id: 'pages',
    icon: Layers,
    label: '分页',
    description: '页面分割设置'
  },
  {
    id: 'background',
    icon: Image,
    label: '背景',
    description: '背景样式设置'
  },
  {
    id: 'format',
    icon: Grid,
    label: '格式',
    description: '画布尺寸设置'
  },
  {
    id: 'style',
    icon: Palette,
    label: '样式',
    description: '全局样式设置'
  },
  {
    id: 'export',
    icon: Download,
    label: '导出',
    description: '图片导出功能'
  }
];

export function SidebarMenu({ activeTab, onTabChange }: SidebarMenuProps) {
  return (
    <div className="w-16 bg-slate-800 flex flex-col items-center py-4 space-y-1 border-r border-slate-700/50">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
        <FileText className="w-5 h-5 text-white" />
      </div>
      
      {/* Menu Items */}
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-out
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/80 hover:scale-105'
              }
              group
            `}
            title={item.description}
          >
            <Icon className="w-4.5 h-4.5" />
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-full shadow-sm" />
            )}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
              <div className="font-medium">{item.label}</div>
              <div className="text-slate-300 text-xs mt-0.5">{item.description}</div>
              {/* Tooltip arrow */}
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900"></div>
            </div>
          </button>
        );
      })}
      
      {/* Divider */}
      <div className="w-6 h-px bg-slate-600/50 my-4" />
      
      {/* Settings */}
      <button
        className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 hover:scale-105 transition-all duration-300 ease-out group"
        title="设置"
      >
        <Settings className="w-4.5 h-4.5" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
          <div className="font-medium">设置</div>
          <div className="text-slate-300 text-xs mt-0.5">应用设置和偏好</div>
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900"></div>
        </div>
      </button>
    </div>
  );
}