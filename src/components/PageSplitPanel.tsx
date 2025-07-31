import React from 'react';
import { Layers, Split } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { parseMarkdownToPages } from '../lib/markdownParser';

interface PageSplitPanelProps {
  className?: string;
}

export function PageSplitPanel({ className = '' }: PageSplitPanelProps) {
  
  const {
    markdownContent,
    setElements,
    currentPage,
    totalPages,
    setCurrentPage,
    setTotalPages,
    setPages,
    splitLevel,
    setSplitLevel,
    autoSplit,
    setAutoSplit
  } = useAppStore();

  const handleSplitByHeadings = () => {
    if (!markdownContent.trim()) return;
    
    try {
      const pages = parseMarkdownToPages(markdownContent, splitLevel);
      
      if (pages.length > 0) {
        // 使用store的setPages方法，它会自动设置totalPages和currentPage
        setPages(pages);
      }
    } catch (error) {
      console.error('Failed to split pages:', error);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getSplitLevelText = (level: number) => {
    switch (level) {
      case 1: return 'H1 标题（不分页，所有内容在一页）';
      case 2: return 'H2 标题（遇到H1或H2时分页）';
      case 3: return 'H3 标题（遇到H1/H2/H3时分页）';
      default: return 'H1 标题';
    }
  };

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* Split Settings */}
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">分割级别</label>
          <select
            value={splitLevel}
            onChange={(e) => setSplitLevel(parseInt(e.target.value) as 1 | 2 | 3)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
          >
            <option value={1}>按 H1 标题分割（不分页，所有内容在一页）</option>
            <option value={2}>按 H2 标题分割（遇到H1或H2时分页）</option>
            <option value={3}>按 H3 标题分割（遇到H1/H2/H3时分页）</option>
          </select>
          <div className="text-xs text-gray-500">
            当前设置：{getSplitLevelText(splitLevel)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoSplit"
            checked={autoSplit}
            onChange={(e) => setAutoSplit(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="autoSplit" className="text-xs text-gray-600">
            自动分割（编辑时实时更新）
          </label>
        </div>

        <button
          onClick={handleSplitByHeadings}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
        >
          <Split className="w-4 h-4" />
          <span>执行分割</span>
        </button>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">页面导航</span>
            <span className="text-xs text-gray-500">
              共 {totalPages} 页
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentPage === pageNum
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* Current Page Info */}
      <div className="bg-indigo-50 p-3 rounded-lg">
        <div className="text-sm font-medium text-indigo-900 mb-1">当前页面</div>
        <div className="text-xs text-indigo-700">
          第 {currentPage} 页，共 {totalPages} 页
        </div>
        {totalPages > 1 && (
          <div className="text-xs text-indigo-600 mt-1">
            分割级别: {getSplitLevelText(splitLevel)}
          </div>
        )}
      </div>
    </div>
  );
}