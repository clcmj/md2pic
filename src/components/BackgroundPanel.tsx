import React, { useState } from 'react';
import { Palette, Layers, Circle, ChevronDown, ChevronRight } from 'lucide-react';
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

export function BackgroundPanel({ className = '' }: BackgroundPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { backgroundSettings, updateBackgroundSettings } = useAppStore();

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

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-medium text-gray-700">背景设置</h3>
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

            {/* Current Background Info */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
              当前背景: {backgroundSettings.type === 'solid' ? '纯色' : '渐变'}
              {backgroundSettings.type === 'solid' 
                ? ` (${backgroundSettings.solidColor})`
                : ` (${backgroundSettings.gradientColors?.join(' → ')})`
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
} 