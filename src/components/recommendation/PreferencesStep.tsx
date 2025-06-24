import React, { useState } from 'react';
import type { UserPreferences } from '@/pages/Recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreferencesStepProps {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ preferences, updatePreferences }) => {
  const [customColor, setCustomColor] = useState(preferences.colorPreference.startsWith('custom:') ? preferences.colorPreference.replace('custom:', '') : '');

  const colorPreferences = [
    { id: 'ai-pick', label: 'Let AI Pick for You', icon: true, description: 'Our AI will choose the perfect colors based on your occasion and preferences' },
    { id: 'classic', label: 'Classic (Navy, Charcoal, Black)' },
    { id: 'earth', label: 'Earth Tones (Brown, Tan, Olive)' },
    { id: 'bold', label: 'Bold Colors (Burgundy, Forest Green)' },
    { id: 'light', label: 'Light Colors (Light Gray, Cream)' },
    { id: 'custom', label: 'Custom (Enter your own color)' }
  ];

  const formalityLevels = [
    { id: 'ai-pick', label: 'Let AI decide' },
    { id: 'formal', label: 'Formal' },
    { id: 'semi-formal', label: 'Semi-Formal' },
    { id: 'business-casual', label: 'Business Casual' },
    { id: 'black-tie', label: 'Black Tie' },
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
              (selectedValue === option.id || (option.id === 'custom' && selectedValue.startsWith('custom:')))
                ? option.id === 'ai-pick' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50'
                  : 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={e => {
              if (option.id === 'custom' && (e.target as HTMLElement).tagName === 'INPUT') return;
              if (option.id === 'custom') {
                onSelect('custom:' + customColor);
              } else {
                onSelect(option.id);
              }
            }}
          >
            <div className="flex items-start space-x-3">
              {option.icon && (
                <Sparkles className={`h-5 w-5 mt-0.5 ${
                  selectedValue === option.id ? 'text-purple-600' : 'text-purple-500'
                }`} />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  option.id === 'ai-pick' 
                    ? 'text-purple-700'
                    : option.colors || 'text-slate-800'
                }`}>
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                )}
              </div>
            </div>
            {(selectedValue === option.id || (option.id === 'custom' && selectedValue.startsWith('custom:'))) && (
              <Badge className={option.id === 'ai-pick' ? 'bg-purple-500' : 'bg-blue-500'}>
                ✓
              </Badge>
            )}
            {/* Custom color input */}
            {option.id === 'custom' && (selectedValue.startsWith('custom:') || selectedValue === 'custom') && (
              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Enter your preferred color (e.g. Emerald Green, Sky Blue)"
                  value={customColor}
                  onChange={e => {
                    setCustomColor(e.target.value);
                    onSelect('custom:' + e.target.value);
                  }}
                  className="w-full"
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Your Style Preferences
        </h2>
        <p className="text-slate-600 text-lg">
          Help us understand your style preferences to create the perfect recommendation.
        </p>
      </div>

      <SelectionGrid
        title="Color Preference"
        options={colorPreferences}
        selectedValue={preferences.colorPreference}
        onSelect={(value) => updatePreferences({ colorPreference: value })}
        keyName="colorPreference"
      />

      <div>
        <label htmlFor="formality-level" className="block text-sm font-medium text-gray-700 mb-2">
          Formality Level
        </label>
        <Select
          value={preferences.formalityLevel}
          onValueChange={(value) => updatePreferences({ formalityLevel: value })}
        >
          <SelectTrigger id="formality-level" className="w-full">
            <SelectValue placeholder="Select formality level..." />
          </SelectTrigger>
          <SelectContent>
            {formalityLevels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PreferencesStep;
