import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Upload, Share2, Smartphone, Zap, Instagram, Facebook, Youtube } from 'lucide-react'
import { blink } from '../blink/client'

interface LandingPageProps {
  onNavigate: (page: string, propertyId?: string) => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const handleGetStarted = () => {
    blink.auth.login()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PropertyKit</h1>
            </div>
            <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            DIY Real Estate Marketing
            <span className="text-blue-600 block">Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your property photos and videos, then instantly generate professional marketing kits 
            with property tours, social media content, and shareable links. Perfect for real estate agents 
            who want to create their own marketing materials.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
          >
            Start Creating Marketing Kits
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            3 Simple Steps to Professional Marketing
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">1. Upload Media</h4>
                <p className="text-gray-600">
                  Drag and drop your property photos and videos. Add basic property details like address, price, and features.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">2. Generate Kit</h4>
                <p className="text-gray-600">
                  Our AI instantly creates a complete marketing kit with property tours, social media content, and promotional materials.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">3. Share & Download</h4>
                <p className="text-gray-600">
                  Get shareable links for property tours and download pre-cut content for all your social media platforms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Property Marketing
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Mobile Optimized</h4>
              <p className="text-sm text-gray-600">Use on your phone while at properties</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Instagram className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold mb-2">Instagram Ready</h4>
              <p className="text-sm text-gray-600">Stories, posts, and reels pre-cut</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Facebook Posts</h4>
              <p className="text-sm text-gray-600">Optimized graphics and videos</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold mb-2">YouTube Content</h4>
              <p className="text-sm text-gray-600">Property tour videos ready to upload</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Property Marketing?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of real estate agents creating professional marketing materials in minutes, not hours.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Your First Marketing Kit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold">PropertyKit</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            Empowering real estate agents with DIY marketing tools
          </p>
        </div>
      </footer>
    </div>
  )
}