import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import { Shirt } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'SuitCraft AI helped me find the perfect look for my big event. The membership is totally worth it!',
    name: 'Jordan Smith',
    handle: '@jordansmith',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    quote: 'No more annoying ads and I can tweak my recommendations as much as I want. Love the credits system too!',
    name: 'Emily Chen',
    handle: '@emchen',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
  },
  {
    quote: 'The seasonal plan is perfect for my needs. Highly recommend for anyone who wants more control over their style.',
    name: 'Carlos Rivera',
    handle: '@carlosr',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  {
    quote: "SuitCraft AI's nuanced AI changes feature is a game changer. My results are always spot-on.",
    name: 'Sophie Lee',
    handle: '@sophielee',
    avatar: 'https://randomuser.me/api/portraits/women/77.jpg',
  },
];

const plans = [
  {
    name: 'Monthly',
    price: '$9',
    period: 'month',
    cta: 'Get Monthly',
    features: [
      'No ads (ad pop-ups removed)',
      'Unlimited nuanced AI changes to your recommendations',
      'Priority support',
      'Access to all style features',
    ],
  },
  {
    name: 'Seasonal',
    price: '$24',
    period: '3 months',
    cta: 'Get Seasonal',
    features: [
      'No ads (ad pop-ups removed)',
      'Unlimited nuanced AI changes to your recommendations',
      'Priority support',
      'Access to all style features',
      'Best for seasonal wardrobe updates',
    ],
    popular: true,
  },
  {
    name: 'Yearly',
    price: '$79',
    period: 'year',
    cta: 'Get Yearly',
    features: [
      'No ads (ad pop-ups removed)',
      'Unlimited nuanced AI changes to your recommendations',
      'Priority support',
      'Access to all style features',
      'Best value for year-round style',
    ],
  },
];

const credits = [
  { amount: 10, price: '$2.99' },
  { amount: 50, price: '$12.99' },
  { amount: 100, price: '$19.99' },
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Bar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shirt className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800 cursor-pointer" onClick={() => navigate('/')}>SuitCraft AI</span>
              <Link to="/pricing" className="ml-6 text-base font-medium text-blue-700 underline">Pricing</Link>
            </div>
            <div className="flex items-center gap-2">
              {user ? <UserProfile /> : <button className="px-4 py-2 border rounded text-blue-700 font-semibold" onClick={() => navigate('/signin', { state: { from: '/pricing' } })}>Sign In</button>}
            </div>
          </div>
        </div>
      </nav>
      {/* Membership Plans */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">Membership Plans</h1>
        <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">Choose the plan that fits your style journey. All memberships remove ads, unlock unlimited nuanced AI changes, and give you priority support.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl bg-white shadow-xl border border-slate-200 p-8 flex flex-col ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center mb-2">
                <span className="text-lg font-bold text-slate-800">{plan.name}</span>
                {plan.popular && <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">Most Popular</span>}
              </div>
              <div className="text-slate-500 mb-4">{plan.name === 'Monthly' ? 'Perfect for trying out premium features.' : plan.name === 'Seasonal' ? 'Best for seasonal wardrobe updates.' : 'Best value for year-round style.'}</div>
              <div className="text-4xl font-bold text-blue-700 mb-2">{plan.price}<span className="text-lg font-normal text-slate-600"> / {plan.period}</span></div>
              <ul className="mb-6 mt-2 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center text-slate-700"><span className="mr-2 text-green-500">✓</span> {f}</li>
                ))}
              </ul>
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-full font-semibold text-base transition">{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
      {/* Buy Credits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Buy Credits</h2>
          <p className="text-slate-600 mb-6">Need more recommendations or want to try advanced features? Purchase credits and use them anytime. Credits never expire.</p>
          <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center">
            {credits.map(c => (
              <button key={c.amount} className="flex-1 border border-blue-200 rounded-lg px-6 py-4 text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 transition text-lg">
                {c.amount} credits <span className="block text-slate-500 text-base font-normal">{c.price}</span>
              </button>
            ))}
          </div>
          <ul className="text-xs text-slate-500 list-disc list-inside text-center">
            <li>Credits can be used for extra recommendations or advanced AI features.</li>
            <li>Credits never expire.</li>
          </ul>
        </div>
      </div>
      {/* Info Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow border border-slate-200 p-8 mt-8 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Why go premium?</h3>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li><span className="font-semibold text-blue-700">No ads:</span> Free users will see ad pop-ups when generating recommendations. Upgrade to remove all ads.</li>
            <li><span className="font-semibold text-blue-700">Nuanced AI changes:</span> Paid members can ask the AI for nuanced changes to their recommendations using a simple textbox on the results page.</li>
            <li><span className="font-semibold text-blue-700">Buy credits:</span> Get more recommendations or unlock advanced features anytime by purchasing credits.</li>
            <li><span className="font-semibold text-blue-700">Priority support:</span> Get help fast from our team.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 