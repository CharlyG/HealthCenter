/**
 * SN Linkage Modal
 * Link assessment findings to goals, interventions, and orders
 */

import React, { useState } from 'react';
import { X, Link2, Plus, Check } from 'lucide-react';

interface SNLinkageModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: {
    type: string;
    description: string;
  };
  onLink: (linkages: {
    goals: string[];
    interventions: string[];
    orders: string[];
    notifyPhysician: boolean;
  }) => void;
}

export function SNLinkageModal({ isOpen, onClose, finding, onLink }: SNLinkageModalProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [notifyPhysician, setNotifyPhysician] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newIntervention, setNewIntervention] = useState('');
  const [newOrder, setNewOrder] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onLink({
      goals: selectedGoals,
      interventions: selectedInterventions,
      orders: selectedOrders,
      notifyPhysician,
    });
    onClose();
  };

  // Mock data - in production, fetch from patient's care plan
  const availableGoals = [
    'Improve skin integrity',
    'Reduce pain to manageable levels',
    'Prevent falls and injury',
    'Improve medication compliance',
    'Maintain cardiovascular stability',
    'Improve respiratory function',
    'Maintain adequate nutrition/hydration',
  ];

  const availableInterventions = [
    'Wound care per protocol',
    'Pain management education',
    'Fall prevention education',
    'Medication reconciliation',
    'Vital signs monitoring',
    'Patient/caregiver education',
    'Home safety assessment',
    'Skilled nursing observation and assessment',
  ];

  const availableOrders = [
    'PT evaluation',
    'OT evaluation',
    'MSW evaluation',
    'Lab work - CBC',
    'Lab work - BMP',
    'Wound culture',
    'Change in medication',
    'DME order',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Link Finding to Care Plan</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {finding.type}: {finding.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Goals Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Link to Goals</h3>
            <div className="space-y-2">
              {availableGoals.map((goal) => (
                <label key={goal} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g !== goal));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add new goal..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => {
                  if (newGoal.trim()) {
                    setSelectedGoals([...selectedGoals, newGoal]);
                    setNewGoal('');
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {/* Interventions Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Link to Interventions</h3>
            <div className="space-y-2">
              {availableInterventions.map((intervention) => (
                <label key={intervention} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedInterventions.includes(intervention)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInterventions([...selectedInterventions, intervention]);
                      } else {
                        setSelectedInterventions(selectedInterventions.filter(i => i !== intervention));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{intervention}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newIntervention}
                onChange={(e) => setNewIntervention(e.target.value)}
                placeholder="Add new intervention..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => {
                  if (newIntervention.trim()) {
                    setSelectedInterventions([...selectedInterventions, newIntervention]);
                    setNewIntervention('');
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {/* Orders Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Orders Needed</h3>
            <div className="space-y-2">
              {availableOrders.map((order) => (
                <label key={order} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order]);
                      } else {
                        setSelectedOrders(selectedOrders.filter(o => o !== order));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{order}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                placeholder="Add new order..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => {
                  if (newOrder.trim()) {
                    setSelectedOrders([...selectedOrders, newOrder]);
                    setNewOrder('');
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {/* Physician Notification */}
          <div>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={notifyPhysician}
                onChange={(e) => setNotifyPhysician(e.target.checked)}
                className="rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Notify Physician</span>
                <p className="text-xs text-gray-500 mt-0.5">This finding requires physician notification</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedGoals.length + selectedInterventions.length + selectedOrders.length} items selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Linkages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
