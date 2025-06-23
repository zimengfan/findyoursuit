
import React, { useState } from 'react';
import { UserPreferences } from '@/pages/Index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OccasionStepProps {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const occasions = [
  { id: 'wedding', label: 'Wedding', description: 'Guest or participant in a wedding ceremony' },
  { id: 'interview', label: 'Job Interview', description: 'Professional interview or meeting' },
  { id: 'business', label: 'Business Meeting', description: 'Corporate meetings and presentations' },
  { id: 'date', label: 'Date Night', description: 'Romantic dinner or special evening out' },
  { id: 'gala', label: 'Gala/Formal Event', description: 'Black-tie or formal evening event' },
  { id: 'graduation', label: 'Graduation', description: 'Graduation ceremony or celebration' },
  { id: 'funeral', label: 'Funeral/Memorial', description: 'Respectful and conservative attire' },
  { id: 'cocktail', label: 'Cocktail Party', description: 'Semi-formal social gathering' }
];

const OccasionStep: React.FC<OccasionStepProps> = ({ preferences, updatePreferences }) => {
  const [customOccasion, setCustomOccasion] = useState('');

  const handleOccasionSelect = (occasionId: string) => {
    updatePreferences({ occasion: occasionId });
    if (occasionId !== 'custom') {
      setCustomOccasion('');
    }
  };

  const handleCustomOccasionChange = (value: string) => {
    setCustomOccasion(value);
    updatePreferences({ occasion: `custom:${value}` });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          What's the Occasion?
        </h2>
        <p className="text-slate-600 text-lg">
          Let's start by understanding the event you're dressing for. This helps us recommend 
          the appropriate level of formality and style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {occasions.map((occasion) => (
          <Card
            key={occasion.id}
            className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
              preferences.occasion === occasion.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={() => handleOccasionSelect(occasion.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg mb-2">
                  {occasion.label}
                </h3>
                <p className="text-slate-600 text-sm">
                  {occasion.description}
                </p>
              </div>
              {preferences.occasion === occasion.id && (
                <Badge className="ml-2 bg-blue-500">
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Occasion Section */}
      <div className="mb-6">
        <Card
          className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
            preferences.occasion?.startsWith('custom:')
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-slate-200 hover:border-blue-300'
          }`}
          onClick={() => handleOccasionSelect('custom')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-lg mb-2">
                Custom Occasion
              </h3>
              <p className="text-slate-600 text-sm">
                Describe your specific event or occasion
              </p>
            </div>
            {preferences.occasion?.startsWith('custom:') && (
              <Badge className="ml-2 bg-blue-500">
                Selected
              </Badge>
            )}
          </div>
          
          {(preferences.occasion?.startsWith('custom:') || preferences.occasion === 'custom') && (
            <div className="space-y-2">
              <Label htmlFor="custom-occasion" className="text-sm font-medium text-slate-700">
                Describe your occasion
              </Label>
              <Input
                id="custom-occasion"
                type="text"
                placeholder="e.g., Company holiday party, First date, Art gallery opening..."
                value={customOccasion}
                onChange={(e) => handleCustomOccasionChange(e.target.value)}
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </Card>
      </div>

      {preferences.occasion && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">
            Great choice! We'll tailor our recommendations for your{' '}
            <span className="font-bold">
              {preferences.occasion.startsWith('custom:') 
                ? preferences.occasion.replace('custom:', '')
                : occasions.find(o => o.id === preferences.occasion)?.label
              }
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default OccasionStep;
