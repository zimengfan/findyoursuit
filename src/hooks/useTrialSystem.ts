import { useState, useEffect } from 'react';

export const useTrialSystem = () => {
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    const trialUsed = localStorage.getItem('suitcraft_trial_used');
    setHasUsedTrial(trialUsed === 'true');
  }, []);

  const useTrial = () => {
    localStorage.setItem('suitcraft_trial_used', 'true');
    setHasUsedTrial(true);
  };

  const checkTrialOrPromptSignup = () => {
    if (!hasUsedTrial) {
      useTrial();
      return true;
    } else {
      setShowSignupPrompt(true);
      return false;
    }
  };

  return { hasUsedTrial, showSignupPrompt, setShowSignupPrompt, checkTrialOrPromptSignup };
}; 