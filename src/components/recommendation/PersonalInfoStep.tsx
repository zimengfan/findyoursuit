
import React from 'react';
import { UserPreferences } from '@/pages/Index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonalInfoStepProps {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ preferences, updatePreferences }) => {
  const bodyTypes = [
    { 
      id: 'slim', 
      label: 'Slim/Lean', 
      description: 'Narrow shoulders, minimal chest, lean build',
      recommendation: 'Slim-fit cuts will complement your frame'
    },
    { 
      id: 'athletic', 
      label: 'Athletic', 
      description: 'Broad shoulders, defined chest, muscular build',
      recommendation: 'Tailored fits work best for your physique'
    },
    { 
      id: 'average', 
      label: 'Average', 
      description: 'Balanced proportions, standard build',
      recommendation: 'Classic and modern fits both work well'
    },
    { 
      id: 'broad', 
      label: 'Broad/Heavy', 
      description: 'Fuller chest, broader midsection',
      recommendation: 'Classic fits provide comfort and style'
    }
  ];

  const skinTones = [
    { 
      id: 'fair', 
      label: 'Fair/Light', 
      description: 'Light complexion, may have pink undertones',
      colors: 'Navy, charcoal, and jewel tones work well'
    },
    { 
      id: 'medium', 
      label: 'Medium', 
      description: 'Balanced complexion with neutral undertones',
      colors: 'Most colors complement your skin tone'
    },
    { 
      id: 'olive', 
      label: 'Olive', 
      description: 'Warm undertones with yellow or green hints',
      colors: 'Earth tones and warm colors are ideal'
    },
    { 
      id: 'dark', 
      label: 'Dark', 
      description: 'Rich, deep complexion',
      colors: 'Bold colors and lighter shades create great contrast'
    }
  ];

  const SelectionGrid: React.FC<{
    title: string;
    subtitle?: string;
    options: any[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }> = ({ title, subtitle, options, selectedValue, onSelect }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      {subtitle && <p className="text-slate-600 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={`p-5 cursor-pointer transition-all duration-200 border hover:shadow-md ${
              selectedValue === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-semibold text-slate-800">{option.label}</h4>
                  {selectedValue === option.id && (
                    <Badge className="ml-2 bg-blue-500">Selected</Badge>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-2">{option.description}</p>
                <p className="text-blue-700 text-sm font-medium">
                  💡 {option.recommendation || option.colors}
                </p>
              </div>
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
          Personal Styling Details
        </h2>
        <p className="text-slate-600 text-lg">
          These final details help us recommend the perfect fit and colors that complement you best.
        </p>
      </div>

      <SelectionGrid
        title="Body Type"
        subtitle="This helps us recommend the best suit cut and fit for your physique."
        options={bodyTypes}
        selectedValue={preferences.bodyType}
        onSelect={(value) => updatePreferences({ bodyType: value })}
      />

      <SelectionGrid
        title="Skin Tone"
        subtitle="Understanding your skin tone helps us suggest colors that make you look your best."
        options={skinTones}
        selectedValue={preferences.skinTone}
        onSelect={(value) => updatePreferences({ skinTone: value })}
      />

      {preferences.bodyType && preferences.skinTone && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Ready to Generate Your Recommendation!</h4>
          <p className="text-blue-700">
            We have all the information we need to create a personalized suit recommendation 
            tailored specifically for you. Click "Generate Recommendation" to see your custom styling advice.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoStep;
