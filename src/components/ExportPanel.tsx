import React, { useState, useCallback } from 'react';
import { Download, Image, Archive, Loader2, Settings, FileImage, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportPanelProps {
  className?: string;
}

interface ExportProgress {
  current: number;
  total: number;
  status: string;
}

interface ExportOptions {
  quality: number;
  format: 'png' | 'jpeg' | 'webp';
  scale: number;
  addWatermark: boolean;
}

export function ExportPanel({ className = '' }: ExportPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    quality: 0.95,
    format: 'png',
    scale: 2,
    addWatermark: false
  });
  
  const {
    elements,
    pages,
    canvasFormat,
    currentPage,
    totalPages,
    backgroundSettings
  } = useAppStore();

  // Get current page elements
  const currentPageElements = pages.length > 0 && pages[currentPage - 1] 
    ? pages[currentPage - 1] 
    : elements;

  // Generate canvas element for export
  const createExportCanvas = useCallback(async (pageElements: any[], pageNumber?: number) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${canvasFormat.width}px`;
    container.style.height = `${canvasFormat.height}px`;
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    // Apply background settings
    if (backgroundSettings.type === 'gradient') {
      container.style.background = `linear-gradient(${backgroundSettings.gradientDirection}, ${backgroundSettings.gradientColors?.join(', ') || '#ffffff, #f0f0f0'})`;
    } else {
      container.style.backgroundColor = backgroundSettings.solidColor || '#ffffff';
    }
    
    document.body.appendChild(container);
    
    try {
      // Render elements
      pageElements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.style.position = 'absolute';
        elementDiv.style.left = `${element.x}px`;
        elementDiv.style.top = `${element.y}px`;
        elementDiv.style.width = `${element.width}px`;
        elementDiv.style.height = `${element.height}px`;
        elementDiv.style.fontSize = `${element.fontSize}px`;
        elementDiv.style.color = element.color;
        elementDiv.style.backgroundColor = element.backgroundColor || 'transparent';
        elementDiv.style.textAlign = element.textAlign;
        elementDiv.style.padding = '8px';
        elementDiv.style.lineHeight = '1.6';
        elementDiv.style.overflow = 'hidden';
        elementDiv.style.wordWrap = 'break-word';
        elementDiv.style.boxSizing = 'border-box';
        
        if (element.type === 'heading') {
          elementDiv.style.fontWeight = 'bold';
        } else if (element.type === 'code') {
          elementDiv.style.fontFamily = 'JetBrains Mono, Consolas, Monaco, monospace';
          elementDiv.style.whiteSpace = 'pre-wrap';
        } else if (element.type === 'blockquote') {
          elementDiv.style.borderLeft = '4px solid #d1d5db';
          elementDiv.style.paddingLeft = '16px';
          elementDiv.style.fontStyle = 'italic';
        }
        
        if (element.type === 'table') {
          // Special handling for tables
          const lines = element.content.split('\n');
          const table = document.createElement('table');
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.fontSize = 'inherit';
          table.style.margin = '0 auto';
          
          lines.forEach((line, index) => {
            if (line.trim() && !line.includes('---')) {
              const row = document.createElement('tr');
              const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
              
              cells.forEach(cellContent => {
                const cell = document.createElement(index === 0 ? 'th' : 'td');
                cell.textContent = cellContent;
                cell.style.border = '1px solid #d1d5db';
                cell.style.padding = '16px'; // 增加padding，适配大字体
                cell.style.textAlign = element.textAlign || 'center';
                if (index === 0) {
                  cell.style.backgroundColor = '#f9fafb';
                  cell.style.fontWeight = 'bold';
                }
                row.appendChild(cell);
              });
              
              table.appendChild(row);
            }
          });
          
          elementDiv.appendChild(table);
        } else {
          elementDiv.textContent = element.content;
        }
        
        container.appendChild(elementDiv);
      });

      // Add watermark if enabled
      if (exportOptions.addWatermark) {
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.bottom = '20px';
        watermark.style.right = '20px';
        watermark.style.fontSize = '12px';
        watermark.style.color = '#9ca3af';
        watermark.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        watermark.style.opacity = '0.7';
        watermark.textContent = 'Made with md2pic';
        container.appendChild(watermark);
      }

      // Add page number for multi-page exports
      if (pageNumber !== undefined && totalPages > 1) {
        const pageInfo = document.createElement('div');
        pageInfo.style.position = 'absolute';
        pageInfo.style.bottom = '20px';
        pageInfo.style.left = '20px';
        pageInfo.style.fontSize = '12px';
        pageInfo.style.color = '#6b7280';
        pageInfo.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        pageInfo.textContent = `${pageNumber}/${totalPages}`;
        container.appendChild(pageInfo);
      }
      
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Generate canvas
      const canvas = await html2canvas(container, {
        width: canvasFormat.width,
        height: canvasFormat.height,
        scale: exportOptions.scale,
        backgroundColor: null, // 使用容器背景而不是固定白色
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      return canvas;
    } finally {
      document.body.removeChild(container);
    }
  }, [canvasFormat, exportOptions, totalPages]);

  // Export single page
  const handleSingleExport = useCallback(async () => {
    if (currentPageElements.length === 0) {
      toast.error('当前页面没有内容可导出');
      return;
    }
    
    setIsExporting(true);
    
    try {
      toast.info('正在生成图片...');
      
      const canvas = await createExportCanvas(currentPageElements);
      
      // Convert to blob and download
      const mimeType = exportOptions.format === 'png' ? 'image/png' : 
                      exportOptions.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `md2pic-page${currentPage}-${timestamp}.${exportOptions.format}`;
          saveAs(blob, filename);
          toast.success(`图片已导出: ${filename}`);
        } else {
          toast.error('图片生成失败');
        }
      }, mimeType, exportOptions.quality);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }, [currentPageElements, createExportCanvas, currentPage, exportOptions]);

  // Export all pages as ZIP
  const handleBatchExport = useCallback(async () => {
    const allPages = pages.length > 0 ? pages : [elements];
    
    if (allPages.length === 0 || allPages.every(page => page.length === 0)) {
      toast.error('没有内容可导出');
      return;
    }
    
    setIsExporting(true);
    setExportProgress({ current: 0, total: allPages.length, status: '准备导出...' });
    
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const mimeType = exportOptions.format === 'png' ? 'image/png' : 
                      exportOptions.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      
      // Export each page
      for (let i = 0; i < allPages.length; i++) {
        const pageElements = allPages[i];
        const pageNumber = i + 1;
        
        setExportProgress({ 
          current: i, 
          total: allPages.length, 
          status: `正在生成第 ${pageNumber} 页...` 
        });
        
        if (pageElements.length > 0) {
          const canvas = await createExportCanvas(pageElements, pageNumber);
          
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            }, mimeType, exportOptions.quality);
          });
          
          const paddedPageNumber = pageNumber.toString().padStart(2, '0');
          zip.file(`page-${paddedPageNumber}.${exportOptions.format}`, blob);
        }
      }
      
      setExportProgress({ 
        current: allPages.length, 
        total: allPages.length, 
        status: '正在打包文件...' 
      });
      
      // Generate ZIP
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      const filename = `md2pic-batch-${allPages.length}pages-${timestamp}.zip`;
      saveAs(zipBlob, filename);
      
      toast.success(`批量导出完成: ${filename} (${allPages.length} 页)`);
      
    } catch (error) {
      console.error('Batch export failed:', error);
      toast.error('批量导出失败，请重试');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [pages, elements, createExportCanvas, exportOptions]);

  // Quick export with different formats
  const handleQuickExport = useCallback(async (format: 'png' | 'jpeg' | 'webp') => {
    const originalFormat = exportOptions.format;
    setExportOptions(prev => ({ ...prev, format }));
    
    // Wait for next tick to ensure state update
    setTimeout(() => {
      handleSingleExport();
      // Restore original format
      setExportOptions(prev => ({ ...prev, format: originalFormat }));
    }, 10);
  }, [exportOptions.format, handleSingleExport]);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-700">图片导出</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="p-1 rounded hover:bg-gray-100"
              title="高级选项"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
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
        </div>

        {isExpanded && (
          <>
            {/* Advanced Options */}
            {showAdvancedOptions && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-3">
            <div className="text-sm font-medium text-gray-700">导出设置</div>
            
            {/* Format Selection */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">格式</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  format: e.target.value as 'png' | 'jpeg' | 'webp' 
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              >
                <option value="png">PNG (无损压缩)</option>
                <option value="jpeg">JPEG (小文件)</option>
                <option value="webp">WebP (最佳压缩)</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                质量 ({Math.round(exportOptions.quality * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={exportOptions.quality}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  quality: parseFloat(e.target.value) 
                }))}
                className="w-full"
              />
            </div>

            {/* Scale */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                分辨率 ({exportOptions.scale}x)
              </label>
              <select
                value={exportOptions.scale}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  scale: parseFloat(e.target.value) 
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              >
                <option value={1}>1x (标准)</option>
                <option value={2}>2x (高清)</option>
                <option value={3}>3x (超高清)</option>
              </select>
            </div>

            {/* Watermark */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="watermark"
                checked={exportOptions.addWatermark}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  addWatermark: e.target.checked 
                }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="watermark" className="text-xs text-gray-600">
                添加水印
              </label>
            </div>
          </div>
        )}

        {/* Main Export Buttons */}
        <div className="space-y-3">
          {/* Single Page Export */}
          <button
            onClick={handleSingleExport}
            disabled={isExporting || currentPageElements.length === 0}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
              isExporting || currentPageElements.length === 0
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700 hover:border-green-300'
            }`}
          >
            {isExporting && !exportProgress ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Image className="w-5 h-5" />
            )}
            <span className="font-medium">
              导出当前页面 (第 {currentPage} 页)
            </span>
          </button>

          {/* Batch Export */}
          {totalPages > 1 && (
            <button
              onClick={handleBatchExport}
              disabled={isExporting}
              className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                isExporting
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:border-blue-300'
              }`}
            >
              {isExporting && exportProgress ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
              <span className="font-medium">
                批量导出全部 {totalPages} 页
              </span>
            </button>
          )}
        </div>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickExport('png')}
            disabled={isExporting || currentPageElements.length === 0}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
          >
            PNG
          </button>
          <button
            onClick={() => handleQuickExport('jpeg')}
            disabled={isExporting || currentPageElements.length === 0}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
          >
            JPEG
          </button>
          <button
            onClick={() => handleQuickExport('webp')}
            disabled={isExporting || currentPageElements.length === 0}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
          >
            WebP
          </button>
        </div>

        {/* Export Progress */}
        {exportProgress && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">导出进度</span>
              <span className="text-xs text-blue-700">
                {exportProgress.current}/{exportProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
              />
            </div>
            <div className="text-xs text-blue-600">{exportProgress.status}</div>
          </div>
        )}

        {/* Export Info */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="text-sm font-medium text-gray-700">导出信息</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• 格式: {exportOptions.format.toUpperCase()}</div>
            <div>• 尺寸: {canvasFormat.width} × {canvasFormat.height} 像素</div>
            <div>• 分辨率: {exportOptions.scale}x ({canvasFormat.width * exportOptions.scale} × {canvasFormat.height * exportOptions.scale})</div>
            <div>• 当前页元素: {currentPageElements.length} 个</div>
            {totalPages > 1 && <div>• 总页数: {totalPages} 页</div>}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-1">💡 导出提示</div>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>• PNG: 支持透明度，文件较大</div>
            <div>• JPEG: 文件小，不支持透明度</div>
            <div>• WebP: 最佳压缩比，现代浏览器支持</div>
            <div>• 高分辨率导出适合印刷和高清显示</div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}