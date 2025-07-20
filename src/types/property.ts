export interface Property {
  id: string
  userId: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFootage?: number
  description?: string
  propertyType: 'house' | 'condo' | 'townhouse' | 'apartment' | 'commercial'
  status: 'active' | 'pending' | 'sold'
  createdAt: string
  updatedAt: string
}

export interface PropertyMedia {
  id: string
  propertyId: string
  userId: string
  type: 'photo' | 'video'
  url: string
  filename: string
  order: number
  createdAt: string
}

export interface MarketingKit {
  id: string
  propertyId: string
  userId: string
  tourUrl: string
  socialMediaContent: {
    instagram: string[]
    facebook: string[]
    tiktok: string[]
    youtube: string[]
  }
  downloadUrl: string
  createdAt: string
}