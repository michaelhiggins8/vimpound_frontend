import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Common vehicle manufacturers
const VEHICLE_MAKES = [
  'Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Jeep',
  'Ram', 'GMC', 'Dodge', 'Lexus', 'Acura', 'Infiniti', 'Cadillac',
  'Lincoln', 'Buick', 'Chrysler', 'Volvo', 'Mitsubishi', 'Tesla',
  'Porsche', 'Jaguar', 'Land Rover', 'Mini', 'Fiat', 'Alfa Romeo',
  'Genesis', 'Maserati', 'Bentley', 'Rolls-Royce', 'Ferrari', 'Lamborghini',
  'Aston Martin', 'McLaren', 'Bugatti', 'Suzuki', 'Isuzu', 'Scion',
  'Saturn', 'Pontiac', 'Oldsmobile', 'Hummer', 'Saab', 'Smart'
].sort()

// Vehicle models by make
const VEHICLE_MODELS: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra', '4Runner', 'Sienna', 'Avalon', 'Sequoia', 'Land Cruiser', 'Venza', 'C-HR', 'GR86', 'Supra'],
  'Ford': ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Focus', 'Fusion', 'Taurus', 'EcoSport', 'Mach-E'],
  'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Traverse', 'Malibu', 'Cruze', 'Impala', 'Camaro', 'Corvette', 'Trax', 'Blazer', 'Colorado', 'Bolt'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 'HR-V', 'Passport', 'Insight', 'Fit', 'Clarity'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Murano', 'Maxima', 'Versa', 'Kicks', 'Leaf'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', '2 Series', '4 Series', '8 Series', 'Z4', 'iX', 'i4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'GLA', 'GLB', 'G-Class', 'AMG GT'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8'],
  'Volkswagen': ['Jetta', 'Passat', 'Atlas', 'Tiguan', 'Golf', 'Arteon', 'ID.4', 'Taos'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Ioniq', 'Genesis'],
  'Kia': ['Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride', 'Soul', 'Rio', 'Stinger', 'EV6'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata'],
  'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Ascent', 'Legacy', 'Impreza', 'WRX', 'BRZ'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'GMC': ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Hummer EV'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Journey', 'Grand Caravan', 'Ram'],
  'Lexus': ['ES', 'IS', 'GS', 'LS', 'RX', 'NX', 'GX', 'LX', 'UX', 'LC', 'RC'],
  'Acura': ['TLX', 'RLX', 'RDX', 'MDX', 'ILX', 'NSX', 'Integra'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  'Cadillac': ['CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6', 'Escalade'],
  'Lincoln': ['Continental', 'MKZ', 'Aviator', 'Navigator', 'Corsair', 'Nautilus'],
  'Buick': ['Encore', 'Envision', 'Enclave', 'Regal', 'LaCrosse'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage', 'Outlander Sport'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Defender'],
  'Mini': ['Cooper', 'Countryman', 'Clubman', 'Paceman'],
  'Fiat': ['500', '500X', '500L', '124 Spider'],
  'Alfa Romeo': ['Giulia', 'Stelvio', '4C'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'MC20'],
  'Bentley': ['Continental', 'Bentayga', 'Flying Spur'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Cullinan', 'Wraith', 'Dawn'],
  'Ferrari': ['488', 'F8', 'SF90', 'Roma', 'Portofino', '812'],
  'Lamborghini': ['Huracán', 'Aventador', 'Urus'],
  'Aston Martin': ['DB11', 'Vantage', 'DBS', 'DBX'],
  'McLaren': ['720S', '570S', 'GT', 'Artura'],
  'Bugatti': ['Chiron', 'Divo'],
  'Suzuki': ['Swift', 'Vitara', 'SX4'],
  'Isuzu': ['D-Max', 'MU-X'],
  'Scion': ['tC', 'xB', 'xD', 'FR-S', 'iQ'],
  'Saturn': ['Aura', 'Vue', 'Outlook'],
  'Pontiac': ['G6', 'G8', 'Solstice', 'Vibe'],
  'Oldsmobile': ['Alero', 'Intrigue', 'Aurora'],
  'Hummer': ['H1', 'H2', 'H3'],
  'Saab': ['9-3', '9-5', '9-7X'],
  'Smart': ['Fortwo', 'Forfour']
}

// Common vehicle colors
const VEHICLE_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Tan', 'Beige', 'Gold', 'Yellow', 'Orange', 'Purple', 'Pink',
  'Maroon', 'Burgundy', 'Navy', 'Teal', 'Turquoise', 'Cream', 'Ivory',
  'Charcoal', 'Pearl White', 'Metallic Silver', 'Champagne', 'Bronze',
  'Copper', 'Gunmetal', 'Platinum', 'Titanium', 'Carbon Black'
].sort()

// Preset addresses will be fetched from the backend

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [formData, setFormData] = useState({
    status: 'impounded',
    make: '',
    model: '',
    year: '',
    color: '',
    vin_number: '',
    plate_number: '',
    owner_first_name: '',
    owner_last_name: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)
  const [selectedModelSuggestionIndex, setSelectedModelSuggestionIndex] = useState(-1)
  const [showColorSuggestions, setShowColorSuggestions] = useState(false)
  const [selectedColorSuggestionIndex, setSelectedColorSuggestionIndex] = useState(-1)
  const [presetAddresses, setPresetAddresses] = useState<Array<{id: number, address: string}>>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedLocationSuggestionIndex, setSelectedLocationSuggestionIndex] = useState(-1)
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)
  const [newAddressInput, setNewAddressInput] = useState('')
  const [addingAddress, setAddingAddress] = useState(false)
  const [addAddressError, setAddAddressError] = useState<string | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null)
  const makeInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const modelSuggestionsRef = useRef<HTMLDivElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const colorSuggestionsRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const locationSuggestionsRef = useRef<HTMLDivElement>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Function to fetch addresses from backend
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Failed to get session:', sessionError)
        setLoadingAddresses(false)
        return
      }

      if (!session) {
        console.error('No session found')
        setLoadingAddresses(false)
        return
      }

      const accessToken = session.access_token

      // Fetch addresses from backend
      const response = await fetch(`${backendUrl}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch addresses:', errorData.detail || 'Unknown error')
        setLoadingAddresses(false)
        return
      }

      const data = await response.json()
      // Backend now returns addresses with id and address fields
      setPresetAddresses(data.addresses || [])
    } catch (err) {
      console.error('Error fetching addresses:', err)
    } finally {
      setLoadingAddresses(false)
    }
  }, [backendUrl])

  // Fetch addresses from backend when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAddresses()
    }
  }, [isOpen, fetchAddresses])

  // Filter vehicle makes based on input
  const filteredMakes = formData.make
    ? VEHICLE_MAKES.filter(make =>
        make.toLowerCase().startsWith(formData.make.toLowerCase())
      ).slice(0, 10) // Limit to 10 suggestions
    : []

  // Filter vehicle models based on input and selected make
  const availableModels = formData.make && VEHICLE_MODELS[formData.make]
    ? VEHICLE_MODELS[formData.make]
    : []
  
  const filteredModels = formData.model && availableModels.length > 0
    ? availableModels.filter(model =>
        model.toLowerCase().startsWith(formData.model.toLowerCase())
      ).slice(0, 10) // Limit to 10 suggestions
    : []

  // Filter vehicle colors based on input
  const filteredColors = formData.color
    ? VEHICLE_COLORS.filter(color =>
        color.toLowerCase().startsWith(formData.color.toLowerCase())
      ).slice(0, 10) // Limit to 10 suggestions
    : []

  // Filter preset addresses based on input
  const filteredLocations = formData.location
    ? presetAddresses.filter(addrObj =>
        addrObj.address.toLowerCase().includes(formData.location.toLowerCase())
      ).slice(0, 10) // Limit to 10 suggestions
    : presetAddresses.slice(0, 10) // Show all if no input

  // Check if current location is a custom (not in preset list)
  const isCustomLocation = formData.location && !presetAddresses.some(addrObj => addrObj.address === formData.location)

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        makeInputRef.current &&
        !makeInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowMakeSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
      if (
        modelInputRef.current &&
        !modelInputRef.current.contains(event.target as Node) &&
        modelSuggestionsRef.current &&
        !modelSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowModelSuggestions(false)
        setSelectedModelSuggestionIndex(-1)
      }
      if (
        colorInputRef.current &&
        !colorInputRef.current.contains(event.target as Node) &&
        colorSuggestionsRef.current &&
        !colorSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowColorSuggestions(false)
        setSelectedColorSuggestionIndex(-1)
      }
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node) &&
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false)
        setSelectedLocationSuggestionIndex(-1)
      }
    }

    if (showMakeSuggestions || showModelSuggestions || showColorSuggestions || showLocationSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMakeSuggestions, showModelSuggestions, showColorSuggestions, showLocationSuggestions])

  // Helper function to sanitize VIN and Plate Number inputs
  const sanitizeAlphanumericInput = (input: string): string => {
    // Convert to uppercase and keep only letters, numbers, and spaces
    return input
      .toUpperCase()
      .split('')
      .filter(char => /[A-Z0-9\s]/.test(char))
      .join('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Sanitize VIN Number and Plate Number inputs
    let processedValue = value
    if (name === 'vin_number' || name === 'plate_number') {
      processedValue = sanitizeAlphanumericInput(value)
    }
    
    // Show suggestions for make field
    if (name === 'make') {
      const previousMake = formData.make
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        // Clear model when make changes
        model: previousMake !== processedValue ? '' : prev.model
      }))
      setShowMakeSuggestions(true)
      setSelectedSuggestionIndex(-1)
      if (previousMake !== processedValue) {
        setShowModelSuggestions(false)
        setSelectedModelSuggestionIndex(-1)
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }))
    }
    
    // Show suggestions for model field
    if (name === 'model') {
      setShowModelSuggestions(true)
      setSelectedModelSuggestionIndex(-1)
    }
    
    // Show suggestions for color field
    if (name === 'color') {
      setShowColorSuggestions(true)
      setSelectedColorSuggestionIndex(-1)
    }
    
    // Show suggestions for location field
    if (name === 'location') {
      setShowLocationSuggestions(true)
      setSelectedLocationSuggestionIndex(-1)
    }
  }

  const handleMakeSuggestionClick = (make: string) => {
    const previousMake = formData.make
    setFormData(prev => ({
      ...prev,
      make,
      // Clear model when make changes
      model: previousMake !== make ? '' : prev.model
    }))
    setShowMakeSuggestions(false)
    setSelectedSuggestionIndex(-1)
    if (previousMake !== make) {
      setShowModelSuggestions(false)
      setSelectedModelSuggestionIndex(-1)
    }
    makeInputRef.current?.focus()
  }

  const handleMakeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMakeSuggestions || filteredMakes.length === 0) {
      if (e.key === 'ArrowDown' && filteredMakes.length > 0) {
        setShowMakeSuggestions(true)
        setSelectedSuggestionIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < filteredMakes.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        // If a suggestion is explicitly selected, use it; otherwise use the first one
        const indexToUse = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0
        if (indexToUse >= 0 && indexToUse < filteredMakes.length) {
          handleMakeSuggestionClick(filteredMakes[indexToUse])
        }
        break
      case 'Escape':
        setShowMakeSuggestions(false)
        setSelectedSuggestionIndex(-1)
        makeInputRef.current?.blur()
        break
    }
  }

  const handleModelSuggestionClick = (model: string) => {
    setFormData(prev => ({
      ...prev,
      model
    }))
    setShowModelSuggestions(false)
    setSelectedModelSuggestionIndex(-1)
    modelInputRef.current?.focus()
  }

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showModelSuggestions || filteredModels.length === 0) {
      if (e.key === 'ArrowDown' && filteredModels.length > 0) {
        setShowModelSuggestions(true)
        setSelectedModelSuggestionIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedModelSuggestionIndex(prev =>
          prev < filteredModels.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedModelSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        // If a suggestion is explicitly selected, use it; otherwise use the first one
        const indexToUse = selectedModelSuggestionIndex >= 0 ? selectedModelSuggestionIndex : 0
        if (indexToUse >= 0 && indexToUse < filteredModels.length) {
          handleModelSuggestionClick(filteredModels[indexToUse])
        }
        break
      case 'Escape':
        setShowModelSuggestions(false)
        setSelectedModelSuggestionIndex(-1)
        modelInputRef.current?.blur()
        break
    }
  }

  const handleColorSuggestionClick = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }))
    setShowColorSuggestions(false)
    setSelectedColorSuggestionIndex(-1)
    colorInputRef.current?.focus()
  }

  const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showColorSuggestions || filteredColors.length === 0) {
      if (e.key === 'ArrowDown' && filteredColors.length > 0) {
        setShowColorSuggestions(true)
        setSelectedColorSuggestionIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedColorSuggestionIndex(prev =>
          prev < filteredColors.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedColorSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        // If a suggestion is explicitly selected, use it; otherwise use the first one
        const indexToUse = selectedColorSuggestionIndex >= 0 ? selectedColorSuggestionIndex : 0
        if (indexToUse >= 0 && indexToUse < filteredColors.length) {
          handleColorSuggestionClick(filteredColors[indexToUse])
        }
        break
      case 'Escape':
        setShowColorSuggestions(false)
        setSelectedColorSuggestionIndex(-1)
        colorInputRef.current?.blur()
        break
    }
  }

  const handleLocationSuggestionClick = (address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address
    }))
    setShowLocationSuggestions(false)
    setSelectedLocationSuggestionIndex(-1)
    locationInputRef.current?.focus()
  }

  const handleDeleteAddress = async (addressId: number, addressText: string) => {
    // Prevent multiple simultaneous deletions
    if (deletingAddressId !== null) {
      return
    }

    setDeletingAddressId(addressId)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Failed to get session:', sessionError)
        setDeletingAddressId(null)
        return
      }

      if (!session) {
        console.error('No session found')
        setDeletingAddressId(null)
        return
      }

      const accessToken = session.access_token

      // Delete address from backend
      // Convert number id to string (backend expects UUID as string)
      const response = await fetch(`${backendUrl}/addresses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: String(addressId)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to delete address:', data.detail || 'Unknown error')
        setDeletingAddressId(null)
        return
      }

      // Success - refresh addresses list
      await fetchAddresses()
      
      // If the deleted address was selected in the form, clear the location field
      if (formData.location === addressText) {
        setFormData(prev => ({
          ...prev,
          location: ''
        }))
      }
    } catch (err) {
      console.error('Error deleting address:', err)
    } finally {
      setDeletingAddressId(null)
    }
  }

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationSuggestions || filteredLocations.length === 0) {
      if (e.key === 'ArrowDown' && filteredLocations.length > 0) {
        setShowLocationSuggestions(true)
        setSelectedLocationSuggestionIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedLocationSuggestionIndex(prev =>
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedLocationSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        // If a suggestion is explicitly selected, use it; otherwise use the first one
        const indexToUse = selectedLocationSuggestionIndex >= 0 ? selectedLocationSuggestionIndex : 0
        if (indexToUse >= 0 && indexToUse < filteredLocations.length) {
          handleLocationSuggestionClick(filteredLocations[indexToUse].address)
        }
        break
      case 'Escape':
        setShowLocationSuggestions(false)
        setSelectedLocationSuggestionIndex(-1)
        locationInputRef.current?.blur()
        break
    }
  }

  const handleAddAddressClick = () => {
    setShowAddAddressModal(true)
    setNewAddressInput('')
    setAddAddressError(null)
  }

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAddressInput.trim()) {
      setAddAddressError('Address cannot be empty')
      return
    }

    if (presetAddresses.some(addrObj => addrObj.address === newAddressInput.trim())) {
      setAddAddressError('This address already exists in your preset list')
      return
    }

    setAddingAddress(true)
    setAddAddressError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setAddAddressError(`Failed to get session: ${sessionError.message}`)
        setAddingAddress(false)
        return
      }

      if (!session) {
        setAddAddressError('You must be signed in to add an address')
        setAddingAddress(false)
        return
      }

      const accessToken = session.access_token

      // Add address to backend
      const response = await fetch(`${backendUrl}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          address: newAddressInput.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAddAddressError(data.detail || 'Failed to add address')
        setAddingAddress(false)
        return
      }

      // Success - refresh addresses list and update form
      await fetchAddresses()
      setFormData(prev => ({
        ...prev,
        location: newAddressInput.trim()
      }))
      setNewAddressInput('')
      setShowAddAddressModal(false)
      setShowLocationSuggestions(false)
    } catch (err) {
      setAddAddressError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setAddingAddress(false)
    }
  }

  const handleCloseAddAddressModal = () => {
    setShowAddAddressModal(false)
    setNewAddressInput('')
    setAddAddressError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.status || !formData.make || !formData.model || !formData.year || 
        !formData.color || !formData.vin_number || !formData.plate_number || 
        !formData.owner_first_name || !formData.owner_last_name || !formData.location) {
      setError('All fields are required')
      return
    }

    // Validate year is a number
    const yearNum = parseInt(formData.year)
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      setError('Please enter a valid year')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to add a vehicle')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: formData.status,
          make: formData.make,
          model: formData.model,
          year: yearNum,
          color: formData.color,
          vin_number: formData.vin_number,
          plate_number: formData.plate_number,
          owner_first_name: formData.owner_first_name,
          owner_last_name: formData.owner_last_name,
          location: formData.location
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to add vehicle')
        setLoading(false)
        return
      }

      // Reset form
      setFormData({
        status: 'impounded',
        make: '',
        model: '',
        year: '',
        color: '',
        vin_number: '',
        plate_number: '',
        owner_first_name: '',
        owner_last_name: '',
        location: ''
      })
      setShowMakeSuggestions(false)
      setSelectedSuggestionIndex(-1)
      setShowModelSuggestions(false)
      setSelectedModelSuggestionIndex(-1)
      setShowColorSuggestions(false)
      setSelectedColorSuggestionIndex(-1)
      setShowLocationSuggestions(false)
      setSelectedLocationSuggestionIndex(-1)

      // Success - close modal and refresh the list
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 z-10 border-b border-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Add New Vehicle
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              title="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900`}
                autoFocus
              >
                <option value="impounded">Impounded</option>
                <option value="released">Released</option>
                <option value="hold">Hold</option>
                <option value="transferred">Transfered</option>
                <option value="going to auction">Going to auction</option>
                <option value="sold at auction">Sold at auction</option>
              </select>
            </div>

            {/* Make */}
            <div className="relative">
              <label htmlFor="make" className="block text-sm font-semibold text-gray-900 mb-2">
                Make 
              </label>
              <input
                ref={makeInputRef}
                id="make"
                name="make"
                type="text"
                value={formData.make}
                onChange={handleChange}
                onKeyDown={handleMakeKeyDown}
                onFocus={() => {
                  if (filteredMakes.length > 0) {
                    setShowMakeSuggestions(true)
                  }
                }}
                placeholder="e.g., Toyota"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
              {/* Suggestions Dropdown */}
              {showMakeSuggestions && filteredMakes.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredMakes.map((make, index) => (
                    <button
                      key={make}
                      type="button"
                      onClick={() => handleMakeSuggestionClick(make)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                        index === selectedSuggestionIndex
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${
                        index === filteredMakes.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      {make}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model */}
            <div className="relative">
              <label htmlFor="model" className="block text-sm font-semibold text-gray-900 mb-2">
                Model 
              </label>
              <input
                ref={modelInputRef}
                id="model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleChange}
                onKeyDown={handleModelKeyDown}
                onFocus={() => {
                  if (filteredModels.length > 0) {
                    setShowModelSuggestions(true)
                  }
                }}
                placeholder="e.g., Camry"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
              {/* Suggestions Dropdown */}
              {showModelSuggestions && filteredModels.length > 0 && (
                <div
                  ref={modelSuggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredModels.map((model, index) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleModelSuggestionClick(model)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                        index === selectedModelSuggestionIndex
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${
                        index === filteredModels.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                      onMouseEnter={() => setSelectedModelSuggestionIndex(index)}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-semibold text-gray-900 mb-2">
                Year 
              </label>
              <input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2020"
                disabled={loading}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>

            {/* Color */}
            <div className="relative">
              <label htmlFor="color" className="block text-sm font-semibold text-gray-900 mb-2">
                Color 
              </label>
              <input
                ref={colorInputRef}
                id="color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleChange}
                onKeyDown={handleColorKeyDown}
                onFocus={() => {
                  if (filteredColors.length > 0) {
                    setShowColorSuggestions(true)
                  }
                }}
                placeholder="e.g., Red"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
              {/* Suggestions Dropdown */}
              {showColorSuggestions && filteredColors.length > 0 && (
                <div
                  ref={colorSuggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredColors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSuggestionClick(color)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                        index === selectedColorSuggestionIndex
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${
                        index === filteredColors.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                      onMouseEnter={() => setSelectedColorSuggestionIndex(index)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VIN Number */}
            <div>
              <label htmlFor="vin_number" className="block text-sm font-semibold text-gray-900 mb-2">
                VIN Number 
              </label>
              <input
                id="vin_number"
                name="vin_number"
                type="text"
                value={formData.vin_number}
                onChange={handleChange}
                placeholder="e.g., 1HGBH41JXMN109186"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
            </div>

            {/* Plate Number */}
            <div>
              <label htmlFor="plate_number" className="block text-sm font-semibold text-gray-900 mb-2">
                Plate Number 
              </label>
              <input
                id="plate_number"
                name="plate_number"
                type="text"
                value={formData.plate_number}
                onChange={handleChange}
                placeholder="e.g., ABC123"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
            </div>

            {/* Owner First Name */}
            <div>
              <label htmlFor="owner_first_name" className="block text-sm font-semibold text-gray-900 mb-2">
                Owner First Name 
              </label>
              <input
                id="owner_first_name"
                name="owner_first_name"
                type="text"
                value={formData.owner_first_name}
                onChange={handleChange}
                placeholder="e.g., John"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
            </div>

            {/* Owner Last Name */}
            <div>
              <label htmlFor="owner_last_name" className="block text-sm font-semibold text-gray-900 mb-2">
                Owner Last Name 
              </label>
              <input
                id="owner_last_name"
                name="owner_last_name"
                type="text"
                value={formData.owner_last_name}
                onChange={handleChange}
                placeholder="e.g., Doe"
                disabled={loading}
                required
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } text-gray-900 placeholder:text-gray-400`}
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
                  Location 
                  {loadingAddresses && (
                    <span className="ml-2 text-xs font-normal text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading addresses...
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={handleAddAddressClick}
                  disabled={loading || loadingAddresses}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title="Add new address to preset list"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Address
                </button>
              </div>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  onKeyDown={handleLocationKeyDown}
                  onFocus={() => {
                    if (filteredLocations.length > 0) {
                      setShowLocationSuggestions(true)
                    }
                  }}
                  placeholder="Select or type a location address"
                  disabled={loading}
                  required
                  className={`w-full px-4 py-3 pr-10 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                      : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } text-gray-900 placeholder:text-gray-400`}
                />
                {/* Custom location indicator */}
                {isCustomLocation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                      Custom
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {/* Suggestions Dropdown */}
                {showLocationSuggestions && filteredLocations.length > 0 && (
                  <div
                    ref={locationSuggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredLocations.map((addrObj, index) => (
                      <div
                        key={addrObj.id}
                        className={`w-full flex items-center gap-2 group ${
                          index === selectedLocationSuggestionIndex
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                        } ${index === 0 ? 'rounded-t-lg' : ''} ${
                          index === filteredLocations.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleLocationSuggestionClick(addrObj.address)}
                          className={`flex-1 text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center gap-2 ${
                            index === selectedLocationSuggestionIndex
                              ? 'text-blue-700 font-medium'
                              : 'text-gray-900'
                          }`}
                          onMouseEnter={() => setSelectedLocationSuggestionIndex(index)}
                        >
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="flex-1">{addrObj.address}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAddress(addrObj.id, addrObj.address)
                          }}
                          disabled={deletingAddressId === addrObj.id || deletingAddressId !== null}
                          className="px-3 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-150 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`Delete ${addrObj.address}`}
                        >
                          {deletingAddressId === addrObj.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isCustomLocation && (
                <p className="mt-1.5 text-xs text-gray-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This is a custom location not in your preset list
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-5 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCloseAddAddressModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl border-b border-blue-800/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Add New Address
                  </h3>
                </div>
                <button
                  onClick={handleCloseAddAddressModal}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
                  title="Close"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleAddAddressSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="new_address" className="block text-sm font-semibold text-gray-900 mb-2">
                  Address
                </label>
                <input
                  id="new_address"
                  type="text"
                  value={newAddressInput}
                  onChange={(e) => {
                    setNewAddressInput(e.target.value)
                    setAddAddressError(null)
                  }}
                  placeholder="e.g., 123 Main Street, Lot A"
                  autoFocus
                  required
                  disabled={addingAddress}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                    addingAddress
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                      : addAddressError
                      ? 'bg-white border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } text-gray-900 placeholder:text-gray-400`}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  This address will be added to your preset list and selected automatically.
                </p>
              </div>

              {addAddressError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-800 flex-1">{addAddressError}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAddAddressModal}
                  disabled={addingAddress}
                  className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAddress || !newAddressInput.trim() || presetAddresses.some(addrObj => addrObj.address === newAddressInput.trim())}
                  className={`flex-1 px-5 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    addingAddress || !newAddressInput.trim() || presetAddresses.some(addrObj => addrObj.address === newAddressInput.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg focus:ring-blue-500'
                  }`}
                >
                  {addingAddress ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add Address'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
