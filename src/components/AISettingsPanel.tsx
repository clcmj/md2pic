import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bot, Key, Globe, Cpu, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';

export function AISettingsPanel() {
  const { aiConfig, updateAIConfig } = useAppStore();
  const [tempConfig, setTempConfig] = useState(aiConfig);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateAIConfig(tempConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setTempConfig(aiConfig);
  };

  const models = [
    { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', description: '最新代码生成模型，适合技术文档' },
    { id: 'qwen-max', name: 'Qwen Max', description: '最强版本，适合复杂内容创作' },
    { id: 'qwen-plus', name: 'Qwen Plus', description: '高性能版本，平衡质量和速度' },
    { id: 'qwen-turbo', name: 'Qwen Turbo', description: '快速版本，适合简单任务' }
  ];

  const hasChanges = JSON.stringify(tempConfig) !== JSON.stringify(aiConfig);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">AI 智能助手</h3>
            <p className="text-sm text-slate-600 mt-1">
              配置AI助手来帮助您生成和优化Markdown内容
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-xl border-2 ${
          tempConfig.enabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                tempConfig.enabled ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <div className="font-medium text-slate-800">
                  {tempConfig.enabled ? 'AI助手已启用' : 'AI助手已禁用'}
                </div>
                <div className="text-sm text-slate-600">
                  {tempConfig.enabled 
                    ? '可以使用AI生成内容功能' 
                    : '需要配置API Key并启用功能'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => setTempConfig({ ...tempConfig, enabled: !tempConfig.enabled })}
              className="p-1"
            >
              {tempConfig.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-slate-700">API 配置</span>
          </div>
          
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Key *
            </label>
            <input
              type="password"
              value={tempConfig.apiKey}
              onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
              placeholder="请输入阿里云通义千问API Key"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              从阿里云控制台获取您的API Key，用于调用通义千问服务
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              API 地址
            </label>
            <input
              type="text"
              value={tempConfig.baseUrl}
              onChange={(e) => setTempConfig({ ...tempConfig, baseUrl: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              默认为阿里云通义千问兼容接口地址
            </p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-slate-700">模型选择</span>
          </div>
          
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  tempConfig.model === model.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => setTempConfig({ ...tempConfig, model: model.id })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-800">{model.name}</span>
                      {tempConfig.model === model.id && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{model.description}</p>
                  </div>
                  <input
                    type="radio"
                    checked={tempConfig.model === model.id}
                    onChange={() => setTempConfig({ ...tempConfig, model: model.id })}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 text-sm">使用提示</div>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>需要先在阿里云控制台开通通义千问服务</li>
                <li>API Key请妥善保管，不要泄露给他人</li>
                <li>不同模型有不同的计费标准，请注意使用成本</li>
                <li>建议先用Turbo模型测试，确认可用后再选择其他模型</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 disabled:text-slate-400 transition-colors"
          >
            重置
          </button>
          
          <div className="flex items-center space-x-3">
            {isSaved && (
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>已保存</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm rounded-lg transition-colors"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}