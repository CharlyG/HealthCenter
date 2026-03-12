/**
 * X12 EDI Testing Workspace
 * Full workspace for testing X12 EDI parsing, validation, and generation
 */
import { X12TestingPanel } from './X12TestingPanel';
import { FileCode, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function X12TestingWorkspace() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/payer-integration')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">X12 EDI Testing</h1>
                <p className="text-sm text-gray-500">Parse, validate, and generate X12 EDI transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <X12TestingPanel />
        </div>

        {/* Additional Documentation */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available API Endpoints</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse</h4>
              <p className="text-sm text-gray-600 mt-1">Parse any X12 EDI file and return structured data</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {'{ "content": "ISA*..." }'}
              </code>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/validate</h4>
              <p className="text-sm text-gray-600 mt-1">Validate X12 format without full parsing</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {'{ "content": "ISA*..." }'}
              </code>
            </div>

            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/generate/270</h4>
              <p className="text-sm text-gray-600 mt-1">Generate X12 270 Eligibility Inquiry</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {'{ "provider": {...}, "subscriber": {...}, "payer": {...} }'}
              </code>
            </div>

            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/generate/276</h4>
              <p className="text-sm text-gray-600 mt-1">Generate X12 276 Claim Status Inquiry</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {'{ "provider": {...}, "payer": {...}, "claims": [...] }'}
              </code>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/270</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 270 and extract eligibility inquiry data</p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/271</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 271 and extract eligibility response data</p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/835</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 835 ERA file and extract remittance data</p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/837</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 837 claim submission</p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/276</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 276 claim status inquiry</p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">POST /payer/x12/parse/277</h4>
              <p className="text-sm text-gray-600 mt-1">Parse X12 277 claim status response</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">Transaction Types Supported</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <strong className="text-yellow-900">270:</strong>
                <span className="text-yellow-800 ml-2">Eligibility Inquiry (Parse + Generate)</span>
              </div>
              <div>
                <strong className="text-yellow-900">271:</strong>
                <span className="text-yellow-800 ml-2">Eligibility Response (Parse)</span>
              </div>
              <div>
                <strong className="text-yellow-900">276:</strong>
                <span className="text-yellow-800 ml-2">Claim Status Inquiry (Parse + Generate)</span>
              </div>
              <div>
                <strong className="text-yellow-900">277:</strong>
                <span className="text-yellow-800 ml-2">Claim Status Response (Parse)</span>
              </div>
              <div>
                <strong className="text-yellow-900">835:</strong>
                <span className="text-yellow-800 ml-2">ERA / Remittance Advice (Parse)</span>
              </div>
              <div>
                <strong className="text-yellow-900">837:</strong>
                <span className="text-yellow-800 ml-2">Claim Submission (Parse)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
