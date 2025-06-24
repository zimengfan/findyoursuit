import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import OccasionStep from '@/components/recommendation/OccasionStep';
import PreferencesStep from '@/components/recommendation/PreferencesStep';
import PersonalInfoStep from '@/components/recommendation/PersonalInfoStep';
import RecommendationResult from '@/components/recommendation/RecommendationResult';
import { getAIRecommendationWithImages } from '@/services/aiRecommendationService';
import { Sparkles, Shirt } from 'lucide-react';

export interface UserPreferences {
  occasion: string;
  season: string;
  colorPreference: string;
  formalityLevel: string;
  bodyType: string;
  skinTone: string;
  age: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    occasion: '',
    season: '',
    colorPreference: '',
    formalityLevel: '',
    bodyType: '',
    skinTone: '',
    age: ''
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateRecommendation();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateRecommendation = async () => {
    setIsGenerating(true);
    try {
      const result = await getAIRecommendationWithImages(preferences);
      setRecommendation(result);
      setCurrentStep(4); // Move to results
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.occasion !== '';
      case 2:
        return preferences.season !== '' && preferences.colorPreference !== '' && 
               preferences.formalityLevel !== '';
      case 3:
        return preferences.bodyType !== '' && preferences.skinTone !== '';
      default:
        return false;
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPreferences({
      occasion: '',
      season: '',
      colorPreference: '',
      formalityLevel: '',
      bodyType: '',
      skinTone: '',
      age: ''
    });
    setRecommendation(null);
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  if (currentStep === 4 && recommendation) {
    return <RecommendationResult recommendation={recommendation} onReset={resetForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shirt className="h-12 w-12 mr-4 text-blue-300" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              SuitCraft AI
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get personalized suit recommendations powered by AI. Perfect fits for every occasion, 
            tailored to your style, body type, and preferences.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div ref={mainContentRef} className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-slate-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            {isGenerating ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 mx-auto mb-6 text-blue-500 animate-spin" />
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Crafting Your Perfect Look
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Our AI is analyzing your preferences and creating a tailored recommendation just for you...
                </p>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <OccasionStep 
                    preferences={preferences} 
                    updatePreferences={updatePreferences} 
                  />
                )}
                {currentStep === 2 && (
                  <PreferencesStep 
                    preferences={preferences} 
                    updatePreferences={updatePreferences} 
                  />
                )}
                {currentStep === 3 && (
                  <PersonalInfoStep 
                    preferences={preferences} 
                    updatePreferences={updatePreferences} 
                  />
                )}
              </>
            )}
          </Card>

          {/* Navigation */}
          {!isGenerating && (
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-8"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {currentStep === totalSteps ? 'Generate Recommendation' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
