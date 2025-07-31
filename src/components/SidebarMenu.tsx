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
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-2">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-white" />
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
              relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
              group
            `}
            title={item.description}
          >
            <Icon className="w-5 h-5" />
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-full" />
            )}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
              <div className="text-gray-300 text-xs">{item.description}</div>
            </div>
          </button>
        );
      })}
      
      {/* Divider */}
      <div className="w-8 h-px bg-gray-700 my-4" />
      
      {/* Settings */}
      <button
        className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 group"
        title="设置"
      >
        <Settings className="w-5 h-5" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          设置
        </div>
      </button>
    </div>
  );
}