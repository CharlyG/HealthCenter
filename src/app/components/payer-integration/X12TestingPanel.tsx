/**
 * X12 EDI Testing Panel
 * Interactive component for testing X12 EDI parsing and generation
 */
import { useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Upload, Download, Code, Play } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-845bc545`;

// Sample X12 files for testing
const SAMPLE_X12_FILES = {
  '270': `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260311*093000*^*00501*000000001*0*P*:~
GS*HS*SENDER*RECEIVER*20260311*093000*1*X*005010~
ST*270*0001*005010X279A1~
BHT*0022*13*10001234*20260311*093000~
HL*1**20*1~
NM1*PR*2*MEDICARE*****PI*MCR-NATL~
HL*2*1*21*1~
NM1*1P*2*HOME HEALTH SERVICES INC*****XX*1234567890~
HL*3*2*22*0~
TRN*1*10001234*1234567890~
NM1*IL*1*JOHNSON*MARY****MI*MEM123456789~
DMG*D8*19450315*F~
EQ*30~
DTP*291*D8*20260311~
SE*14*0001~
GE*1*1~
IEA*1*000000001~`,

  '271': `ISA*00*          *00*          *ZZ*RECEIVER       *ZZ*SENDER         *260311*093500*^*00501*000000001*0*P*:~
GS*HB*RECEIVER*SENDER*20260311*093500*1*X*005010~
ST*271*0001*005010X279A1~
BHT*0022*11*10001234*20260311*093500~
HL*1**20*1~
NM1*PR*2*MEDICARE*****PI*MCR-NATL~
HL*2*1*21*1~
NM1*1P*2*HOME HEALTH SERVICES INC*****XX*1234567890~
HL*3*2*22*0~
TRN*2*10001234*1234567890~
NM1*IL*1*JOHNSON*MARY****MI*MEM123456789~
EB*1**30**MEDICARE PART A & B~
DTP*291*D8*20250101~
DTP*292*D8*20261231~
EB*C**30**HOME HEALTH SERVICES~
EB*B**30*20*240*****Y~
EB*F**30*****524.10**~
SE*16*0001~
GE*1*1~
IEA*1*000000001~`,

  '835': `ISA*00*          *00*          *ZZ*MEDICARE       *ZZ*HHA12345       *260305*143000*^*00501*000000001*0*P*:~
GS*HP*MEDICARE*HHA12345*20260305*143000*1*X*005010~
ST*835*0001*005010X221A1~
BPR*I*3056.40*C*ACH*CCP***01*123456789**01*987654321**20260305~
TRN*1*98765432*1234567890~
N1*PR*MEDICARE*PI*MCR-NATL~
N1*PE*HOME HEALTH SERVICES INC*XX*1234567890~
CLP*CLM-2026-00145*1*4250.00*3056.40*429.50**MCR-2026-7734521*11~
NM1*QC*1*JOHNSON*MARY****MI*MEM123456789~
DTM*232*20260215~
AMT*AU*3820.50~
SVC*HC:G0162*4250.00*3820.50**1~
DTM*472*20260215~
CAS*PR*1*240.00~
CAS*PR*2*524.10~
CAS*CO*45*429.50~
SE*16*0001~
GE*1*1~
IEA*1*000000001~`,

  '276': `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260311*100000*^*00501*000000001*0*P*:~
GS*HR*SENDER*RECEIVER*20260311*100000*1*X*005010~
ST*276*0001*005010X212~
BHT*0010*13*10001234*20260311*100000~
HL*1**20*1~
NM1*PR*2*MEDICARE*****PI*MCR-NATL~
HL*2*1*21*1~
NM1*1P*2*HOME HEALTH SERVICES INC*****XX*1234567890~
HL*3*2*19*1~
HL*4*3*PT*0~
TRN*1*100012340001~
REF*D9*CLM-2026-00145~
NM1*QC*1*JOHNSON*MARY****MI*MEM123456789~
DTP*472*D8*20260215~
AMT*T3*4250.00~
SE*13*0001~
GE*1*1~
IEA*1*000000001~`,

  '277': `ISA*00*          *00*          *ZZ*RECEIVER       *ZZ*SENDER         *260311*100500*^*00501*000000001*0*P*:~
GS*HN*RECEIVER*SENDER*20260311*100500*1*X*005010~
ST*277*0001*005010X214~
BHT*0010*08*10001234*20260311*100500~
HL*1**20*1~
NM1*PR*2*MEDICARE*****PI*MCR-NATL~
HL*2*1*21*1~
LX*1~
REF*D9*CLM-2026-00145~
STC*A1:20*20260305~
NM1*QC*1*JOHNSON*MARY~
AMT*T3*4250.00~
DTP*472*D8*20260215~
SE*11*0001~
GE*1*1~
IEA*1*000000001~`,
};

type TransactionType = '270' | '271' | '835' | '276' | '277' | '837';

export function X12TestingPanel() {
  const [selectedType, setSelectedType] = useState<TransactionType>('270');
  const [x12Content, setX12Content] = useState<string>(SAMPLE_X12_FILES['270']);
  const [parseResult, setParseResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSample = (type: TransactionType) => {
    setSelectedType(type);
    setX12Content(SAMPLE_X12_FILES[type]);
    setParseResult(null);
    setError(null);
  };

  const handleParseX12 = async () => {
    setLoading(true);
    setError(null);
    setParseResult(null);

    try {
      const response = await fetch(`${SERVER_URL}/payer/x12/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ content: x12Content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse X12');
      }

      setParseResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateX12 = async () => {
    setLoading(true);
    setError(null);
    setParseResult(null);

    try {
      const response = await fetch(`${SERVER_URL}/payer/x12/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ content: x12Content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate X12');
      }

      setParseResult({ validation: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExample = async () => {
    setLoading(true);
    setError(null);
    setParseResult(null);

    try {
      let endpoint = '';
      let payload: any = {};

      if (selectedType === '270') {
        endpoint = '/payer/x12/generate/270';
        payload = {
          provider: {
            npi: '1234567890',
            name: 'HOME HEALTH SERVICES INC',
          },
          subscriber: {
            memberId: 'MEM123456789',
            firstName: 'MARY',
            lastName: 'JOHNSON',
            dob: '1945-03-15',
            gender: 'F',
          },
          payer: {
            payerId: 'MCR-NATL',
            name: 'MEDICARE',
          },
          serviceType: '30',
          serviceDate: '2026-03-11',
        };
      } else if (selectedType === '276') {
        endpoint = '/payer/x12/generate/276';
        payload = {
          provider: {
            npi: '1234567890',
            name: 'HOME HEALTH SERVICES INC',
          },
          payer: {
            payerId: 'MCR-NATL',
            name: 'MEDICARE',
          },
          claims: [
            {
              patientControlNumber: 'CLM-2026-00145',
              serviceDate: '2026-02-15',
              amount: 4250.00,
              patient: {
                firstName: 'MARY',
                lastName: 'JOHNSON',
                memberId: 'MEM123456789',
              },
            },
          ],
        };
      } else {
        setError(`Generation not implemented for ${selectedType} yet`);
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate X12');
      }

      setX12Content(data.content);
      setParseResult({ generated: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([x12Content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x12_${selectedType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">X12 EDI Testing Panel</h3>
          <p className="text-sm text-gray-500 mt-1">
            Test X12 EDI parsing, validation, and generation
          </p>
        </div>
      </div>

      {/* Transaction Type Selector */}
      <div className="grid grid-cols-5 gap-2">
        {(['270', '271', '835', '276', '277'] as TransactionType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleLoadSample(type)}
            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{type}</div>
            <div className="text-xs mt-1 opacity-70">
              {type === '270' && 'Eligibility Inquiry'}
              {type === '271' && 'Eligibility Response'}
              {type === '835' && 'ERA'}
              {type === '276' && 'Claim Inquiry'}
              {type === '277' && 'Claim Response'}
            </div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleParseX12}
          disabled={loading || !x12Content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          Parse X12
        </button>

        <button
          onClick={handleValidateX12}
          disabled={loading || !x12Content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          Validate
        </button>

        <button
          onClick={handleGenerateExample}
          disabled={loading || !['270', '276'].includes(selectedType)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Code className="w-4 h-4" />
          Generate
        </button>

        <button
          onClick={handleDownload}
          disabled={!x12Content.trim()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* X12 Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          X12 EDI Content
        </label>
        <textarea
          value={x12Content}
          onChange={(e) => setX12Content(e.target.value)}
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste X12 EDI content here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {x12Content.length} characters • {x12Content.split('~').filter(s => s.trim()).length} segments
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Processing X12 transaction...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-900">Parse Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Parse Result */}
      {parseResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              {parseResult.validation ? 'Validation Result' : parseResult.generated ? 'Generation Result' : 'Parse Result'}
            </h4>
          </div>

          {/* Validation Result */}
          {parseResult.validation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Valid:</span>
                <span className={`text-sm font-semibold ${parseResult.validation.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {parseResult.validation.valid ? 'Yes' : 'No'}
                </span>
              </div>
              {parseResult.validation.transactionType && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Transaction Type:</span>
                  <span className="text-sm text-gray-900">{parseResult.validation.transactionType}</span>
                </div>
              )}
              {parseResult.validation.errors && parseResult.validation.errors.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Errors:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {parseResult.validation.errors.map((err: string, idx: number) => (
                      <li key={idx} className="text-sm text-red-600">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generation Result */}
          {parseResult.generated && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Transaction Type:</span>
                <span className="text-sm text-gray-900">{parseResult.generated.transactionType}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Generated X12 content loaded into editor. Click "Parse X12" to validate.
              </div>
            </div>
          )}

          {/* Parse Result */}
          {!parseResult.validation && !parseResult.generated && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Transaction Type:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.transactionType}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Control Number:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.metadata?.controlNumber}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Sender ID:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.metadata?.senderId}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Receiver ID:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.metadata?.receiverId}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Groups:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.metadata?.groupCount}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Transactions:</span>
                  <div className="text-sm text-gray-900 mt-1">{parseResult.metadata?.transactionCount}</div>
                </div>
              </div>

              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  View Full Parse Result (JSON)
                </summary>
                <pre className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(parseResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <h4 className="font-semibold text-blue-900">X12 EDI Parser Features</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li><strong>270/271:</strong> Eligibility Inquiry and Response with benefits parsing</li>
              <li><strong>835:</strong> Electronic Remittance Advice with claim and adjustment details</li>
              <li><strong>276/277:</strong> Claim Status Inquiry and Response</li>
              <li><strong>837:</strong> Professional/Institutional Claim Submission (parsing only)</li>
              <li><strong>Validation:</strong> Format validation with detailed error messages</li>
              <li><strong>Generation:</strong> Create properly formatted X12 270 and 276 transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}