import React, { useState } from 'react';
import { 
  Palette, Layers, Circle, ChevronDown, ChevronRight, 
  Square, Sparkles, Frame, Grid, Shuffle 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { BackgroundSettings } from '../store/useAppStore';

interface BackgroundPanelProps {
  className?: string;
}

// 小红书风格背景预设
const backgroundPresets = {
  solid: [
    { name: '纯白经典', color: '#ffffff' },
    { name: '温暖米色', color: '#faf7f2' },
    { name: '淡雅粉色', color: '#fef2f2' },
    { name: '清新绿色', color: '#f0fdf4' },
    { name: '优雅蓝色', color: '#eff6ff' },
    { name: '高级灰色', color: '#f8fafc' },
    { name: '活力橙色', color: '#fff7ed' },
    { name: '神秘紫色', color: '#faf5ff' }
  ],
  gradient: [
    {
      name: '日出橙粉',
      direction: 'to bottom right',
      colors: ['#fed7aa', '#fecaca']
    },
    {
      name: '海洋蓝绿',
      direction: 'to bottom right',
      colors: ['#bfdbfe', '#a7f3d0']
    },
    {
      name: '薰衣草紫',
      direction: 'to bottom',
      colors: ['#e9d5ff', '#fde2e7']
    },
    {
      name: '柠檬黄绿',
      direction: 'to bottom right',
      colors: ['#fef3c7', '#d9f99d']
    },
    {
      name: '珊瑚粉橙',
      direction: 'to bottom',
      colors: ['#fed7d7', '#fed7aa']
    },
    {
      name: '天空蓝白',
      direction: 'to bottom',
      colors: ['#dbeafe', '#f8fafc']
    }
  ]
};

// 美化主题预设
const beautifyThemes = [
  {
    name: '简约清新',
    background: { type: 'solid' as const, solidColor: '#ffffff' },
    border: { enabled: true, width: 1, color: '#e5e7eb', style: 'solid' as const, radius: 12 },
    shadow: { enabled: true, x: 0, y: 2, blur: 8, color: '#000000', opacity: 0.1 },
    pattern: { enabled: false, type: 'dots' as const, color: '#f3f4f6', opacity: 0.3, size: 20 },
    frame: { enabled: false, type: 'simple' as const, color: '#374151', width: 8 }
  },
  {
    name: '温馨粉色',
    background: { type: 'gradient' as const, gradientColors: ['#fef2f2', '#fce7f3'], gradientDirection: 'to bottom right' },
    border: { enabled: true, width: 2, color: '#f472b6', style: 'solid' as const, radius: 16 },
    shadow: { enabled: true, x: 0, y: 4, blur: 12, color: '#ec4899', opacity: 0.2 },
    pattern: { enabled: true, type: 'dots' as const, color: '#fef2f2', opacity: 0.4, size: 30 },
    frame: { enabled: false, type: 'simple' as const, color: '#374151', width: 8 }
  },
  {
    name: '商务蓝调',
    background: { type: 'gradient' as const, gradientColors: ['#eff6ff', '#dbeafe'], gradientDirection: 'to bottom' },
    border: { enabled: true, width: 2, color: '#3b82f6', style: 'solid' as const, radius: 8 },
    shadow: { enabled: true, x: 0, y: 6, blur: 16, color: '#1e40af', opacity: 0.15 },
    pattern: { enabled: false, type: 'dots' as const, color: '#f3f4f6', opacity: 0.3, size: 20 },
    frame: { enabled: true, type: 'elegant' as const, color: '#1e40af', width: 4 }
  },
  {
    name: '复古文艺',
    background: { type: 'solid' as const, solidColor: '#faf7f2' },
    border: { enabled: true, width: 3, color: '#92400e', style: 'dashed' as const, radius: 0 },
    shadow: { enabled: true, x: 4, y: 4, blur: 0, color: '#92400e', opacity: 0.3 },
    pattern: { enabled: true, type: 'grid' as const, color: '#fbbf24', opacity: 0.2, size: 40 },
    frame: { enabled: true, type: 'vintage' as const, color: '#92400e', width: 12 }
  },
  {
    name: '现代时尚',
    background: { type: 'gradient' as const, gradientColors: ['#f8fafc', '#f1f5f9'], gradientDirection: 'to bottom right' },
    border: { enabled: true, width: 1, color: '#64748b', style: 'solid' as const, radius: 20 },
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: '#334155', opacity: 0.12 },
    pattern: { enabled: true, type: 'diagonal' as const, color: '#e2e8f0', opacity: 0.3, size: 60 },
    frame: { enabled: true, type: 'modern' as const, color: '#475569', width: 2 }
  }
];

export function BackgroundPanel({ className = '' }: BackgroundPanelProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'border' | 'shadow' | 'pattern' | 'frame'>('background');
  const { backgroundSettings, updateBackgroundSettings, generateRandomBackground } = useAppStore();

  const handleTypeChange = (type: 'solid' | 'gradient') => {
    updateBackgroundSettings({ type });
  };

  const handleSolidColorChange = (color: string) => {
    updateBackgroundSettings({ 
      type: 'solid',
      solidColor: color 
    });
  };

  const handleGradientPreset = (direction: string, colors: string[]) => {
    updateBackgroundSettings({
      type: 'gradient',
      gradientType: 'linear',
      gradientDirection: direction,
      gradientColors: colors
    });
  };

  // 美化主题应用函数
  const applyBeautifyTheme = (theme: typeof beautifyThemes[0]) => {
    const updates: Partial<BackgroundSettings> = {
      type: theme.background.type as 'solid' | 'gradient',
      border: { ...backgroundSettings.border, ...theme.border },
      shadow: { ...backgroundSettings.shadow, ...theme.shadow },
      pattern: { ...backgroundSettings.pattern, ...theme.pattern },
      frame: { ...backgroundSettings.frame, ...theme.frame }
    };

    if (theme.background.type === 'solid') {
      updates.solidColor = theme.background.solidColor;
    } else {
      updates.gradientColors = theme.background.gradientColors;
      updates.gradientDirection = theme.background.gradientDirection;
    }

    updateBackgroundSettings(updates);
  };

  // 边框设置更新
  const updateBorderSettings = (updates: Partial<BackgroundSettings['border']>) => {
    updateBackgroundSettings({
      border: { ...backgroundSettings.border, ...updates }
    });
  };

  // 阴影设置更新
  const updateShadowSettings = (updates: Partial<BackgroundSettings['shadow']>) => {
    updateBackgroundSettings({
      shadow: { ...backgroundSettings.shadow, ...updates }
    });
  };

  // 图案设置更新
  const updatePatternSettings = (updates: Partial<BackgroundSettings['pattern']>) => {
    updateBackgroundSettings({
      pattern: { ...backgroundSettings.pattern, ...updates }
    });
  };

  // 相框设置更新
  const updateFrameSettings = (updates: Partial<BackgroundSettings['frame']>) => {
    updateBackgroundSettings({
      frame: { ...backgroundSettings.frame, ...updates }
    });
  };

  return (
    <div className={`p-5 space-y-5 ${className}`}>
            {/* 背景快捷按钮 */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={generateRandomBackground}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm"
          >
            <Shuffle className="w-4 h-4" />
            <span className="font-medium">随机背景</span>
          </button>
          
          <button
            onClick={() => {
              updateBackgroundSettings({
                type: 'gradient',
                gradientType: 'linear',
                gradientDirection: 'to bottom right',
                gradientColors: ['#f8fafc', '#f1f5f9'],
                border: {
                  enabled: true,
                  width: 2,
                  color: '#e2e8f0',
                  style: 'solid',
                  radius: 12
                },
                shadow: {
                  enabled: true,
                  x: 0,
                  y: 4,
                  blur: 16,
                  color: '#000000',
                  opacity: 0.08
                },
                pattern: { enabled: false, type: 'dots', color: '#f3f4f6', opacity: 0.3, size: 20 },
                frame: { enabled: false, type: 'simple', color: '#374151', width: 8 }
              });
            }}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">默认背景</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center">随机背景：自动生成多样化效果｜默认背景：固定的优雅浅色搭配</p>
      </div>

            {/* 美化主题预设 */}
            <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-600">主题预设</label>
              <div className="grid grid-cols-1 gap-2">
                {beautifyThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => applyBeautifyTheme(theme)}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{
                        background: theme.background.type === 'solid' 
                          ? theme.background.solidColor
                          : `linear-gradient(${theme.background.gradientDirection}, ${theme.background.gradientColors?.join(', ')})`
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{theme.name}</div>
                      <div className="text-xs text-gray-500">
                        {theme.border.enabled ? '边框' : ''} 
                        {theme.shadow.enabled ? ' 阴影' : ''} 
                        {theme.pattern.enabled ? ' 图案' : ''} 
                        {theme.frame.enabled ? ' 相框' : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 选项卡 */}
            <div className="border-t pt-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'background', label: '背景', icon: Palette },
                  { key: 'border', label: '边框', icon: Square },
                  { key: 'shadow', label: '阴影', icon: Layers },
                  { key: 'pattern', label: '图案', icon: Grid },
                  { key: 'frame', label: '相框', icon: Frame }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 背景设置 */}
            {activeTab === 'background' && (
              <div className="space-y-4">
            {/* Background Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTypeChange('solid')}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
              backgroundSettings.type === 'solid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Circle className="w-3 h-3" />
            <span>纯色</span>
          </button>
          <button
            onClick={() => handleTypeChange('gradient')}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
              backgroundSettings.type === 'gradient'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>渐变</span>
          </button>
        </div>

        {/* Solid Color Presets */}
        {backgroundSettings.type === 'solid' && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-600">纯色背景</label>
            <div className="grid grid-cols-4 gap-2">
              {backgroundPresets.solid.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSolidColorChange(preset.color)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                    backgroundSettings.solidColor === preset.color
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={backgroundSettings.solidColor}
                onChange={(e) => handleSolidColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-600">自定义颜色</span>
            </div>
          </div>
        )}

        {/* Gradient Presets */}
        {backgroundSettings.type === 'gradient' && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-600">渐变背景</label>
            <div className="grid grid-cols-2 gap-2">
              {backgroundPresets.gradient.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleGradientPreset(preset.direction, preset.colors)}
                  className={`aspect-video rounded-lg border-2 transition-all hover:scale-105 ${
                    JSON.stringify(backgroundSettings.gradientColors) === JSON.stringify(preset.colors)
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    background: `linear-gradient(${preset.direction}, ${preset.colors.join(', ')})`
                  }}
                  title={preset.name}
                >
                  <div className="text-xs text-white text-shadow font-medium p-1">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
              </div>
            )}

            {/* 边框设置 */}
            {activeTab === 'border' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">启用边框</label>
                  <button
                    onClick={() => updateBorderSettings({ enabled: !backgroundSettings.border.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      backgroundSettings.border.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backgroundSettings.border.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {backgroundSettings.border.enabled && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">边框宽度: {backgroundSettings.border.width}px</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={backgroundSettings.border.width}
                        onChange={(e) => updateBorderSettings({ width: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">边框样式</label>
                      <select
                        value={backgroundSettings.border.style}
                        onChange={(e) => updateBorderSettings({ style: e.target.value as any })}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="solid">实线</option>
                        <option value="dashed">虚线</option>
                        <option value="dotted">点线</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">圆角大小: {backgroundSettings.border.radius}px</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={backgroundSettings.border.radius}
                        onChange={(e) => updateBorderSettings({ radius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">边框颜色</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.border.color}
                          onChange={(e) => updateBorderSettings({ color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">{backgroundSettings.border.color}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 阴影设置 */}
            {activeTab === 'shadow' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">启用阴影</label>
                  <button
                    onClick={() => updateShadowSettings({ enabled: !backgroundSettings.shadow.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      backgroundSettings.shadow.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backgroundSettings.shadow.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {backgroundSettings.shadow.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">水平偏移: {backgroundSettings.shadow.x}px</label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={backgroundSettings.shadow.x}
                          onChange={(e) => updateShadowSettings({ x: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">垂直偏移: {backgroundSettings.shadow.y}px</label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={backgroundSettings.shadow.y}
                          onChange={(e) => updateShadowSettings({ y: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">模糊程度: {backgroundSettings.shadow.blur}px</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={backgroundSettings.shadow.blur}
                        onChange={(e) => updateShadowSettings({ blur: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">透明度: {Math.round(backgroundSettings.shadow.opacity * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={backgroundSettings.shadow.opacity}
                        onChange={(e) => updateShadowSettings({ opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">阴影颜色</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.shadow.color}
                          onChange={(e) => updateShadowSettings({ color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">{backgroundSettings.shadow.color}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 图案设置 */}
            {activeTab === 'pattern' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">启用图案</label>
                  <button
                    onClick={() => updatePatternSettings({ enabled: !backgroundSettings.pattern.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      backgroundSettings.pattern.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backgroundSettings.pattern.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {backgroundSettings.pattern.enabled && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">图案类型</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'dots', label: '圆点' },
                          { key: 'grid', label: '网格' },
                          { key: 'diagonal', label: '斜线' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => updatePatternSettings({ type: key as any })}
                            className={`py-2 px-3 text-xs rounded border transition-colors ${
                              backgroundSettings.pattern.type === key
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">图案大小: {backgroundSettings.pattern.size}px</label>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={backgroundSettings.pattern.size}
                        onChange={(e) => updatePatternSettings({ size: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">透明度: {Math.round(backgroundSettings.pattern.opacity * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={backgroundSettings.pattern.opacity}
                        onChange={(e) => updatePatternSettings({ opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">图案颜色</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.pattern.color}
                          onChange={(e) => updatePatternSettings({ color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">{backgroundSettings.pattern.color}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 相框设置 */}
            {activeTab === 'frame' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">启用相框</label>
                  <button
                    onClick={() => updateFrameSettings({ enabled: !backgroundSettings.frame.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      backgroundSettings.frame.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backgroundSettings.frame.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {backgroundSettings.frame.enabled && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">相框类型</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'simple', label: '简洁' },
                          { key: 'elegant', label: '优雅' },
                          { key: 'modern', label: '现代' },
                          { key: 'vintage', label: '复古' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => updateFrameSettings({ type: key as any })}
                            className={`py-2 px-3 text-xs rounded border transition-colors ${
                              backgroundSettings.frame.type === key
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">相框宽度: {backgroundSettings.frame.width}px</label>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={backgroundSettings.frame.width}
                        onChange={(e) => updateFrameSettings({ width: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">相框颜色</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.frame.color}
                          onChange={(e) => updateFrameSettings({ color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">{backgroundSettings.frame.color}</span>
                      </div>
            </div>
                  </>
                )}
              </div>
            )}
    </div>
  );
} 