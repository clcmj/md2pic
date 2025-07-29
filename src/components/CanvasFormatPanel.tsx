import React, { useState } from 'react';
import { Monitor, Smartphone, Square, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore, defaultCanvasFormats } from '../store/useAppStore';
import type { CanvasFormat } from '../store/useAppStore';

interface CanvasFormatPanelProps {
  className?: string;
}

export function CanvasFormatPanel({ className = '' }: CanvasFormatPanelProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  
  const {
    canvasFormat,
    setCanvasFormat,
    canvasScale,
    setCanvasScale,
  } = useAppStore();

  const handleFormatSelect = (format: CanvasFormat) => {
    setCanvasFormat(format);
    setShowCustom(false);
  };

  const handleCustomFormat = () => {
    const customFormat: CanvasFormat = {
      name: '自定义',
      width: customWidth,
      height: customHeight,
      description: `${customWidth}×${customHeight}`,
    };
    setCanvasFormat(customFormat);
    setShowCustom(false);
  };

  const handleScaleChange = (newScale: number) => {
    const clampedScale = Math.max(0.1, Math.min(2, newScale));
    setCanvasScale(clampedScale);
  };

  const getFormatIcon = (formatName: string) => {
    if (formatName.includes('小红书') || formatName.includes('朋友圈')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (formatName.includes('微博') || formatName.includes('Instagram')) {
      return <Square className="w-4 h-4" />;
    } else if (formatName.includes('Twitter')) {
      return <Monitor className="w-4 h-4" />;
    }
    return <Maximize className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">画布格式</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScaleChange(canvasScale - 0.1)}
              className="p-1 hover:bg-gray-100 rounded"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {Math.round(canvasScale * 100)}%
            </span>
            <button
              onClick={() => handleScaleChange(canvasScale + 0.1)}
              className="p-1 hover:bg-gray-100 rounded"
              title="放大"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scale Slider */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">缩放比例</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={canvasScale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Preset Formats */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">预设格式</label>
          <div className="grid grid-cols-1 gap-2">
            {defaultCanvasFormats.map((format) => (
              <button
                key={format.name}
                onClick={() => handleFormatSelect(format)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  canvasFormat.name === format.name && canvasFormat.width === format.width && canvasFormat.height === format.height
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${
                    canvasFormat.name === format.name && canvasFormat.width === format.width && canvasFormat.height === format.height
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getFormatIcon(format.name)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-900">{format.name}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                </div>
                
                {/* Aspect ratio preview */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="border border-gray-300 bg-white"
                    style={{
                      width: '24px',
                      height: `${24 * (format.height / format.width)}px`,
                      maxHeight: '32px',
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Format */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-600">自定义尺寸</label>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`text-xs px-2 py-1 rounded ${
                showCustom
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showCustom ? '收起' : '展开'}
            </button>
          </div>
          
          {showCustom && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">宽度 (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1080)}
                    min="100"
                    max="4000"
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">高度 (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1080)}
                    min="100"
                    max="4000"
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  比例: {(customWidth / customHeight).toFixed(2)}:1
                </div>
                <button
                  onClick={handleCustomFormat}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  应用
                </button>
              </div>
              
              {/* Quick ratios */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">快速比例</div>
                <div className="flex space-x-1">
                  {[
                    { label: '1:1', ratio: 1 },
                    { label: '4:3', ratio: 4/3 },
                    { label: '16:9', ratio: 16/9 },
                    { label: '3:4', ratio: 3/4 },
                    { label: '9:16', ratio: 9/16 },
                  ].map(({ label, ratio }) => (
                    <button
                      key={label}
                      onClick={() => {
                        if (ratio >= 1) {
                          setCustomHeight(Math.round(customWidth / ratio));
                        } else {
                          setCustomWidth(Math.round(customHeight * ratio));
                        }
                      }}
                      className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Format Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">当前格式</div>
          <div className="text-xs text-blue-700">
            {canvasFormat.name} - {canvasFormat.width} × {canvasFormat.height} 像素
          </div>
          <div className="text-xs text-blue-600 mt-1">
            缩放: {Math.round(canvasScale * 100)}% | 显示尺寸: {Math.round(canvasFormat.width * canvasScale)} × {Math.round(canvasFormat.height * canvasScale)}
          </div>
        </div>
      </div>
    </div>
  );
}