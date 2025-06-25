import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: 'month',
    features: ['50 recommendations/month', 'Premium support', 'Style insights']
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    price: '$24.99',
    period: '3 months',
    features: ['50 recommendations/month', 'Premium support', 'Style insights', 'Seasonal trends']
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$89.99',
    period: 'year',
    features: ['50 recommendations/month', 'Premium support', 'Style insights', 'All seasonal trends', 'Personal stylist chat']
  }
];

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    // TODO: Integrate Stripe checkout
    alert(`Subscribe to ${planId} (implement Stripe logic)`);
  };

  return (
    <div className="flex gap-6">
      {plans.map(plan => (
        <Card key={plan.id} className="p-6 flex-1">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-2xl font-semibold mb-2">{plan.price} <span className="text-base font-normal">/ {plan.period}</span></div>
          <ul className="mb-4">
            {plan.features.map(f => <li key={f}><Badge className="mr-2">{f}</Badge></li>)}
          </ul>
          <Button onClick={() => handleSubscribe(plan.id)} disabled={user?.subscription_tier === plan.id}>
            {user?.subscription_tier === plan.id ? 'Current Plan' : 'Subscribe'}
          </Button>
        </Card>
      ))}
    </div>
  );
}; 