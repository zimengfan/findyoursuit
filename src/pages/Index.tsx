import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Shirt, Sparkles, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

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

  const handleNavigate = () => {
    navigate('/recommendations');
  };

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
              onClick={handleNavigate}
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
              onClick={handleNavigate}
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
                onClick={handleNavigate}
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
            onClick={handleNavigate}
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
