import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Settings, CreditCard, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  // Fallback mock data if not signed in
  const profile = user ? {
    name: user.email.split('@')[0],
    email: user.email,
    avatar: '',
    tier: user.subscription_tier === 'free' ? 'Free' : user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1),
    monthlyUsage: user.monthly_usage,
    monthlyLimit: user.subscription_tier === 'free' ? 5 : 50,
    joinDate: '2024', // You can add join date to user if you want
  } : {
    name: 'Guest',
    email: 'guest@example.com',
    avatar: '',
    tier: 'Free',
    monthlyUsage: 0,
    monthlyLimit: 5,
    joinDate: '2024',
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Monthly': return 'bg-blue-100 text-blue-800';
      case 'Seasonal': return 'bg-green-100 text-green-800';
      case 'Yearly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditProfile = () => {
    // TODO: Open edit profile modal
    console.log('Edit profile clicked');
  };

  const handleManageSubscription = () => {
    // TODO: Open subscription management
    console.log('Manage subscription clicked');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription Tier */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Plan</span>
              <Badge className={getTierColor(profile.tier)}>
                {profile.tier}
              </Badge>
            </div>

            {/* Usage Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="text-sm text-muted-foreground">
                  {profile.monthlyUsage}/{profile.monthlyLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(profile.monthlyUsage / profile.monthlyLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-muted-foreground">{profile.joinDate}</span>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={handleEditProfile}
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={handleManageSubscription}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Usage Analytics
              </Button>
              <Separator className="my-2" />
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700" 
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfile; 