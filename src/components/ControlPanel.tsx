import React from 'react';
import { MenuTab } from './SidebarMenu';
import { AddElementPanel } from './AddElementPanel';
import { PageSplitPanel } from './PageSplitPanel';
import { BackgroundPanel } from './BackgroundPanel';
import { CanvasFormatPanel } from './CanvasFormatPanel';
import { StylePanel } from './StylePanel';
import { ExportPanel } from './ExportPanel';
import { ElementEditPanel } from './ElementEditPanel';
import { AISettingsPanel } from './AISettingsPanel';
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
  },
  ai: {
    title: 'AI设置',
    icon: Edit3,
    component: AISettingsPanel
  }
};

export function ControlPanel({ activeTab }: ControlPanelProps) {
  const { selectedElementId } = useAppStore();
  
  // 如果有选中的元素，显示元素编辑面板
  if (selectedElementId) {
    return (
      <div className="w-80 flex flex-col border-r border-slate-200/60 bg-white shadow-sm">
        <ElementEditPanel />
      </div>
    );
  }
  
  // 否则显示对应的功能面板
  const config = tabConfigs[activeTab];
  const Component = config.component;
  
  return (
    <div className="w-80 flex flex-col border-r border-slate-200/60 bg-white shadow-sm">
      {/* Panel Header */}
      <div className="flex items-center px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-50/80 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-sm"></div>
          <div>
            <span className="text-sm font-semibold text-slate-800">{config.title}</span>
            <div className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'elements' && '添加和管理内容元素'}
              {activeTab === 'pages' && '智能分页和页面导航'}
              {activeTab === 'background' && '画布背景和装饰效果'}
              {activeTab === 'format' && '画布尺寸和缩放设置'}
              {activeTab === 'style' && '全局样式和主题配色'}
              {activeTab === 'export' && '高质量图片导出'}
              {activeTab === 'ai' && 'AI助手配置和模型设置'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <Component />
      </div>
    </div>
  );
}