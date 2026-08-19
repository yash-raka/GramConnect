import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  function checkLocalStorage() {
    try {
      const stored = localStorage.getItem('gramconnect_tickets');
      const tickets = stored ? JSON.parse(stored) : [];
      
      const info = {
        hasLocalStorage: typeof localStorage !== 'undefined',
        ticketCount: tickets.length,
        storageSize: stored?.length || 0,
        tickets: tickets.map((t: any) => ({
          id: t.id,
          status: t.status,
          title: t.title?.substring(0, 30) + '...',
          createdAt: t.createdAt,
        })),
        quotaEstimate: 'unknown',
      };

      // Try to estimate quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then((estimate) => {
          setDebugInfo({
            ...info,
            quotaEstimate: {
              usage: estimate.usage,
              quota: estimate.quota,
              percentUsed: estimate.quota ? ((estimate.usage! / estimate.quota) * 100).toFixed(2) : 'unknown',
            },
          });
        });
      } else {
        setDebugInfo(info);
      }
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        stack: error.stack,
      });
    }
  }

  function testWrite() {
    try {
      const testKey = 'gramconnect_test';
      const testValue = 'test-' + Date.now();
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      alert(retrieved === testValue 
        ? '✅ localStorage write test PASSED' 
        : '❌ localStorage write test FAILED - data mismatch'
      );
    } catch (error: any) {
      alert(`❌ localStorage write test FAILED\n\n${error.message}`);
    }
  }

  function clearStorage() {
    if (confirm('⚠️ This will delete all locally stored tickets. Are you sure?')) {
      localStorage.removeItem('gramconnect_tickets');
      alert('✅ Local storage cleared');
      checkLocalStorage();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            checkLocalStorage();
          }}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Open Debug Panel"
        >
          <Bug className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-96 overflow-auto">
          <div className="bg-gray-800 text-white p-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              <span className="font-semibold">Debug Panel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-700 p-1 rounded"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={checkLocalStorage}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Refresh Info
              </button>
              <button
                onClick={testWrite}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Test Write
              </button>
              <button
                onClick={clearStorage}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Clear
              </button>
            </div>

            {debugInfo && (
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
