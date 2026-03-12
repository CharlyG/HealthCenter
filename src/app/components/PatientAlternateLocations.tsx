import { useState, useEffect } from 'react';
import * as dataGateway from '../lib/dataGateway';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, MapPin, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AlternateLocation {
  id: string;
  patient_id: string;
  name: string;
  address: string;
  phone?: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
}

interface PatientAlternateLocationsProps {
  patientId: string;
}

export default function PatientAlternateLocations({ patientId }: PatientAlternateLocationsProps) {
  const [locations, setLocations] = useState<AlternateLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AlternateLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadLocations();
  }, [patientId]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await dataGateway.getAlternateLocations(patientId);
      setLocations(res.locations || []);
    } catch (error: any) {
      console.error('Error loading alternate locations:', error);
      toast.error(error.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location?: AlternateLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address,
        phone: location.phone || '',
        notes: location.notes || '',
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', address: '', phone: '', notes: '' });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingLocation) {
        await dataGateway.updateAlternateLocation(patientId, editingLocation.id, formData);
        toast.success('Location updated successfully');
      } else {
        await dataGateway.createAlternateLocation(
          patientId,
          formData.name,
          formData.address,
          formData.phone,
          formData.notes
        );
        toast.success('Location created successfully');
      }
      setShowDialog(false);
      loadLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error.message || 'Failed to save location');
    }
  };

  const handleLogicalDelete = async (locationId: string) => {
    const confirmed = window.confirm(
      'This will mark the location as deleted. It cannot be selected for new visits, but existing visits will retain the reference. Continue?'
    );

    if (!confirmed) return;

    try {
      await dataGateway.updateAlternateLocation(patientId, locationId, {
        is_deleted: true,
      });
      toast.success('Location marked as deleted');
      loadLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast.error(error.message || 'Failed to delete location');
    }
  };

  const activeLocations = locations.filter(l => !l.is_deleted);
  const deletedLocations = locations.filter(l => l.is_deleted);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading locations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Locations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alternate Locations</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="size-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No alternate locations</p>
              <p className="text-sm">Add locations where the patient may receive care</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLocations.map((location) => (
                <div
                  key={location.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="size-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{location.address}</p>
                        {location.phone && <p>Phone: {location.phone}</p>}
                        {location.notes && (
                          <p className="text-gray-500 italic">{location.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(location)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogicalDelete(location.id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deleted Locations (shown for reference) */}
      {deletedLocations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-yellow-600" />
              <CardTitle>Deleted Locations (Reference Only)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deletedLocations.map((location) => (
                <div
                  key={location.id}
                  className="border border-yellow-200 rounded-lg p-4 bg-yellow-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="size-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Deleted
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{location.address}</p>
                        {location.phone && <p>Phone: {location.phone}</p>}
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        Cannot be used for new visits. Existing visits retain this reference.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add Alternate Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Update the location details'
                : 'Add a new location where the patient may receive care'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daughter's House"
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.address}
            >
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
