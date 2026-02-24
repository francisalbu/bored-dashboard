import { ExperienceDetails } from './types';

// MOUNTAIN BIKING - Only mountain biking related units
export const getMockMountainBiking = (): ExperienceDetails => ({
  id: 'exp-001',
  title: 'Mountain Biking Adventure with Pro Guide',
  category: 'Hotel Activities',
  status: 'Active',
  units: [
    {
      id: 'u-001',
      name: 'Group Tour - Standard',
      price: 75.00,
      currency: '€',
      activeDays: ['M', 'W', 'F', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
      duration: '3 hours'
    },
    {
      id: 'u-002',
      name: 'Private VIP Session',
      price: 150.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&q=80',
      duration: '4 hours'
    },
    {
      id: 'u-003',
      name: 'Sunset Ride (Advanced)',
      price: 95.00,
      currency: '€',
      activeDays: ['F', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: '2 hours'
    }
  ]
});

// YOGA - Only yoga related units  
export const getMockYoga = (): ExperienceDetails => ({
  id: 'exp-002',
  title: 'Yoga & Meditation Sessions',
  category: 'Hotel Activities',
  status: 'Active',
  units: [
    {
      id: 'u-yoga-01',
      name: 'Rooftop Sunrise Yoga',
      price: 25.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      duration: '1 hour'
    },
    {
      id: 'u-yoga-02',
      name: 'Private Yoga Session',
      price: 60.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      duration: '1.5 hours'
    },
    {
      id: 'u-yoga-03',
      name: 'Meditation & Breathwork',
      price: 30.00,
      currency: '€',
      activeDays: ['M', 'W', 'F'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1506126279646-a697353d3166?w=800&q=80',
      duration: '45 minutes'
    }
  ]
});

// WINE TASTING - Only wine related units
export const getMockWineTasting = (): ExperienceDetails => ({
  id: 'exp-003',
  title: 'Wine Tasting Experience',
  category: 'Hotel Activities',
  status: 'Active',
  units: [
    {
      id: 'u-wine-01',
      name: 'Standard Wine Tasting',
      price: 65.00,
      currency: '€',
      activeDays: ['W', 'F', 'S'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-wine-02',
      name: 'Premium Selection Tasting',
      price: 95.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1567938146061-4e97e8f78c01?w=800&q=80',
      duration: '3 hours'
    },
    {
      id: 'u-wine-03',
      name: 'Private Wine Cellar Tour',
      price: 150.00,
      currency: '€',
      activeDays: ['F', 'S'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80',
      duration: '2.5 hours'
    }
  ]
});

// COOKING - Only cooking related units
export const getMockCooking = (): ExperienceDetails => ({
  id: 'exp-004',
  title: 'Cooking Classes - Local Cuisine',
  category: 'Hotel Activities',
  status: 'Active',
  units: [
    {
      id: 'u-cook-01',
      name: 'Traditional Dishes Class',
      price: 85.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      duration: '3 hours'
    },
    {
      id: 'u-cook-02',
      name: 'Pastry & Desserts Workshop',
      price: 75.00,
      currency: '€',
      activeDays: ['W', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1559910917-a9b8f796b54d?w=800&q=80',
      duration: '2.5 hours'
    },
    {
      id: 'u-cook-03',
      name: 'Private Chef Experience',
      price: 180.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      duration: '4 hours'
    }
  ]
});

// Default general activities getter (for backwards compatibility)
export const getMockActivities = getMockMountainBiking;

// SPA - Each treatment as separate experience
export const getMockSpa = (): ExperienceDetails[] => [
  {
    id: 'exp-spa-01',
    title: 'Deep Tissue Massage (60m)',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-01',
      name: 'Standard Rate',
      price: 90.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      duration: '1 hour'
    }]
  },
  {
    id: 'exp-spa-02',
    title: 'Couple\'s Retreat Package',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-02',
      name: 'Standard Rate',
      price: 220.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
      duration: '2 hours'
    }]
  },
  {
    id: 'exp-spa-03',
    title: 'Hot Stone Therapy (90m)',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-03',
      name: 'Standard Rate',
      price: 120.00,
      currency: '€',
      activeDays: ['M', 'W', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      duration: '1.5 hours'
    }]
  },
  {
    id: 'exp-spa-04',
    title: 'Facial Treatment - Anti-Aging',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-04',
      name: 'Standard Rate',
      price: 85.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
      duration: '1 hour'
    }]
  },
  {
    id: 'exp-spa-05',
    title: 'Aromatherapy Session',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-05',
      name: 'Standard Rate',
      price: 75.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1603665301175-8dd52d6cb87e?w=800&q=80',
      duration: '50 minutes'
    }]
  },
  {
    id: 'exp-spa-06',
    title: 'Full Day Spa Sanctuary',
    category: 'Spa',
    status: 'Active',
    units: [{
      id: 'u-spa-06',
      name: 'Standard Rate',
      price: 350.00,
      currency: '€',
      activeDays: ['S', 'Su'],
      instantBooking: false,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      duration: '6 hours'
    }]
  }
];

// RENTALS - Each item as separate experience
export const getMockRentals = (): ExperienceDetails[] => [
  {
    id: 'exp-rent-01',
    title: 'Electric Bike 4h',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-01',
      name: 'Standard Rate',
      price: 35.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80',
      duration: '4 hours'
    }]
  },
  {
    id: 'exp-rent-02',
    title: 'Electric Bike Full Day',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-02',
      name: 'Standard Rate',
      price: 55.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
      duration: '8 hours'
    }]
  },
  {
    id: 'exp-rent-03',
    title: 'Paddleboard Rental (2h)',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-03',
      name: 'Standard Rate',
      price: 25.00,
      currency: '€',
      activeDays: ['W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: '2 hours'
    }]
  },
  {
    id: 'exp-rent-04',
    title: 'Kayak Single (4h)',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-04',
      name: 'Standard Rate',
      price: 40.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      duration: '4 hours'
    }]
  },
  {
    id: 'exp-rent-05',
    title: 'Beach Umbrella & Chairs Set',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-05',
      name: 'Standard Rate',
      price: 15.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      duration: 'Full day'
    }]
  },
  {
    id: 'exp-rent-06',
    title: 'Snorkeling Equipment Kit',
    category: 'Rentals',
    status: 'Active',
    units: [{
      id: 'u-rent-06',
      name: 'Standard Rate',
      price: 20.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: '4 hours'
    }]
  }
];

// PACKAGES - Each package as separate experience
export const getMockPackages = (): ExperienceDetails[] => [
  {
    id: 'exp-pkg-01',
    title: 'Wellness Weekend Retreat',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-01',
      name: 'Standard Rate',
      price: 599.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      duration: '3 days'
    }]
  },
  {
    id: 'exp-pkg-02',
    title: 'Adventure Seeker Bundle',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-02',
      name: 'Standard Rate',
      price: 320.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80',
      duration: '2 days'
    }]
  },
  {
    id: 'exp-pkg-03',
    title: 'Romantic Escape for Two',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-03',
      name: 'Standard Rate',
      price: 750.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      duration: '2 days'
    }]
  },
  {
    id: 'exp-pkg-04',
    title: 'Family Fun Day Pass',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-04',
      name: 'Standard Rate',
      price: 180.00,
      currency: '€',
      activeDays: ['S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
      duration: '1 day'
    }]
  },
  {
    id: 'exp-pkg-05',
    title: 'Cultural Explorer Package',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-05',
      name: 'Standard Rate',
      price: 265.00,
      currency: '€',
      activeDays: ['T', 'W', 'Th', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
      duration: '1 day'
    }]
  },
  {
    id: 'exp-pkg-06',
    title: 'VIP Luxury Experience',
    category: 'Packages',
    status: 'Active',
    units: [{
      id: 'u-pkg-06',
      name: 'Standard Rate',
      price: 1250.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      duration: '3 days'
    }]
  }
];

