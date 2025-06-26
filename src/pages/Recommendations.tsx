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
import { useNavigate, Link } from 'react-router-dom';
import { updateUserExcel } from '@/lib/utils';
import { useAuth, getUsers } from '@/contexts/AuthContext';

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

const GUEST_DAILY_LIMIT = 5;
const GUEST_WEEKLY_LIMIT = 15;

function getGuestUsageTimestamps() {
  // Returns an array of ISO date strings
  return JSON.parse(localStorage.getItem('suitcraft_guest_usage_timestamps') || '[]');
}

function addGuestUsageTimestamp() {
  const now = new Date().toISOString();
  const timestamps = getGuestUsageTimestamps();
  timestamps.push(now);
  localStorage.setItem('suitcraft_guest_usage_timestamps', JSON.stringify(timestamps));
}

function getGuestUsageCounts() {
  const timestamps = getGuestUsageTimestamps();
  const now = new Date();
  // Daily: count timestamps from today
  const todayStr = now.toISOString().slice(0, 10);
  const dailyCount = timestamps.filter(ts => ts.slice(0, 10) === todayStr).length;
  // Weekly: count timestamps from last 7 days (rolling window)
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6); // 6 days ago + today = 7 days
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const weeklyCount = timestamps.filter(ts => ts.slice(0, 10) >= weekAgoStr).length;
  return { dailyCount, weeklyCount };
}

function cleanupOldGuestUsageTimestamps() {
  // Remove timestamps older than 7 days
  const timestamps = getGuestUsageTimestamps();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const filtered = timestamps.filter(ts => ts.slice(0, 10) >= weekAgoStr);
  localStorage.setItem('suitcraft_guest_usage_timestamps', JSON.stringify(filtered));
}

const Recommendations = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const { user, incrementUsage, canUseService } = useAuth();
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [guestUsage, setGuestUsage] = useState(getGuestUsageCounts());
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [showGuestWeekLimitModal, setShowGuestWeekLimitModal] = useState(false);

  useEffect(() => {
    console.log('[Recommendations] Current step changed:', currentStep);
  }, [currentStep]);

  useEffect(() => {
    cleanupOldGuestUsageTimestamps();
    setGuestUsage(getGuestUsageCounts());
  }, []);

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
    if (user) {
      if (!canUseService()) {
        setShowOutOfCredits(true);
        return;
      }
    } else {
      // Guest daily and rolling weekly limit logic
      cleanupOldGuestUsageTimestamps();
      const { dailyCount, weeklyCount } = getGuestUsageCounts();
      if (dailyCount >= GUEST_DAILY_LIMIT) {
        setShowGuestLimitModal(true);
        return;
      }
      if (weeklyCount >= GUEST_WEEKLY_LIMIT) {
        setShowGuestWeekLimitModal(true);
        return;
      }
      addGuestUsageTimestamp();
      setGuestUsage(getGuestUsageCounts());
    }
    if (isGenerating) return; // Prevent double execution
    setIsGenerating(true);
    console.log('[Recommendations] Generating recommendation with preferences:', preferences);
    try {
      const result = await getAIRecommendationWithImages(preferences);
      console.log('[Recommendations] Recommendation result received:', result);
      setRecommendation(result);
      setCurrentStep(4); // Move to results
      if (user) {
        await incrementUsage();
      }
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
    return <RecommendationResult recommendation={recommendation} onReset={resetForm} onReturnHome={() => setShowHomeConfirm(true)} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Return to Home Button */}
      <button
        className="absolute top-6 left-6 bg-white/90 border border-slate-200 rounded-lg px-4 py-2 text-blue-700 font-semibold shadow hover:bg-blue-50 transition z-50"
        onClick={() => setShowHomeConfirm(true)}
        aria-label="Back to Home"
      >
        ← Return to Home
      </button>
      {/* Are you sure modal */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-6">You will lose your current progress. Return to home?</p>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setShowHomeConfirm(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setFadeOut(true); setShowHomeConfirm(false); setTimeout(() => navigate('/'), 400); }}>Yes, Return Home</Button>
            </div>
          </div>
        </div>
      )}
      {/* Out of Credits Modal */}
      {showOutOfCredits && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Out of Credits</h2>
            <p className="mb-6">You've used your free recommendations. Please sign in for more access.</p>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setShowOutOfCredits(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
      {/* Guest Daily Limit Modal */}
      {showGuestLimitModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Daily Limit Reached</h2>
            <p className="mb-6">You've reached your free daily limit of {GUEST_DAILY_LIMIT} recommendations. Please come back tomorrow or sign in for more access.</p>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setShowGuestLimitModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
      {/* Guest Weekly Limit Modal */}
      {showGuestWeekLimitModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Weekly Limit Reached</h2>
            <p className="mb-6">You've reached your free weekly limit of {GUEST_WEEKLY_LIMIT} recommendations in the last 7 days. Please come back later or sign in for more access.</p>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setShowGuestWeekLimitModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
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