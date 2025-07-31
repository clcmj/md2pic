import React from 'react';
import { Monitor, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface CanvasFormatPanelProps {
  className?: string;
}

export function CanvasFormatPanel({ className = '' }: CanvasFormatPanelProps) {
  
  const {
    canvasFormat,
    canvasScale,
    setCanvasScale,
  } = useAppStore();

  const handleZoomIn = () => {
    const newScale = Math.min(canvasScale + 0.1, 1);
    setCanvasScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(canvasScale - 0.1, 0);
    setCanvasScale(newScale);
  };

  const handleResetZoom = () => {
    setCanvasScale(0.5);
  };

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* Canvas Format Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">{canvasFormat.name}</div>
              <div className="text-xs text-gray-500">{canvasFormat.description}</div>
            </div>
          </div>
          
          {/* Aspect ratio preview */}
          <div className="flex items-center space-x-2">
            <div 
              className="border border-blue-300 bg-white"
              style={{
                width: '24px',
                height: `${24 * (canvasFormat.height / canvasFormat.width)}px`,
                maxHeight: '32px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">缩放比例</label>
          <span className="text-xs text-gray-500">{Math.round(canvasScale * 100)}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            disabled={canvasScale <= 0}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="flex-1 text-center">
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              重置
            </button>
          </div>
          
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            disabled={canvasScale >= 1}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        {/* Zoom slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={canvasScale}
          onChange={(e) => setCanvasScale(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Canvas Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        尺寸: {canvasFormat.width} × {canvasFormat.height}px | 缩放: {Math.round(canvasScale * 100)}%
      </div>
    </div>
  );
}