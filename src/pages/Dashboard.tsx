import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Plus, Home, Eye, Share2, Download, LogOut, Zap, Instagram, Facebook, Video, Youtube } from 'lucide-react'
import { blink } from '../blink/client'
import { Property } from '../types/property'
import { useToast } from '../hooks/use-toast'

interface DashboardProps {
  user: any
  onNavigate: (page: string, propertyId?: string) => void
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingContent, setGeneratingContent] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const { toast } = useToast()

  const loadProperties = useCallback(async () => {
    try {
      const data = await blink.db.properties.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user.id, toast])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const generateSocialMediaContent = async (property: Property) => {
    setGeneratingContent(property.id)
    setGenerationProgress(0)
    setCurrentStep('Initializing...')
    
    // Set a timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      toast({
        title: "Generation Timeout",
        description: "Content generation is taking too long. Please try again.",
        variant: "destructive"
      })
      setGeneratingContent(null)
      setGenerationProgress(0)
      setCurrentStep('')
    }, 60000) // 60 second timeout
    
    try {
      console.log('🚀 Starting social media content generation for property:', property.id)

      // Get property media files
      setCurrentStep('Loading property media...')
      setGenerationProgress(20)
      
      const mediaFiles = await blink.db.propertyMedia.list({
        where: { propertyId: property.id },
        orderBy: { mediaOrder: 'asc' }
      })
      
      console.log('📸 Found media files:', mediaFiles.length)

      // Generate marketing content using AI
      setCurrentStep('Generating social media content with AI...')
      setGenerationProgress(40)
      
      const tourUrl = `${window.location.origin}/tour/${property.id}`
      
      const socialMediaPrompt = `Create engaging social media content for a ${property.propertyType} property at ${property.address} priced at ${property.price.toLocaleString()}. The property has ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms. Generate content for Instagram, Facebook, TikTok, and YouTube.`
      
      console.log('🤖 AI Prompt:', socialMediaPrompt)
      
      const { object: socialContent } = await blink.ai.generateObject({
        prompt: socialMediaPrompt,
        schema: {
          type: 'object',
          properties: {
            instagram: {
              type: 'string',
              description: 'Instagram post caption'
            },
            facebook: {
              type: 'string',
              description: 'Facebook post content'
            },
            tiktok: {
              type: 'string',
              description: 'TikTok video caption'
            },
            youtube: {
              type: 'string',
              description: 'YouTube video title and description'
            }
          },
          required: ['instagram', 'facebook', 'tiktok', 'youtube']
        }
      })
      
      console.log('✅ AI content generated:', socialContent)

      // Generate social media graphics (fast and efficient)
      setCurrentStep('Creating social media graphics...')
      setGenerationProgress(60)
      
      const socialMediaGraphics = []
      
      // Create simple, fast graphics for each platform
      const platforms = [
        { name: 'Instagram', size: '1080x1080', format: 'square' },
        { name: 'Facebook', size: '1200x630', format: 'landscape' },
        { name: 'TikTok', size: '1080x1920', format: 'vertical' },
        { name: 'YouTube', size: '1280x720', format: 'landscape' }
      ]
      
      // Use existing property images as reference
      const referenceImages = mediaFiles.filter(f => f.type === 'photo').slice(0, 2).map(f => f.url)
      
      if (referenceImages.length > 0) {
        try {
          setCurrentStep('Generating promotional graphics...')
          setGenerationProgress(70)
          
          // Generate one high-quality promotional image that can be used across platforms
          const { data } = await blink.ai.modifyImage({
            images: [referenceImages[0]], // Use just one image for speed
            prompt: `Create a professional real estate marketing graphic featuring this ${property.propertyType} property. Include elegant text overlay with "${property.bedrooms} bed, ${property.bathrooms} bath" and price "${property.price.toLocaleString()}". Use modern, clean design with luxury real estate branding. High contrast, readable fonts.`,
            size: '1536x1024',
            quality: 'high',
            n: 1
          })
          
          if (data && data[0]?.url) {
            // Use the same generated image for all platforms (can be resized as needed)
            platforms.forEach(platform => {
              socialMediaGraphics.push({
                platform: platform.name.toLowerCase(),
                url: data[0].url,
                size: platform.size,
                format: platform.format
              })
            })
            console.log('✅ Generated promotional graphics for all platforms')
          }
        } catch (graphicError) {
          console.error('❌ Failed to generate graphics:', graphicError)
          // Continue without graphics - text content is still valuable
        }
      }

      // Update or create marketing kit record
      setCurrentStep('Saving marketing kit...')
      setGenerationProgress(90)
      
      const marketingKitId = `kit_${Date.now()}`
      
      // Check if marketing kit already exists
      const existingKits = await blink.db.marketingKits.list({
        where: { propertyId: property.id },
        limit: 1
      })
      
      const marketingKitData = {
        propertyId: property.id,
        userId: user.id,
        kitType: 'social_media',
        content: JSON.stringify(socialContent),
        tourUrl: tourUrl,
        socialMediaContent: JSON.stringify(socialContent),
        generatedGraphics: JSON.stringify(socialMediaGraphics),
        downloadUrl: `${window.location.origin}/download/${property.id}`,
        generatedUrl: tourUrl
      }
      
      if (existingKits.length > 0) {
        // Update existing marketing kit
        await blink.db.marketingKits.update(existingKits[0].id, marketingKitData)
        console.log('✅ Marketing kit updated')
      } else {
        // Create new marketing kit
        await blink.db.marketingKits.create({
          id: marketingKitId,
          ...marketingKitData
        })
        console.log('✅ Marketing kit created')
      }
      
      setCurrentStep('Complete!')
      setGenerationProgress(100)
      
      toast({
        title: "Social Media Content Generated!",
        description: "Fresh marketing materials are ready for this property"
      })
      
      console.log('🎉 Social media content generation completed successfully!')
      
    } catch (error) {
      console.error('❌ Generation error:', error)
      toast({
        title: "Generation Failed",
        description: `Failed to generate content: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      clearTimeout(timeoutId) // Clear the timeout
      setGeneratingContent(null)
      setGenerationProgress(0)
      setCurrentStep('')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.email}</span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Home className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  <p className="text-gray-600">Total Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-gray-600">Active Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Share2 className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  <p className="text-gray-600">Marketing Kits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{properties.length * 4}</p>
                  <p className="text-gray-600">Social Media Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Progress */}
        {generatingContent && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-900">{currentStep}</span>
              <span className="text-sm text-blue-700">{Math.round(generationProgress)}%</span>
            </div>
            <Progress value={generationProgress} className="h-3 mb-2" />
            <p className="text-xs text-blue-600">
              Generating fresh social media content and videos for your property...
            </p>
          </div>
        )}

        {/* Create New Property */}
        <div className="mb-8">
          <Button 
            onClick={() => onNavigate('upload')}
            size="lg"
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Marketing Kit</span>
          </Button>
        </div>

        {/* Properties List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
          
          {properties.length === 0 ? (
            <Card className="p-12 text-center">
              <CardContent>
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first marketing kit. Upload photos and videos of a property 
                  to generate professional marketing materials.
                </p>
                <Button 
                  onClick={() => onNavigate('upload')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Marketing Kit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{property.address}</CardTitle>
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        {property.squareFootage && (
                          <span>{property.squareFootage.toLocaleString()} sqft</span>
                        )}
                      </div>

                      <div className="space-y-2 pt-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => onNavigate('tour', property.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Tour
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2"
                          onClick={() => generateSocialMediaContent(property)}
                          disabled={generatingContent === property.id}
                        >
                          <Zap className="w-4 h-4" />
                          <span>
                            {generatingContent === property.id ? 'Generating...' : 'Generate Social Media Content'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}