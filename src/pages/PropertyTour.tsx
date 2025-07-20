import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, ArrowRight, Home, Bed, Bath, Square, MapPin, Share2, Heart, Phone, Mail } from 'lucide-react'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface PropertyTourProps {
  propertyId: string
  onNavigate: (page: string, propertyId?: string) => void
}

interface PropertyData {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFootage?: number
  propertyType: string
  description: string
  status: string
}

interface MediaFile {
  id: string
  type: 'photo' | 'video'
  url: string
  filename: string
  mediaOrder: number
}

export default function PropertyTour({ propertyId, onNavigate }: PropertyTourProps) {
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [media, setMedia] = useState<MediaFile[]>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const { toast } = useToast()

  const loadPropertyData = useCallback(async () => {
    try {
      console.log('Loading property data for ID:', propertyId)
      
      // Load property details
      const propertyData = await blink.db.properties.list({
        where: { id: propertyId },
        limit: 1
      })
      
      if (propertyData.length === 0) {
        throw new Error('Property not found')
      }
      
      setProperty(propertyData[0])
      console.log('Property loaded:', propertyData[0])
      
      // Load property media
      const mediaData = await blink.db.propertyMedia.list({
        where: { propertyId: propertyId },
        orderBy: { mediaOrder: 'asc' }
      })
      
      setMedia(mediaData)
      console.log('Media loaded:', mediaData.length, 'files')
      
    } catch (error) {
      console.error('Error loading property data:', error)
      toast({
        title: "Error",
        description: "Failed to load property tour",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [propertyId, toast])

  useEffect(() => {
    loadPropertyData()
  }, [loadPropertyData])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextMedia = () => {
    if (currentMediaIndex < media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1)
    }
  }

  const shareProperty = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link Copied!",
      description: "Property tour link copied to clipboard"
    })
  }

  const toggleLike = () => {
    setLiked(!liked)
    toast({
      title: liked ? "Removed from favorites" : "Added to favorites",
      description: liked ? "Property removed from your favorites" : "Property added to your favorites"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property tour...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-gray-600 mb-6">
              The property tour you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentMedia = media[currentMediaIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Property Tour</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleLike}
                className={liked ? "text-red-600 border-red-200" : ""}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
                {liked ? "Liked" : "Like"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareProperty}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media Gallery */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {media.length > 0 ? (
                  <div className="relative">
                    {/* Main Media Display */}
                    <div className="aspect-video bg-gray-100 relative">
                      {currentMedia?.type === 'photo' ? (
                        <img
                          src={currentMedia.url}
                          alt={`Property photo ${currentMediaIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : currentMedia?.type === 'video' ? (
                        <video
                          src={currentMedia.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Navigation Arrows */}
                      {media.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                            onClick={prevMedia}
                            disabled={currentMediaIndex === 0}
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                            onClick={nextMedia}
                            disabled={currentMediaIndex === media.length - 1}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Media Counter */}
                      {media.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentMediaIndex + 1} / {media.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Strip */}
                    {media.length > 1 && (
                      <div className="p-4 bg-white">
                        <div className="flex space-x-2 overflow-x-auto">
                          {media.map((mediaItem, index) => (
                            <button
                              key={mediaItem.id}
                              onClick={() => setCurrentMediaIndex(index)}
                              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                index === currentMediaIndex 
                                  ? 'border-blue-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {mediaItem.type === 'photo' ? (
                                <img
                                  src={mediaItem.url}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-2 border-l-white border-y-2 border-y-transparent ml-0.5"></div>
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No media available for this property</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            {/* Price and Address */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-green-600 mb-2">
                      {formatPrice(property.price)}
                    </CardTitle>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {property.propertyType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Bed className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-2xl font-bold">{property.bedrooms}</span>
                    <span className="text-sm text-gray-600">Bedrooms</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-2xl font-bold">{property.bathrooms}</span>
                    <span className="text-sm text-gray-600">Bathrooms</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Square className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-2xl font-bold">
                      {property.squareFootage ? property.squareFootage.toLocaleString() : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-600">Sq Ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in This Property?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Contact us to schedule a viewing or get more information about this property.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}