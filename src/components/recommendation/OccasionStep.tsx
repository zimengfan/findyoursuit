
import React from 'react';
import { UserPreferences } from '@/pages/Index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {occasions.map((occasion) => (
          <Card
            key={occasion.id}
            className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:shadow-lg ${
              preferences.occasion === occasion.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={() => updatePreferences({ occasion: occasion.id })}
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

      {preferences.occasion && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">
            Great choice! We'll tailor our recommendations for your{' '}
            <span className="font-bold">
              {occasions.find(o => o.id === preferences.occasion)?.label}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default OccasionStep;
