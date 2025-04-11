
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Camera, 
  CheckCircle2, 
  MapPin, 
  Megaphone, 
  Upload, 
  UserCircle 
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden clean-city-gradient text-white">
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Making Our Cities Cleaner, Together
                </h1>
                <p className="text-lg opacity-90">
                  Report issues, track progress, and contribute to a cleaner, better India with our civic engagement platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login">
                    <Button size="lg" variant="default" className="bg-white text-civic-blue hover:bg-gray-100">
                      Report an Issue
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center animate-fade-in animation-delay-200">
                <div className="relative w-full max-w-md h-80 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4">
                    <Camera className="h-16 w-16 text-white animate-pulse-slow" />
                    <p className="text-center text-white text-lg font-medium">
                      Capture, Report, Resolve
                    </p>
                    <p className="text-center text-white/80 text-sm">
                      Snap a photo of civic issues and track resolutions in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="city-card p-6 bg-white flex flex-col items-center text-center animate-fade-in animation-delay-100">
                <div className="rounded-full bg-primary/10 p-4 mb-6">
                  <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Report Issues</h3>
                <p className="text-muted-foreground">
                  Easily report civic issues with photos, videos, and location data directly from your device.
                </p>
              </div>
              
              <div className="city-card p-6 bg-white flex flex-col items-center text-center animate-fade-in animation-delay-300">
                <div className="rounded-full bg-civic-green/10 p-4 mb-6">
                  <Building2 className="h-8 w-8 text-civic-green" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Municipal Action</h3>
                <p className="text-muted-foreground">
                  Reports are sent to the relevant municipal departments for quick assessment and action.
                </p>
              </div>
              
              <div className="city-card p-6 bg-white flex flex-col items-center text-center animate-fade-in animation-delay-500">
                <div className="rounded-full bg-civic-orange/10 p-4 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-civic-orange" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
                <p className="text-muted-foreground">
                  Get real-time updates on issue resolution status and provide feedback on completed work.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Highlight */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4 animate-fade-in">
                <div className="rounded-full bg-primary/10 p-3 mt-1">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Photo & Video Capture</h3>
                  <p className="text-muted-foreground">
                    Document issues with clear images and videos to help municipal teams understand the problem better.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 animate-fade-in animation-delay-100">
                <div className="rounded-full bg-primary/10 p-3 mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Location Tracking</h3>
                  <p className="text-muted-foreground">
                    Automatically attach precise location data to help authorities locate issues quickly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 animate-fade-in animation-delay-200">
                <div className="rounded-full bg-primary/10 p-3 mt-1">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Citizen Dashboard</h3>
                  <p className="text-muted-foreground">
                    Track all your reported issues, their current status, and history in one convenient dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 animate-fade-in animation-delay-300">
                <div className="rounded-full bg-primary/10 p-3 mt-1">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Progress Updates</h3>
                  <p className="text-muted-foreground">
                    Receive notifications as your reported issues progress through the resolution process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join CivicPulse India Today</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Be part of the movement to build cleaner, better cities across India. Your voice matters.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-civic-green hover:bg-civic-green/90">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
