import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingCart as CartIcon,
  CreditCard,
  MapPin,
  Clock,
  Check,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  features: string[]
}

interface AddOn {
  id: string
  name: string
  price: number
  selected: boolean
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Premium Real Estate Package',
      description: 'Professional photography with HDR processing and virtual staging',
      price: 450,
      quantity: 1,
      features: ['25-30 HDR Photos', 'Virtual Staging (3 rooms)', 'Same-day delivery', 'MLS-ready sizing']
    }
  ])

  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: '1', name: 'Drone Photography', price: 150, selected: false },
    { id: '2', name: 'Twilight Photos', price: 100, selected: false },
    { id: '3', name: 'Floor Plan', price: 75, selected: false },
    { id: '4', name: 'Video Walkthrough', price: 200, selected: false },
    { id: '5', name: 'Social Media Kit', price: 50, selected: false }
  ])

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    propertyAddress: '',
    specialInstructions: '',
    preferredDate: '',
    preferredTime: ''
  })

  const packages = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: 250,
      description: 'Essential real estate photography',
      features: ['15-20 HDR Photos', 'Basic editing', '24-hour delivery', 'MLS-ready sizing'],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 450,
      description: 'Professional photography with enhanced features',
      features: ['25-30 HDR Photos', 'Virtual Staging (3 rooms)', 'Same-day delivery', 'MLS-ready sizing', 'Property website'],
      popular: true
    },
    {
      id: 'luxury',
      name: 'Luxury Package',
      price: 750,
      description: 'Complete marketing solution for high-end properties',
      features: ['40+ HDR Photos', 'Virtual Staging (5 rooms)', 'Drone photography', 'Video walkthrough', 'Marketing flyer', 'Social media kit'],
      popular: false
    }
  ]

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
    toast.success('Item removed from cart')
  }

  const toggleAddOn = (id: string) => {
    setAddOns(addOns => 
      addOns.map(addon => 
        addon.id === id 
          ? { ...addon, selected: !addon.selected }
          : addon
      )
    )
  }

  const addPackage = (packageId: string) => {
    const selectedPackage = packages.find(p => p.id === packageId)
    if (!selectedPackage) return

    const newItem: CartItem = {
      id: Date.now().toString(),
      name: selectedPackage.name,
      description: selectedPackage.description,
      price: selectedPackage.price,
      quantity: 1,
      features: selectedPackage.features
    }

    setCartItems(items => [...items, newItem])
    toast.success('Package added to cart')
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const addOnTotal = addOns.filter(addon => addon.selected).reduce((sum, addon) => sum + addon.price, 0)
  const total = subtotal + addOnTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      toast.error('Please add items to your cart')
      return
    }

    if (!clientInfo.name || !clientInfo.email || !clientInfo.propertyAddress) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.success('Order submitted successfully! We\'ll contact you shortly to confirm your booking.')
    
    // Reset form
    setCartItems([])
    setAddOns(addOns => addOns.map(addon => ({ ...addon, selected: false })))
    setClientInfo({
      name: '',
      email: '',
      phone: '',
      company: '',
      propertyAddress: '',
      specialInstructions: '',
      preferredDate: '',
      preferredTime: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">HDPhotoHub</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Photography Services</h1>
          <p className="text-gray-600 mt-2">Choose your photography package and add-ons</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Package</CardTitle>
                <CardDescription>Select the photography package that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${pkg.popular ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      {pkg.popular && (
                        <Badge className="absolute -top-2 left-4">Most Popular</Badge>
                      )}
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-primary">${pkg.price}</p>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={pkg.popular ? "default" : "outline"}
                        onClick={() => addPackage(pkg.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle>Add-On Services</CardTitle>
                <CardDescription>Enhance your package with additional services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {addOns.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Checkbox 
                        checked={addon.selected}
                        onCheckedChange={() => toggleAddOn(addon.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-sm text-gray-600">+${addon.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Please provide your contact and property details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Agency</Label>
                      <Input 
                        id="company"
                        value={clientInfo.company}
                        onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Property Address *</Label>
                    <Input 
                      id="address"
                      value={clientInfo.propertyAddress}
                      onChange={(e) => setClientInfo({...clientInfo, propertyAddress: e.target.value})}
                      placeholder="123 Main Street, City, State, ZIP"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Preferred Date</Label>
                      <Input 
                        id="date"
                        type="date"
                        value={clientInfo.preferredDate}
                        onChange={(e) => setClientInfo({...clientInfo, preferredDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select value={clientInfo.preferredTime} onValueChange={(value) => setClientInfo({...clientInfo, preferredTime: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                          <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea 
                      id="instructions"
                      value={clientInfo.specialInstructions}
                      onChange={(e) => setClientInfo({...clientInfo, specialInstructions: e.target.value})}
                      placeholder="Any special requirements or notes for the photographer..."
                      rows={3}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CartIcon className="h-5 w-5 mr-2" />
                  Your Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="border-b pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-medium">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}

                    {addOns.filter(addon => addon.selected).map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center text-sm">
                        <span>{addon.name}</span>
                        <span>${addon.price}</span>
                      </div>
                    ))}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal}</span>
                      </div>
                      {addOnTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Add-ons:</span>
                          <span>${addOnTotal}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${total}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleSubmit}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Submit Order
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                    <span>Same-day delivery available</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>5-star rated photographers</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Serving your local area</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}