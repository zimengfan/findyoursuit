import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import OccasionStep from '@/components/recommendation/OccasionStep';
import PreferencesStep from '@/components/recommendation/PreferencesStep';
import PersonalInfoStep from '@/components/recommendation/PersonalInfoStep';
import RecommendationResult from '@/components/recommendation/RecommendationResult';
import { getAIRecommendationWithImages } from '@/services/aiRecommendationService';
import { Sparkles, Shirt, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface UserPreferences {
  occasion: string;
  season: string;
  colorPreference: string;
  formalityLevel: string;
  bodyType: string;
  skinTone: string;
  age: string;
}

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16 w-full">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-6">
          <Shirt className="h-12 w-12 mr-4 text-blue-300" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
            SuitCraft AI
          </h1>
        </div>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Discover your perfect suit with AI-powered recommendations. Get personalized, multi-view outfit previews tailored to your style, body type, and preferences. Try it for free—no signup required!
        </p>
        <button
          onClick={onStart}
          className="mt-10 px-10 py-4 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-colors duration-200"
        >
          Try for Free
        </button>
      </div>
    </div>
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">How it works</h2>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="bg-white/80 rounded-xl shadow-md p-6 flex-1 min-w-[220px]">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">1. Tell Us About You</h3>
          <p className="text-slate-700">Select your occasion, style, and preferences. Our AI learns your needs.</p>
        </div>
        <div className="bg-white/80 rounded-xl shadow-md p-6 flex-1 min-w-[220px]">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">2. Get AI Recommendations</h3>
          <p className="text-slate-700">Receive a full outfit breakdown and see your look from multiple angles.</p>
        </div>
        <div className="bg-white/80 rounded-xl shadow-md p-6 flex-1 min-w-[220px]">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">3. Save or Share</h3>
          <p className="text-slate-700">Download your recommendation or share it with friends instantly.</p>
        </div>
      </div>
    </div>
  </div>
);

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

const Index = () => {
  const [showFlow, setShowFlow] = useState(false);
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
  const navigate = useNavigate();

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
    if (showFlow && mainContentRef.current) {
      smoothScrollToElement(mainContentRef.current, 800);
    }
  }, [showFlow, currentStep]);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Recommendations",
      description: "Advanced AI analyzes your preferences, body type, and occasion to suggest the perfect suit combination."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Personal Styling",
      description: "Get personalized styling advice based on your skin tone, season, and formality requirements."
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: "Expert Curation",
      description: "Our recommendations are backed by fashion expertise and industry best practices."
    }
  ];

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Business Executive",
      content: "SuitCraft AI helped me find the perfect suit for my wedding. The recommendations were spot-on and the AI explanations were incredibly helpful.",
      rating: 5
    },
    {
      name: "James Rodriguez",
      role: "Recent Graduate",
      content: "As someone new to professional wear, this platform gave me confidence. The budget-friendly options were perfect for my job interviews.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Entrepreneur",
      content: "The seasonal recommendations and color matching advice transformed my wardrobe. I get compliments on my style choices regularly now.",
      rating: 5
    }
  ];

  const benefits = [
    "Save hours of research and shopping",
    "Get professional styling advice instantly",
    "Build confidence with perfect-fitting recommendations",
    "Learn about fashion and style fundamentals",
    "Discover new combinations you'd never considered"
  ];

  if (!showFlow) {
    return <LandingPage onStart={() => setShowFlow(true)} />;
  }

  if (currentStep === 4 && recommendation) {
    return <RecommendationResult recommendation={recommendation} onReset={resetForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shirt className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">SuitCraft AI</span>
            </div>
            <Button 
              onClick={() => navigate('/recommendations')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            ✨ AI-Powered Fashion Intelligence
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Find Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
              Perfect Suit
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Our advanced AI analyzes your preferences, body type, and occasion to recommend the perfect suit combination. 
            Get professional styling advice in seconds, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/recommendations')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6"
            >
              Start Your Style Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-slate-300 hover:border-blue-400"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose SuitCraft AI?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience the future of personal styling with our intelligent recommendation system.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                Transform Your Style Game
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate('/recommendations')}
                className="mt-8 bg-blue-600 hover:bg-blue-700"
              >
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Shirt className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">
                    Interactive Style Preview
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands who've transformed their style with SuitCraft AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Upgrade Your Style?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Get your personalized suit recommendation in under 3 minutes. 
            No account required to start.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/recommendations')}
            className="bg-white text-blue-600 hover:bg-slate-50 text-lg px-8 py-6"
          >
            Get My Recommendation
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shirt className="h-6 w-6" />
              <span className="text-xl font-bold">SuitCraft AI</span>
            </div>
            <p className="text-slate-400 text-center md:text-right">
              © 2024 SuitCraft AI. Crafted with AI for the modern gentleman.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
