import React, { useState } from 'react';
import { Palette, Type, AlignLeft, AlignCenter, AlignRight, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { StyleSettings } from '../store/useAppStore';

interface StylePanelProps {
  className?: string;
}

const themeColors = {
  pink: { primary: '#ec4899', secondary: '#f9a8d4', name: '粉色系' },
  blue: { primary: '#3b82f6', secondary: '#93c5fd', name: '蓝色系' },
  green: { primary: '#10b981', secondary: '#6ee7b7', name: '绿色系' },
  purple: { primary: '#8b5cf6', secondary: '#c4b5fd', name: '紫色系' },
  orange: { primary: '#f59e0b', secondary: '#fbbf24', name: '橙色系' },
};

const presetColors = [
  '#1f2937', '#374151', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export function StylePanel({ className = '' }: StylePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    styleSettings,
    updateStyleSettings,
    selectedElementId,
    elements,
    updateElement,
  } = useAppStore();

  const selectedElement = selectedElementId 
    ? elements.find(el => el.id === selectedElementId)
    : null;

  const handleThemeChange = (theme: keyof typeof themeColors) => {
    const colors = themeColors[theme];
    updateStyleSettings({
      theme,
      h1Color: colors.primary,
      h2Color: colors.secondary,
    });
  };

  const handleGlobalStyleChange = (updates: Partial<StyleSettings>) => {
    updateStyleSettings(updates);
  };

  const handleElementStyleChange = (updates: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, updates);
    }
  };

  const adjustElementFontSize = (delta: number) => {
    if (selectedElement) {
      const newSize = Math.max(8, Math.min(72, selectedElement.fontSize + delta));
      handleElementStyleChange({ fontSize: newSize });
    }
  };

  return (
    <div className={`bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">样式控制</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Global Styles */}
            <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">全局样式</h3>
          
          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">主题色彩</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themeColors).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key as keyof typeof themeColors)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    styleSettings.theme === key
                      ? 'border-gray-400 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="text-xs">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Global Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">全局字体大小</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="12"
                max="24"
                value={styleSettings.globalFontSize}
                onChange={(e) => handleGlobalStyleChange({ globalFontSize: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{styleSettings.globalFontSize}px</span>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">文字对齐</label>
            <div className="flex space-x-1">
              {[
                { value: 'left', icon: AlignLeft, label: '左对齐' },
                { value: 'center', icon: AlignCenter, label: '居中' },
                { value: 'right', icon: AlignRight, label: '右对齐' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => handleGlobalStyleChange({ textAlign: value as any })}
                  className={`p-2 rounded border ${
                    styleSettings.textAlign === value
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">行高</label>
            <select
              value={styleSettings.lineHeight}
              onChange={(e) => handleGlobalStyleChange({ lineHeight: e.target.value as any })}
              className="w-full p-2 border border-gray-200 rounded text-sm"
            >
              <option value="tight">紧密 (1.25)</option>
              <option value="normal">正常 (1.5)</option>
              <option value="loose">宽松 (1.75)</option>
            </select>
          </div>

          {/* Heading Colors */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-600">标题颜色</h4>
            
            {[
              { key: 'h1Color', label: 'H1 标题' },
              { key: 'h2Color', label: 'H2 标题' },
              { key: 'h3Color', label: 'H3 标题' },
              { key: 'boldColor', label: '粗体文字' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{label}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={styleSettings[key as keyof StyleSettings] as string}
                    onChange={(e) => handleGlobalStyleChange({ [key]: e.target.value })}
                    className="w-8 h-6 rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={styleSettings[key as keyof StyleSettings] as string}
                    onChange={(e) => handleGlobalStyleChange({ [key]: e.target.value })}
                    className="w-16 px-1 py-1 text-xs border border-gray-200 rounded"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Element Styles */}
        {selectedElement && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">元素样式</h3>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Type className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedElement.type === 'heading' ? `H${selectedElement.level} 标题` :
                   selectedElement.type === 'paragraph' ? '段落' :
                   selectedElement.type === 'list' ? '列表' :
                   selectedElement.type === 'blockquote' ? '引用' :
                   selectedElement.type === 'code' ? '代码' :
                   selectedElement.type === 'table' ? '表格' : '元素'}
                </span>
              </div>
              
              {/* Font Size */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">字体大小</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => adjustElementFontSize(-2)}
                    className="p-1 bg-white border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={selectedElement.fontSize}
                    onChange={(e) => handleElementStyleChange({ fontSize: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <button
                    onClick={() => adjustElementFontSize(2)}
                    className="p-1 bg-white border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-gray-500 w-8">{selectedElement.fontSize}px</span>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">文字颜色</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => handleElementStyleChange({ color: e.target.value })}
                    className="w-8 h-6 rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={selectedElement.color}
                    onChange={(e) => handleElementStyleChange({ color: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                </div>
                
                {/* Preset Colors */}
                <div className="grid grid-cols-10 gap-1 mt-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleElementStyleChange({ color })}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">背景颜色</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedElement.backgroundColor || '#ffffff'}
                    onChange={(e) => handleElementStyleChange({ backgroundColor: e.target.value })}
                    className="w-8 h-6 rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={selectedElement.backgroundColor || ''}
                    onChange={(e) => handleElementStyleChange({ backgroundColor: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                    placeholder="透明"
                  />
                  <button
                    onClick={() => handleElementStyleChange({ backgroundColor: undefined })}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    清除
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">对齐方式</label>
                <div className="flex space-x-1">
                  {[
                    { value: 'left', icon: AlignLeft, label: '左对齐' },
                    { value: 'center', icon: AlignCenter, label: '居中' },
                    { value: 'right', icon: AlignRight, label: '右对齐' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleElementStyleChange({ textAlign: value })}
                      className={`p-2 rounded border ${
                        selectedElement.textAlign === value
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700">快捷操作</h3>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• 双击元素进行编辑</div>
            <div>• Delete 键删除选中元素</div>
            <div>• Ctrl+Z/Y 撤销重做</div>
            <div>• 拖拽调整位置和大小</div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}