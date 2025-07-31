'use client';

import { useState } from 'react';

export default function DeployCurrencyPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/deploy-currency-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '部署失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '部署过程中出错');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            桃花币系统数据库部署
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              此页面将创建桃花币系统所需的所有数据库表，包括：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>用户钱包表 (user_wallets)</li>
              <li>货币交易表 (currency_transactions)</li>
              <li>货币规则表 (currency_rules)</li>
              <li>用户货币收益表 (user_currency_earnings)</li>
              <li>货币商品表 (currency_products)</li>
              <li>用户购买表 (user_purchases)</li>
              <li>礼物表 (gifts)</li>
              <li>礼物交易表 (gift_transactions)</li>
            </ul>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isDeploying ? '部署中...' : '开始部署'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium">部署失败</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-medium">部署结果</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>总语句数: {result.summary?.total}</p>
                <p>成功: {result.summary?.success}</p>
                <p>失败: {result.summary?.failure}</p>
              </div>
              
              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-green-800 font-medium mb-2">详细结果:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {result.results.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`text-xs p-2 mb-1 rounded ${
                          item.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        语句 {item.statement}: {item.success ? '成功' : '失败'}
                        {item.error && ` - ${item.error}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 