import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SignupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
}

export const SignupPrompt: React.FC<SignupPromptProps> = ({ isOpen, onClose, onSignup }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue Your Style Journey</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>You've used your free trial! Sign up to continue getting personalized recommendations.</p>
          <div className="flex space-x-3">
            <Button onClick={onSignup} className="flex-1">Sign Up</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Maybe Later</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 