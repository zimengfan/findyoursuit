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
import { useNavigate } from 'react-router-dom';

export interface UserPreferences {
  occasion: string;
  colorPreference: string;
  bodyType: string;
  skinTone: string;
}

const initialPreferences: UserPreferences = {
  occasion: '',
  colorPreference: '',
  bodyType: '',
  skinTone: '',
};

// Custom smooth scroll function
function smoothScrollToElement(element: HTMLElement, duration = 800) {
  const startY = window.scrollY;
  const endY = element.getBoundingClientRect().top + window.scrollY;
  const distance = endY - startY;
  let startTime: number | null = null;

  function step(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(progress));
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  window.requestAnimationFrame(step);
}

const Recommendations = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Recommendations] Current step changed:', currentStep);
  }, [currentStep]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    console.log('[Recommendations] handleNext called, currentStep:', currentStep);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateRecommendation();
    }
  };

  const handleBack = () => {
    console.log('[Recommendations] handleBack called, currentStep:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateRecommendation = async () => {
    console.log('[Recommendations] handleGenerateRecommendation called. isGenerating:', isGenerating);
    if (isGenerating) return; // Prevent double execution
    setIsGenerating(true);
    console.log('[Recommendations] Generating recommendation with preferences:', preferences);
    try {
      const result = await getAIRecommendationWithImages(preferences);
      console.log('[Recommendations] Recommendation result received:', result);
      setRecommendation(result);
      setCurrentStep(4); // Move to results
    } catch (error) {
      console.error('[Recommendations] Error generating recommendation:', error);
    } finally {
      setIsGenerating(false);
      console.log('[Recommendations] isGenerating set to false');
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      console.log('[Recommendations] Preferences updated:', newPrefs);
      return newPrefs;
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.occasion !== '';
      case 2:
        return preferences.colorPreference !== '';
      case 3:
        return preferences.bodyType !== '' && preferences.skinTone !== '';
      default:
        return false;
    }
  };

  const resetForm = () => {
    console.log('[Recommendations] Form reset');
    setCurrentStep(1);
    setPreferences(initialPreferences);
    setRecommendation(null);
  };

  useEffect(() => {
    if (mainContentRef.current) {
      smoothScrollToElement(mainContentRef.current, 800);
    }
  }, [currentStep]);

  if (currentStep === 4 && recommendation) {
    return <RecommendationResult recommendation={recommendation} onReset={resetForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold">Your Style Profile</h1>
            <p className="text-lg text-blue-100 mt-2">
                Tell us your preferences to get a personalized recommendation.
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
                onClick={() => { console.log('[Recommendations] Generate button clicked'); handleNext(); }}
                disabled={!canProceed() || isGenerating}
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

export default Recommendations; 