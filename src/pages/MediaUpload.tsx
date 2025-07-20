import { useState, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Upload, X, ArrowLeft, Image, Video, Zap, Instagram, Facebook, Youtube, Share2 } from 'lucide-react'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface MediaUploadProps {
  user: any
  onNavigate: (page: string, propertyId?: string) => void
}

interface UploadedFile {
  file: File
  preview: string
  type: 'photo' | 'video'
  uploaded?: boolean
  url?: string
}

export default function MediaUpload({ user, onNavigate }: MediaUploadProps) {
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [propertyData, setPropertyData] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    propertyType: '',
    description: ''
  })
  const [marketingKit, setMarketingKit] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = []
    
    Array.from(selectedFiles).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        newFiles.push({
          file,
          preview,
          type: file.type.startsWith('image/') ? 'photo' : 'video'
        })
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = e.dataTransfer.files
    handleFileSelect(droppedFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const uploadFiles = async () => {
    setUploading(true)
    setUploadProgress(0)
    
    try {
      const uploadedFiles: UploadedFile[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { publicUrl } = await blink.storage.upload(
          file.file,
          `properties/${user.id}/${Date.now()}-${file.file.name}`,
          { upsert: true }
        )
        
        uploadedFiles.push({
          ...file,
          uploaded: true,
          url: publicUrl
        })
        
        setUploadProgress(((i + 1) / files.length) * 100)
      }
      
      setFiles(uploadedFiles)
      setStep(2)
      
      toast({
        title: "Success!",
        description: `Uploaded ${files.length} files successfully`
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const generateMarketingKit = async () => {
    setGenerating(true)
    setGenerationProgress(0)
    setCurrentStep('Initializing...')
    
    try {
      console.log('🚀 Starting marketing kit generation...')
      console.log('📋 Property data:', propertyData)
      console.log('📁 Files:', files.length)
      console.log('👤 User:', user.id)

      // Validate required data
      if (!propertyData.address || !propertyData.price || !propertyData.bedrooms || !propertyData.bathrooms || !propertyData.propertyType) {
        throw new Error('Missing required property information')
      }

      if (files.length === 0) {
        throw new Error('No media files uploaded')
      }

      // Ensure user exists in database first
      setCurrentStep('Setting up user account...')
      setGenerationProgress(10)
      try {
        console.log('👤 Checking if user exists in database...')
        const existingUsers = await blink.db.users.list({ where: { id: user.id } })
        
        if (existingUsers.length === 0) {
          console.log('👤 User not found, creating user record...')
          const userData = {
            id: user.id,
            email: user.email || 'noemail@example.com',
            displayName: user.displayName || user.email || 'User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          await blink.db.users.create(userData)
          console.log('✅ User created successfully')
        } else {
          console.log('✅ User already exists')
        }
      } catch (userError) {
        console.error('❌ Error handling user:', userError)
        // Continue anyway - the user might exist but we can't query it
      }

      // Create or get a default client record
      setCurrentStep('Creating client profile...')
      setGenerationProgress(20)
      let clientId = `client_${Date.now()}`
      let client
      
      try {
        console.log('👥 Checking for existing client...')
        const existingClients = await blink.db.clients.list({ 
          where: { 
            userId: user.id,
            email: user.email || 'noemail@example.com'
          },
          limit: 1
        })
        
        if (existingClients.length > 0) {
          console.log('✅ Using existing client')
          client = existingClients[0]
          clientId = client.id
        } else {
          console.log('👥 Creating new client with ID:', clientId)
          
          const clientData = {
            id: clientId,
            userId: user.id, // Use camelCase for SDK
            name: user.displayName || user.email || 'Default Client',
            email: user.email || 'noemail@example.com',
            phone: '',
            company: '',
            address: propertyData.address,
            notes: 'Auto-created client for property listing'
          }
          console.log('👥 Client data:', clientData)
          
          client = await blink.db.clients.create(clientData)
          console.log('✅ Client created:', client)
        }
      } catch (clientError) {
        console.error('❌ Error with client creation:', clientError)
        // If client creation fails, try with a different ID
        clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('🔄 Retrying with new client ID:', clientId)
        
        const clientData = {
          id: clientId,
          userId: user.id,
          name: user.displayName || user.email || 'Default Client',
          email: user.email || 'noemail@example.com',
          phone: '',
          company: '',
          address: propertyData.address,
          notes: 'Auto-created client for property listing'
        }
        
        client = await blink.db.clients.create(clientData)
        console.log('✅ Client created on retry:', client)
      }

      // Create property record
      setCurrentStep('Saving property details...')
      setGenerationProgress(30)
      const propertyId = `prop_${Date.now()}`
      console.log('🏠 Creating property with ID:', propertyId)
      
      const propertyDataToSave = {
        id: propertyId,
        userId: user.id, // Use camelCase for SDK
        clientId: clientId, // Use camelCase for SDK
        address: propertyData.address,
        price: parseInt(propertyData.price),
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseFloat(propertyData.bathrooms),
        squareFootage: propertyData.squareFootage ? parseInt(propertyData.squareFootage) : null,
        propertyType: propertyData.propertyType, // Use camelCase for SDK
        description: propertyData.description || '',
        status: 'active',
        listingPrice: parseInt(propertyData.price) // Use camelCase for SDK
      }
      console.log('🏠 Property data:', propertyDataToSave)
      
      const property = await blink.db.properties.create(propertyDataToSave)
      console.log('✅ Property created:', property)

      // Save media files
      setCurrentStep('Uploading media files...')
      setGenerationProgress(40)
      console.log('📸 Saving media files...')
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.url) {
          const mediaData = {
            id: `media_${Date.now()}_${i}`,
            propertyId: propertyId, // Use camelCase for SDK
            userId: user.id, // Use camelCase for SDK
            type: file.type,
            url: file.url,
            filename: file.file.name,
            mediaOrder: i // Use camelCase for SDK
          }
          console.log(`📸 Saving media ${i + 1}:`, mediaData)
          await blink.db.propertyMedia.create(mediaData)
        }
      }
      console.log('✅ All media files saved')

      // Generate marketing content using AI
      setCurrentStep('Generating social media content with AI...')
      setGenerationProgress(50)
      console.log('🤖 Generating AI content...')
      const tourUrl = `${window.location.origin}/tour/${propertyId}`
      
      const socialMediaPrompt = `Create engaging social media content for a ${propertyData.propertyType} property at ${propertyData.address} priced at ${parseInt(propertyData.price).toLocaleString()}. The property has ${propertyData.bedrooms} bedrooms and ${propertyData.bathrooms} bathrooms. Generate content for Instagram, Facebook, TikTok, and YouTube.`
      
      console.log('🤖 AI Prompt:', socialMediaPrompt)
      
      const { object: socialContent } = await blink.ai.generateObject({
        prompt: socialMediaPrompt,
        schema: {
          type: 'object',
          properties: {
            instagram: {
              type: 'array',
              items: { type: 'string' },
              description: 'Instagram post captions and story ideas'
            },
            facebook: {
              type: 'array', 
              items: { type: 'string' },
              description: 'Facebook post content'
            },
            tiktok: {
              type: 'array',
              items: { type: 'string' },
              description: 'TikTok video ideas and captions'
            },
            youtube: {
              type: 'array',
              items: { type: 'string' },
              description: 'YouTube video titles and descriptions'
            }
          },
          required: ['instagram', 'facebook', 'tiktok', 'youtube']
        }
      })
      
      console.log('✅ AI content generated:', socialContent)

      // Generate social media videos using uploaded property images
      setCurrentStep('Creating custom videos for each platform...')
      setGenerationProgress(65)
      console.log('🎬 Generating social media videos...')
      const videoPrompts = [
        `Create a professional Instagram story video showcasing this ${propertyData.propertyType} property. Show elegant transitions between rooms with modern typography overlay displaying "${propertyData.bedrooms} bed, ${propertyData.bathrooms} bath" and the price "${parseInt(propertyData.price).toLocaleString()}". Use a luxury real estate aesthetic with clean, minimal design.`,
        `Generate a Facebook video post featuring this property with a warm, inviting atmosphere. Include text overlay with key details and a call-to-action "Schedule Your Tour Today". Use professional real estate video styling.`,
        `Create a dynamic TikTok-style video with quick cuts and trendy transitions showcasing the property highlights. Include modern text animations and trending real estate hashtags overlay. Make it engaging for younger buyers.`,
        `Design a YouTube thumbnail-style image for a property tour video. Include the property price prominently, bedroom/bathroom count, and "VIRTUAL TOUR" text. Use professional real estate branding with high contrast and readable fonts.`
      ]

      const generatedVideos = []
      
      // Use the first uploaded image as reference for video generation
      const referenceImages = files.filter(f => f.type === 'photo' && f.url).slice(0, 3).map(f => f.url!)
      
      if (referenceImages.length > 0) {
        for (let i = 0; i < videoPrompts.length; i++) {
          try {
            const platforms = ['Instagram', 'Facebook', 'TikTok', 'YouTube']
            setCurrentStep(`Creating ${platforms[i]} video (${i + 1}/4)...`)
            setGenerationProgress(65 + (i * 5)) // 65, 70, 75, 80
            console.log(`🎬 Generating video ${i + 1}/4...`)
            const { data } = await blink.ai.modifyImage({
              images: referenceImages,
              prompt: videoPrompts[i],
              size: i === 2 ? '1024x1536' : '1536x1024', // TikTok vertical, others horizontal
              quality: 'high',
              n: 1
            })
            
            if (data && data[0]?.url) {
              generatedVideos.push({
                platform: ['instagram', 'facebook', 'tiktok', 'youtube'][i],
                url: data[0].url,
                prompt: videoPrompts[i]
              })
              console.log(`✅ Generated ${['Instagram', 'Facebook', 'TikTok', 'YouTube'][i]} video`)
            }
          } catch (videoError) {
            console.error(`❌ Failed to generate video ${i + 1}:`, videoError)
            // Continue with other videos even if one fails
          }
        }
      } else {
        console.log('⚠️ No reference images available for video generation')
      }
      
      console.log('✅ Video generation completed:', generatedVideos)

      // Create marketing kit record
      setCurrentStep('Finalizing marketing kit...')
      setGenerationProgress(90)
      const marketingKitId = `kit_${Date.now()}`
      console.log('📦 Creating marketing kit with ID:', marketingKitId)
      
      const marketingKitData = {
        id: marketingKitId,
        propertyId: propertyId, // Use camelCase for SDK
        userId: user.id, // Use camelCase for SDK
        kitType: 'social_media', // Use camelCase for SDK
        content: JSON.stringify(socialContent),
        tourUrl: tourUrl, // Use camelCase for SDK
        socialMediaContent: JSON.stringify(socialContent), // Use camelCase for SDK
        generatedVideos: JSON.stringify(generatedVideos), // Use camelCase for SDK
        downloadUrl: `${window.location.origin}/download/${propertyId}`, // Use camelCase for SDK
        generatedUrl: tourUrl // Use camelCase for SDK
      }
      
      console.log('📦 Marketing kit data:', marketingKitData)
      
      const marketingKit = await blink.db.marketingKits.create(marketingKitData)
      console.log('✅ Marketing kit created:', marketingKit)
      
      // Set the marketing kit state for UI display
      setMarketingKit({
        ...marketingKitData,
        tourUrl: tourUrl, // Keep camelCase for UI display
        socialMediaContent: socialContent,
        generatedVideos: generatedVideos,
        property: property
      })
      
      setCurrentStep('Complete!')
      setGenerationProgress(100)
      setStep(3)
      
      console.log('🎉 Marketing kit generation completed successfully!')
      
      toast({
        title: "Marketing Kit Generated!",
        description: "Your professional marketing materials are ready"
      })
    } catch (error) {
      console.error('❌ Generation error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        propertyData,
        filesCount: files.length,
        userId: user.id
      })
      
      toast({
        title: "Generation Failed",
        description: `Failed to generate marketing kit: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
      if (generationProgress < 100) {
        setGenerationProgress(0)
        setCurrentStep('')
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard"
    })
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('dashboard')}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create Marketing Kit</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600">Step 1 of 3</span>
              <span className="text-sm text-gray-500">Upload Media</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Property Photos & Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drag and drop your files here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse your device
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, MP4, MOV (Max 10MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />

              {/* File Preview */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Selected Files ({files.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {file.type === 'photo' ? (
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-2 left-2"
                        >
                          {file.type === 'photo' ? <Image className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                          {file.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading files...</span>
                    <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Next Button */}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={uploadFiles}
                  disabled={files.length === 0 || uploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Uploading...' : `Upload ${files.length} Files & Continue`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600">Step 2 of 3</span>
              <span className="text-sm text-gray-500">Property Information</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State 12345"
                    value={propertyData.address}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="500000"
                    value={propertyData.price}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select 
                    value={propertyData.propertyType} 
                    onValueChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    value={propertyData.bedrooms}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, bedrooms: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={propertyData.bathrooms}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, bathrooms: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    placeholder="2000"
                    value={propertyData.squareFootage}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, squareFootage: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Beautiful property with amazing features..."
                    value={propertyData.description}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Generation Progress */}
              {generating && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-900">{currentStep}</span>
                    <span className="text-sm text-blue-700">{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-3 mb-2" />
                  <p className="text-xs text-blue-600">
                    This process typically takes 2-3 minutes. We're creating custom content and videos for your property.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={generateMarketingKit}
                  disabled={!propertyData.address || !propertyData.price || !propertyData.bedrooms || !propertyData.bathrooms || !propertyData.propertyType || generating}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{generating ? 'Generating Content & Videos...' : 'Generate Marketing Kit'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 3 && marketingKit) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('dashboard')}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Marketing Kit Ready!</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-green-600">Step 3 of 3</span>
              <span className="text-sm text-gray-500">Marketing Kit Generated</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          {/* Success Message */}
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Marketing Kit Generated Successfully!</h3>
                  <p className="text-green-700">Your professional marketing materials are ready to share and download.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Tour Link */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Property Tour Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input 
                  value={marketingKit.tourUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  onClick={() => copyToClipboard(marketingKit.tourUrl)}
                  variant="outline"
                >
                  Copy Link
                </Button>
                <Button 
                  onClick={() => onNavigate('tour', marketingKit.property.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Tour
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Generated Videos */}
          {marketingKit.generatedVideos && marketingKit.generatedVideos.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-600" />
                  Auto-Generated Social Media Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketingKit.generatedVideos.map((video: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <img 
                          src={video.url} 
                          alt={`${video.platform} video`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {video.platform === 'instagram' && <Instagram className="w-3 h-3 mr-1 text-pink-600" />}
                          {video.platform === 'facebook' && <Facebook className="w-3 h-3 mr-1 text-blue-600" />}
                          {video.platform === 'tiktok' && <Video className="w-3 h-3 mr-1 text-black" />}
                          {video.platform === 'youtube' && <Youtube className="w-3 h-3 mr-1 text-red-600" />}
                          {video.platform}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(video.url, '_blank')}
                          className="flex-1"
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(video.url)}
                        >
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> These videos are optimized for each platform's format and audience. 
                    Download and upload directly to your social media accounts for maximum engagement!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Media Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Instagram className="w-5 h-5 mr-2 text-pink-600" />
                  Instagram Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingKit.socialMediaContent.instagram.map((content: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{content}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(content)}
                        className="mt-2"
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facebook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Facebook Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingKit.socialMediaContent.facebook.map((content: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{content}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(content)}
                        className="mt-2"
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* TikTok */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-black" />
                  TikTok Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingKit.socialMediaContent.tiktok.map((content: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{content}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(content)}
                        className="mt-2"
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* YouTube */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Youtube className="w-5 h-5 mr-2 text-red-600" />
                  YouTube Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingKit.socialMediaContent.youtube.map((content: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{content}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(content)}
                        className="mt-2"
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <Button 
              onClick={() => onNavigate('dashboard')}
              variant="outline"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => {
                setStep(1)
                setFiles([])
                setPropertyData({
                  address: '',
                  price: '',
                  bedrooms: '',
                  bathrooms: '',
                  squareFootage: '',
                  propertyType: '',
                  description: ''
                })
                setMarketingKit(null)
              }}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Create Another Kit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}