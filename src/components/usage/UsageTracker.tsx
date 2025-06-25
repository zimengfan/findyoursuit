import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

export const UsageTracker: React.FC = () => {
  const { user } = useAuth();
  
  const getUsageLimit = () => {
    if (!user) return 1; // Trial user
    return user.subscription_tier === 'free' ? 5 : 50;
  };

  const usagePercentage = user ? (user.monthly_usage / getUsageLimit()) * 100 : 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-2">Monthly Usage</h3>
      <Progress value={usagePercentage} className="mb-2" />
      <p className="text-sm text-gray-600">
        {user?.monthly_usage || 0} / {getUsageLimit()} recommendations used
      </p>
    </div>
  );
}; 