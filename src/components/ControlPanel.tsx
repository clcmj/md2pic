import React from 'react';
import { MenuTab } from './SidebarMenu';
import { AddElementPanel } from './AddElementPanel';
import { PageSplitPanel } from './PageSplitPanel';
import { BackgroundPanel } from './BackgroundPanel';
import { CanvasFormatPanel } from './CanvasFormatPanel';
import { StylePanel } from './StylePanel';
import { ExportPanel } from './ExportPanel';
import { ElementEditPanel } from './ElementEditPanel';
import { useAppStore } from '../store/useAppStore';
import { Edit3 } from 'lucide-react';

interface ControlPanelProps {
  activeTab: MenuTab;
}

interface TabConfig {
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const tabConfigs: Record<MenuTab, TabConfig> = {
  elements: {
    title: '添加元素',
    icon: Edit3,
    component: AddElementPanel
  },
  pages: {
    title: '页面分割',
    icon: Edit3,
    component: PageSplitPanel
  },
  background: {
    title: '背景设置',
    icon: Edit3,
    component: BackgroundPanel
  },
  format: {
    title: '画布格式',
    icon: Edit3,
    component: CanvasFormatPanel
  },
  style: {
    title: '样式设置',
    icon: Edit3,
    component: StylePanel
  },
  export: {
    title: '导出图片',
    icon: Edit3,
    component: ExportPanel
  }
};

export function ControlPanel({ activeTab }: ControlPanelProps) {
  const { selectedElementId } = useAppStore();
  
  // 如果有选中的元素，显示元素编辑面板
  if (selectedElementId) {
    return (
      <div className="w-80 flex flex-col border-r border-gray-200 bg-white">
        <ElementEditPanel />
      </div>
    );
  }
  
  // 否则显示对应的功能面板
  const config = tabConfigs[activeTab];
  const Component = config.component;
  
  return (
    <div className="w-80 flex flex-col border-r border-gray-200 bg-white">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">{config.title}</span>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        <Component />
      </div>
    </div>
  );
}