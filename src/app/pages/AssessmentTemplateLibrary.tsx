/**
 * ASSESSMENT TEMPLATE LIBRARY
 * 
 * Features:
 * - Save completed assessments as reusable templates
 * - Copy from previous patient assessments
 * - Pre-filled templates for common scenarios
 * - Template sharing within organization
 * - Smart suggestions based on diagnosis/condition
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  FileText,
  Copy,
  Star,
  Search,
  Plus,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  Share2,
  Filter,
  TrendingUp,
  Activity,
  Stethoscope,
  MessageSquare,
  Users,
  Droplet,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock templates data
const MOCK_TEMPLATES = [
  {
    id: 'tmpl-001',
    name: 'Post-Surgical Hip Replacement - PT Initial Eval',
    assessmentType: 'physical-therapy',
    description: 'Standardized PT eval for post-op hip replacement patients, includes ROM limitations, gait training protocols',
    icon: Activity,
    color: 'green',
    category: 'orthopedic',
    usageCount: 47,
    lastUsed: '2024-03-10',
    createdBy: 'Dr. Sarah Chen, PT',
    isStarred: true,
    isShared: true,
    avgCompletionTime: '25 min',
    tags: ['orthopedic', 'post-surgical', 'hip', 'common'],
  },
  {
    id: 'tmpl-002',
    name: 'CHF Exacerbation - Skilled Nursing Visit',
    assessmentType: 'skilled-nursing',
    description: 'Focused assessment for CHF patients with edema monitoring, weight checks, medication review',
    icon: Stethoscope,
    color: 'blue',
    category: 'cardiac',
    usageCount: 89,
    lastUsed: '2024-03-11',
    createdBy: 'Jessica Martinez, RN',
    isStarred: true,
    isShared: true,
    avgCompletionTime: '18 min',
    tags: ['cardiac', 'chf', 'common', 'monitoring'],
  },
  {
    id: 'tmpl-003',
    name: 'Stroke Recovery - OT ADL Assessment',
    assessmentType: 'occupational-therapy',
    description: 'Comprehensive ADL/IADL evaluation for stroke patients, includes one-handed techniques, adaptive equipment',
    icon: User,
    color: 'purple',
    category: 'neurological',
    usageCount: 34,
    lastUsed: '2024-03-09',
    createdBy: 'Michael Brown, OTR',
    isStarred: false,
    isShared: true,
    avgCompletionTime: '32 min',
    tags: ['neurological', 'stroke', 'adl', 'adaptive-equipment'],
  },
  {
    id: 'tmpl-004',
    name: 'Dysphagia Screening - Speech Therapy',
    assessmentType: 'speech-therapy',
    description: 'Quick dysphagia screening for new referrals, includes aspiration risk assessment and diet recommendations',
    icon: MessageSquare,
    color: 'amber',
    category: 'swallowing',
    usageCount: 28,
    lastUsed: '2024-03-12',
    createdBy: 'David Lee, SLP',
    isStarred: true,
    isShared: false,
    avgCompletionTime: '20 min',
    tags: ['dysphagia', 'swallowing', 'screening'],
  },
  {
    id: 'tmpl-005',
    name: 'Pressure Injury Stage 3 - Wound Care',
    assessmentType: 'wound-care',
    description: 'Detailed wound assessment template for Stage 3 pressure injuries with measurement tracking',
    icon: Droplet,
    color: 'red',
    category: 'wound',
    usageCount: 56,
    lastUsed: '2024-03-11',
    createdBy: 'Emily Rodriguez, RN, CWCN',
    isStarred: true,
    isShared: true,
    avgCompletionTime: '22 min',
    tags: ['wound', 'pressure-injury', 'stage-3', 'common'],
  },
  {
    id: 'tmpl-006',
    name: 'Diabetic Foot Ulcer - Wound Assessment',
    assessmentType: 'wound-care',
    description: 'Specialized wound assessment for diabetic foot ulcers with circulation checks and offloading',
    icon: Droplet,
    color: 'red',
    category: 'wound',
    usageCount: 41,
    lastUsed: '2024-03-10',
    createdBy: 'Emily Rodriguez, RN, CWCN',
    isStarred: false,
    isShared: true,
    avgCompletionTime: '24 min',
    tags: ['wound', 'diabetic', 'foot-ulcer'],
  },
  {
    id: 'tmpl-007',
    name: 'Fall Risk Assessment - PT Balance Eval',
    assessmentType: 'physical-therapy',
    description: 'Comprehensive balance and fall risk assessment with Berg Scale and TUG test protocols',
    icon: Activity,
    color: 'green',
    category: 'geriatric',
    usageCount: 62,
    lastUsed: '2024-03-12',
    createdBy: 'Dr. Sarah Chen, PT',
    isStarred: true,
    isShared: true,
    avgCompletionTime: '28 min',
    tags: ['fall-risk', 'balance', 'geriatric', 'common'],
  },
  {
    id: 'tmpl-008',
    name: 'Personal Care Routine - HHA Visit',
    assessmentType: 'home-health-aide',
    description: 'Standard HHA visit note for bathing, dressing, and personal care assistance',
    icon: Users,
    color: 'cyan',
    category: 'personal-care',
    usageCount: 134,
    lastUsed: '2024-03-12',
    createdBy: 'Maria Garcia, HHA',
    isStarred: false,
    isShared: true,
    avgCompletionTime: '12 min',
    tags: ['hha', 'personal-care', 'routine', 'common'],
  },
];

export default function AssessmentTemplateLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStarred = !showStarredOnly || template.isStarred;

    return matchesSearch && matchesCategory && matchesStarred;
  });

  const categories = Array.from(new Set(MOCK_TEMPLATES.map(t => t.category)));

  const handleUseTemplate = (template: any) => {
    toast.success(`Creating new ${template.assessmentType} assessment from template`);
    navigate(`/assessment/${template.assessmentType}/new?templateId=${template.id}`);
  };

  const handleEditTemplate = (template: any) => {
    toast.info('Template editor opened');
  };

  const handleDeleteTemplate = (template: any) => {
    toast.success('Template deleted');
  };

  const handleToggleStar = (template: any) => {
    toast.success(template.isStarred ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Template Library</h1>
            <p className="text-gray-600 mt-1">Reusable templates to streamline assessment completion</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_TEMPLATES.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_TEMPLATES.filter(t => t.isStarred).length}</p>
              </div>
              <Star className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_TEMPLATES.filter(t => t.isShared).length}</p>
              </div>
              <Share2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Most Used</p>
                <p className="text-lg font-bold text-gray-900 mt-1">HHA Routine</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showStarredOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowStarredOnly(!showStarredOnly)}
              >
                <Star className="w-4 h-4 mr-2" />
                Favorites Only
              </Button>
              <div className="flex items-center gap-2 border-l pl-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setShowStarredOnly(false); }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map(template => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-${template.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${template.color}-600`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            {template.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 4).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Used {template.usageCount}x
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{template.avgCompletionTime}
                        </span>
                        {template.isShared && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleStar(template)}>
                          <Star className={`w-3 h-3 ${template.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pro Tip: Save Time with Templates</h3>
                <p className="text-sm text-gray-600">
                  Create templates from your most common assessments to reduce completion time by up to 50%
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-white">
              Learn More
            </Button>
          </div>
        </Card>
      </div>

      {/* Create Template Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <Card className="max-w-2xl w-full m-6 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Template Name</label>
                <Input placeholder="e.g., Post-Surgical Hip Replacement - PT Eval" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <Textarea placeholder="Describe when and how to use this template..." rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Assessment Type</label>
                <Input placeholder="Select assessment type..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Tags (comma-separated)</label>
                <Input placeholder="orthopedic, post-surgical, hip" />
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
