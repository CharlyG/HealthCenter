/**
 * SN Quick Phrases Component
 * Provides quick phrase selection for common clinical documentation
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';

export interface QuickPhrase {
  id: string;
  category: string;
  text: string;
  tags?: string[];
}

interface SNQuickPhrasesProps {
  category: string;
  onSelect: (phrase: string) => void;
  onClose?: () => void;
}

export function SNQuickPhrases({
  category,
  onSelect,
  onClose,
}: SNQuickPhrasesProps) {
  const [search, setSearch] = useState('');
  
  const phrases = useMemo(() => getQuickPhrasesForCategory(category), [category]);
  
  const filteredPhrases = useMemo(() => {
    if (!search) return phrases;
    
    const searchLower = search.toLowerCase();
    return phrases.filter(
      p => 
        p.text.toLowerCase().includes(searchLower) ||
        p.tags?.some(t => t.toLowerCase().includes(searchLower))
    );
  }, [phrases, search]);

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Quick Phrases</h4>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phrases..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {filteredPhrases.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No phrases found
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => onSelect(phrase.text)}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 rounded flex items-start gap-2 group"
              >
                <Plus className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{phrase.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick phrase library organized by category
function getQuickPhrasesForCategory(category: string): QuickPhrase[] {
  const phraseLibrary: Record<string, QuickPhrase[]> = {
    vital_signs: [
      { id: '1', category: 'vital_signs', text: 'Vital signs stable and within normal limits', tags: ['stable', 'normal'] },
      { id: '2', category: 'vital_signs', text: 'Blood pressure elevated from baseline', tags: ['hypertension', 'elevated'] },
      { id: '3', category: 'vital_signs', text: 'Oxygen saturation maintained on room air', tags: ['oxygen', 'normal'] },
      { id: '4', category: 'vital_signs', text: 'Temperature slightly elevated, monitoring', tags: ['fever', 'elevated'] },
    ],
    
    cardiopulmonary: [
      { id: '10', category: 'cardiopulmonary', text: 'Heart regular rate and rhythm, no murmurs', tags: ['heart', 'normal'] },
      { id: '11', category: 'cardiopulmonary', text: 'Lungs clear to auscultation bilaterally', tags: ['lungs', 'normal', 'clear'] },
      { id: '12', category: 'cardiopulmonary', text: 'Mild crackles noted in bilateral lung bases', tags: ['lungs', 'crackles', 'abnormal'] },
      { id: '13', category: 'cardiopulmonary', text: 'Irregular heart rate noted, patient aware of AFib diagnosis', tags: ['heart', 'afib', 'irregular'] },
      { id: '14', category: 'cardiopulmonary', text: '+1 pitting edema bilateral lower extremities', tags: ['edema', 'legs'] },
      { id: '15', category: 'cardiopulmonary', text: 'Peripheral pulses palpable and equal bilaterally', tags: ['pulses', 'normal'] },
      { id: '16', category: 'cardiopulmonary', text: 'Shortness of breath with exertion, resolves with rest', tags: ['sob', 'dyspnea'] },
      { id: '17', category: 'cardiopulmonary', text: 'Non-productive cough present', tags: ['cough'] },
    ],
    
    neurological: [
      { id: '20', category: 'neurological', text: 'Alert and oriented x 4 (person, place, time, situation)', tags: ['alert', 'oriented', 'normal'] },
      { id: '21', category: 'neurological', text: 'Alert and oriented x 3, occasionally confused to time', tags: ['confusion', 'oriented'] },
      { id: '22', category: 'neurological', text: 'Speech clear and appropriate', tags: ['speech', 'normal'] },
      { id: '23', category: 'neurological', text: 'Follows commands appropriately', tags: ['cognition', 'normal'] },
      { id: '24', category: 'neurological', text: 'Steady gait with assistive device', tags: ['gait', 'walker', 'cane'] },
      { id: '25', category: 'neurological', text: 'Unsteady gait, requires supervision', tags: ['gait', 'fall risk', 'abnormal'] },
      { id: '26', category: 'neurological', text: 'Left-sided weakness noted, residual from CVA', tags: ['weakness', 'stroke', 'cva'] },
      { id: '27', category: 'neurological', text: 'Tremor noted in bilateral upper extremities', tags: ['tremor', 'parkinsons'] },
    ],
    
    gastrointestinal: [
      { id: '30', category: 'gastrointestinal', text: 'Bowel sounds present in all four quadrants', tags: ['bowel', 'normal'] },
      { id: '31', category: 'gastrointestinal', text: 'Abdomen soft, non-tender, non-distended', tags: ['abdomen', 'normal'] },
      { id: '32', category: 'gastrointestinal', text: 'Regular bowel movements, no constipation reported', tags: ['bowel', 'normal'] },
      { id: '33', category: 'gastrointestinal', text: 'Reports constipation, taking stool softeners as ordered', tags: ['constipation', 'bowel'] },
      { id: '34', category: 'gastrointestinal', text: 'Denies nausea, vomiting, or diarrhea', tags: ['normal'] },
      { id: '35', category: 'gastrointestinal', text: 'Good appetite, tolerating diet well', tags: ['nutrition', 'normal'] },
      { id: '36', category: 'gastrointestinal', text: 'Poor appetite, weight loss noted', tags: ['nutrition', 'weight loss', 'abnormal'] },
    ],
    
    genitourinary: [
      { id: '40', category: 'genitourinary', text: 'Voiding without difficulty, urine clear yellow', tags: ['urination', 'normal'] },
      { id: '41', category: 'genitourinary', text: 'Denies dysuria, frequency, or urgency', tags: ['normal'] },
      { id: '42', category: 'genitourinary', text: 'Foley catheter in place, draining clear yellow urine', tags: ['catheter', 'foley'] },
      { id: '43', category: 'genitourinary', text: 'Reports urinary frequency and urgency', tags: ['frequency', 'urgency', 'abnormal'] },
      { id: '44', category: 'genitourinary', text: 'Continent of bowel and bladder', tags: ['continence', 'normal'] },
      { id: '45', category: 'genitourinary', text: 'Incontinent episodes noted, using protective pads', tags: ['incontinence', 'abnormal'] },
    ],
    
    integumentary: [
      { id: '50', category: 'integumentary', text: 'Skin warm, dry, and intact throughout', tags: ['skin', 'normal'] },
      { id: '51', category: 'integumentary', text: 'No redness, breakdown, or pressure areas noted', tags: ['skin', 'normal'] },
      { id: '52', category: 'integumentary', text: 'Wound healing appropriately with current treatment plan', tags: ['wound', 'healing'] },
      { id: '53', category: 'integumentary', text: 'Wound bed pink with granulation tissue present', tags: ['wound', 'healing'] },
      { id: '54', category: 'integumentary', text: 'Minimal serous drainage from wound', tags: ['wound', 'drainage'] },
      { id: '55', category: 'integumentary', text: 'Peri-wound skin intact without erythema', tags: ['wound', 'normal'] },
      { id: '56', category: 'integumentary', text: 'Dry, fragile skin noted, lotion applied', tags: ['skin', 'dry'] },
    ],
    
    pain: [
      { id: '60', category: 'pain', text: 'Denies pain at this time', tags: ['pain', 'normal'] },
      { id: '61', category: 'pain', text: 'Pain well-controlled with current medication regimen', tags: ['pain', 'controlled'] },
      { id: '62', category: 'pain', text: 'Reports chronic pain, stable from baseline', tags: ['pain', 'chronic'] },
      { id: '63', category: 'pain', text: 'Sharp, stabbing pain in location', tags: ['pain', 'sharp'] },
      { id: '64', category: 'pain', text: 'Dull, aching pain in location', tags: ['pain', 'dull', 'aching'] },
      { id: '65', category: 'pain', text: 'Pain improves with rest and pain medication', tags: ['pain', 'management'] },
      { id: '66', category: 'pain', text: 'Pain limits activities of daily living', tags: ['pain', 'adl'] },
    ],
    
    safety: [
      { id: '70', category: 'safety', text: 'Home environment safe with no fall hazards noted', tags: ['safety', 'normal'] },
      { id: '71', category: 'safety', text: 'Patient using assistive device appropriately', tags: ['safety', 'device'] },
      { id: '72', category: 'safety', text: 'Throw rugs removed to reduce fall risk', tags: ['safety', 'fall prevention'] },
      { id: '73', category: 'safety', text: 'Grab bars installed in bathroom', tags: ['safety', 'bathroom'] },
      { id: '74', category: 'safety', text: 'Patient demonstrates proper use of walker', tags: ['safety', 'walker'] },
      { id: '75', category: 'safety', text: 'Clutter noted, discussed home safety modifications', tags: ['safety', 'hazard'] },
    ],
    
    education: [
      { id: '80', category: 'education', text: 'Patient demonstrates understanding of disease process', tags: ['education', 'understanding'] },
      { id: '81', category: 'education', text: 'Medication teaching provided, patient verbalizes understanding', tags: ['education', 'medications'] },
      { id: '82', category: 'education', text: 'Diet education provided per ordered diet', tags: ['education', 'diet'] },
      { id: '83', category: 'education', text: 'Fall prevention education provided', tags: ['education', 'fall prevention'] },
      { id: '84', category: 'education', text: 'Patient asks appropriate questions', tags: ['education', 'engagement'] },
      { id: '85', category: 'education', text: 'Written materials provided and reviewed', tags: ['education', 'materials'] },
      { id: '86', category: 'education', text: 'Caregiver present for education, demonstrates understanding', tags: ['education', 'caregiver'] },
    ],
    
    response: [
      { id: '90', category: 'response', text: 'Patient tolerating skilled nursing interventions well', tags: ['response', 'positive'] },
      { id: '91', category: 'response', text: 'Patient demonstrates improvement from previous visit', tags: ['response', 'improvement'] },
      { id: '92', category: 'response', text: 'Patient condition stable, no significant changes', tags: ['response', 'stable'] },
      { id: '93', category: 'response', text: 'Patient progressing toward goals as expected', tags: ['response', 'progress'] },
      { id: '94', category: 'response', text: 'Patient compliant with treatment plan', tags: ['response', 'compliance'] },
    ],
  };

  return phraseLibrary[category] || [];
}
