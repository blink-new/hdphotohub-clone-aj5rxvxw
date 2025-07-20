import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  Camera, 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  Navigation,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface TimeSlot {
  time: string
  available: boolean
  duration: string
}

interface Appointment {
  id: string
  date: string
  time: string
  client: string
  property: string
  service: string
  status: 'confirmed' | 'pending' | 'completed'
  duration: string
}

export default function Scheduling() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [appointmentForm, setAppointmentForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    company: '',
    propertyAddress: '',
    serviceType: '',
    duration: '',
    notes: ''
  })

  const timeSlots: TimeSlot[] = [
    { time: '8:00 AM', available: true, duration: '2 hours' },
    { time: '9:00 AM', available: false, duration: '2 hours' },
    { time: '10:00 AM', available: true, duration: '2 hours' },
    { time: '11:00 AM', available: true, duration: '2 hours' },
    { time: '12:00 PM', available: false, duration: '2 hours' },
    { time: '1:00 PM', available: true, duration: '2 hours' },
    { time: '2:00 PM', available: true, duration: '2 hours' },
    { time: '3:00 PM', available: true, duration: '2 hours' },
    { time: '4:00 PM', available: false, duration: '2 hours' },
    { time: '5:00 PM', available: true, duration: '2 hours' },
    { time: '6:00 PM', available: true, duration: '2 hours' }
  ]

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      date: '2024-01-22',
      time: '9:00 AM',
      client: 'Sunset Realty',
      property: '123 Oak Street',
      service: 'Premium Package',
      status: 'confirmed',
      duration: '2 hours'
    },
    {
      id: '2',
      date: '2024-01-22',
      time: '2:00 PM',
      client: 'Elite Homes',
      property: '789 Maple Drive',
      service: 'Luxury Package',
      status: 'pending',
      duration: '3 hours'
    },
    {
      id: '3',
      date: '2024-01-23',
      time: '10:00 AM',
      client: 'Metro Properties',
      property: '456 Pine Avenue',
      service: 'Basic Package',
      status: 'confirmed',
      duration: '1.5 hours'
    }
  ]

  const serviceTypes = [
    { value: 'basic', label: 'Basic Package - $250', duration: '1.5 hours' },
    { value: 'premium', label: 'Premium Package - $450', duration: '2 hours' },
    { value: 'luxury', label: 'Luxury Package - $750', duration: '3 hours' },
    { value: 'drone', label: 'Drone Photography - $150', duration: '1 hour' },
    { value: 'twilight', label: 'Twilight Photos - $100', duration: '1 hour' }
  ]

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    if (!appointmentForm.clientName || !appointmentForm.clientEmail || !appointmentForm.propertyAddress || !appointmentForm.serviceType) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.success('Appointment scheduled successfully!')
    
    // Reset form
    setSelectedTime('')
    setAppointmentForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      company: '',
      propertyAddress: '',
      serviceType: '',
      duration: '',
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
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
          <h1 className="text-3xl font-bold text-gray-900">Smart Scheduling</h1>
          <p className="text-gray-600 mt-2">Manage your photography appointments with intelligent scheduling</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar and Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Select Date & Time
                </CardTitle>
                <CardDescription>Choose your preferred appointment date and available time slot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Available Times</Label>
                    {selectedDate ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            className={`w-full justify-between ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                          >
                            <span>{slot.time}</span>
                            <span className="text-sm">{slot.duration}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Please select a date first</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Enter client and property information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleAppointment} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="clientName"
                          className="pl-10"
                          value={appointmentForm.clientName}
                          onChange={(e) => setAppointmentForm({...appointmentForm, clientName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="clientEmail"
                          type="email"
                          className="pl-10"
                          value={appointmentForm.clientEmail}
                          onChange={(e) => setAppointmentForm({...appointmentForm, clientEmail: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="clientPhone"
                          className="pl-10"
                          value={appointmentForm.clientPhone}
                          onChange={(e) => setAppointmentForm({...appointmentForm, clientPhone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Agency</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="company"
                          className="pl-10"
                          value={appointmentForm.company}
                          onChange={(e) => setAppointmentForm({...appointmentForm, company: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="propertyAddress"
                        className="pl-10"
                        value={appointmentForm.propertyAddress}
                        onChange={(e) => setAppointmentForm({...appointmentForm, propertyAddress: e.target.value})}
                        placeholder="123 Main Street, City, State, ZIP"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select 
                      value={appointmentForm.serviceType} 
                      onValueChange={(value) => setAppointmentForm({...appointmentForm, serviceType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select photography service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.label}</span>
                              <span className="text-sm text-gray-500 ml-2">{service.duration}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea 
                      id="notes"
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                      placeholder="Any special requirements, access instructions, or notes..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Appointment Summary */}
            {(selectedDate || selectedTime) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedTime}</span>
                    </div>
                  )}
                  {appointmentForm.serviceType && (
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{serviceTypes.find(s => s.value === appointmentForm.serviceType)?.label}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled photo shoots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{appointment.client}</p>
                          <p className="text-sm text-gray-600">{appointment.property}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Appointments</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confirmed</span>
                    <span className="font-medium text-green-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Drive Time</span>
                    <span className="font-medium">45 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Features */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Smart Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Auto drive time calculation</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Google Calendar sync</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-purple-500 mr-2" />
                    <span>Automatic reminders</span>
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