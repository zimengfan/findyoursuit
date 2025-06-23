
import React from 'react';
import { UserPreferences } from '@/pages/Index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PreferencesStepProps {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ preferences, updatePreferences }) => {
  const seasons = [
    { id: 'spring', label: 'Spring', colors: 'text-green-600' },
    { id: 'summer', label: 'Summer', colors: 'text-yellow-600' },
    { id: 'fall', label: 'Fall/Autumn', colors: 'text-orange-600' },
    { id: 'winter', label: 'Winter', colors: 'text-blue-600' }
  ];

  const colorPreferences = [
    { id: 'classic', label: 'Classic (Navy, Charcoal, Black)' },
    { id: 'earth', label: 'Earth Tones (Brown, Tan, Olive)' },
    { id: 'bold', label: 'Bold Colors (Burgundy, Forest Green)' },
    { id: 'light', label: 'Light Colors (Light Gray, Cream)' },
    { id: 'no-preference', label: 'No Preference' }
  ];

  const formalityLevels = [
    { id: 'black-tie', label: 'Black Tie', description: 'Most formal, tuxedo required' },
    { id: 'formal', label: 'Formal', description: 'Dark suit, conservative styling' },
    { id: 'semi-formal', label: 'Semi-Formal', description: 'Business attire, some flexibility' },
    { id: 'business-casual', label: 'Business Casual', description: 'Relaxed professional look' }
  ];

  const budgetRanges = [
    { id: 'budget', label: 'Budget-Friendly ($200-500)' },
    { id: 'mid-range', label: 'Mid-Range ($500-1200)' },
    { id: 'premium', label: 'Premium ($1200-2500)' },
    { id: 'luxury', label: 'Luxury ($2500+)' }
  ];

  const SelectionGrid: React.FC<{
    title: string;
    options: any[];
    selectedValue: string;
    onSelect: (value: string) => void;
    keyName: keyof UserPreferences;
  }> = ({ title, options, selectedValue, onSelect, keyName }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => (
          <Card
            key={option.id}
            className={`p-4 cursor-pointer transition-all duration-200 border hover:shadow-md ${
              selectedValue === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${option.colors || 'text-slate-800'}`}>
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                )}
              </div>
              {selectedValue === option.id && (
                <Badge className="bg-blue-500">✓</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Your Style Preferences
        </h2>
        <p className="text-slate-600 text-lg">
          Help us understand your style preferences to create the perfect recommendation.
        </p>
      </div>

      <SelectionGrid
        title="What season is it?"
        options={seasons}
        selectedValue={preferences.season}
        onSelect={(value) => updatePreferences({ season: value })}
        keyName="season"
      />

      <SelectionGrid
        title="Color Preference"
        options={colorPreferences}
        selectedValue={preferences.colorPreference}
        onSelect={(value) => updatePreferences({ colorPreference: value })}
        keyName="colorPreference"
      />

      <SelectionGrid
        title="Formality Level"
        options={formalityLevels}
        selectedValue={preferences.formalityLevel}
        onSelect={(value) => updatePreferences({ formalityLevel: value })}
        keyName="formalityLevel"
      />

      <SelectionGrid
        title="Budget Range"
        options={budgetRanges}
        selectedValue={preferences.budget}
        onSelect={(value) => updatePreferences({ budget: value })}
        keyName="budget"
      />
    </div>
  );
};

export default PreferencesStep;
