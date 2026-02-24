import { ExperienceDetails } from './types';

// Mock Data Factories
export const getMockActivities = (): ExperienceDetails => ({
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
    },
    {
      id: 'u-004',
      name: 'Yoga on the Rooftop',
      price: 25.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      duration: '1 hour'
    },
    {
      id: 'u-005',
      name: 'Wine Tasting Experience',
      price: 65.00,
      currency: '€',
      activeDays: ['W', 'F', 'S'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-006',
      name: 'Cooking Class - Local Cuisine',
      price: 85.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      duration: '3 hours'
    }
  ]
});

export const getMockSpa = (): ExperienceDetails => ({
  id: 'exp-002',
  title: 'Signature Wellness Treatments',
  category: 'Spa',
  status: 'Active',
  units: [
    {
      id: 'u-spa-01',
      name: 'Deep Tissue Massage (60m)',
      price: 90.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      duration: '60 min'
    },
    {
      id: 'u-spa-02',
      name: 'Couple\'s Retreat Package',
      price: 220.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-spa-03',
      name: 'Hot Stone Therapy (90m)',
      price: 120.00,
      currency: '€',
      activeDays: ['M', 'W', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      duration: '90 min'
    },
    {
      id: 'u-spa-04',
      name: 'Facial Treatment - Anti-Aging',
      price: 85.00,
      currency: '€',
      activeDays: ['T', 'Th', 'S'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
      duration: '45 min'
    },
    {
      id: 'u-spa-05',
      name: 'Aromatherapy Session',
      price: 75.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F'],
      instantBooking: true,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      duration: '50 min'
    },
    {
      id: 'u-spa-06',
      name: 'Full Day Spa Sanctuary',
      price: 350.00,
      currency: '€',
      activeDays: ['S', 'Su'],
      instantBooking: false,
      type: 'spa',
      imageUrl: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&q=80',
      duration: '6 hours'
    }
  ]
});

export const getMockRentals = (): ExperienceDetails => ({
  id: 'exp-003',
  title: 'E-Bike Fleet Rental',
  category: 'Rentals',
  status: 'Active',
  units: [
    {
      id: 'u-rent-01',
      name: 'Electric Bike 4h',
      price: 35.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80',
      duration: '4 hours'
    },
    {
      id: 'u-rent-02',
      name: 'Electric Bike Full Day',
      price: 55.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
      duration: 'Full day'
    },
    {
      id: 'u-rent-03',
      name: 'Paddleboard Rental (2h)',
      price: 25.00,
      currency: '€',
      activeDays: ['W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1594385208974-2e75f8f8a458?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-rent-04',
      name: 'Kayak Single (4h)',
      price: 40.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      duration: '4 hours'
    },
    {
      id: 'u-rent-05',
      name: 'Beach Umbrella & Chairs Set',
      price: 15.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: 'Full day'
    },
    {
      id: 'u-rent-06',
      name: 'Snorkeling Equipment Kit',
      price: 20.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'rental',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      duration: 'Half day'
    }
  ]
});

export const getMockPackages = (): ExperienceDetails => ({
  id: 'exp-006',
  title: 'Curated Experience Packages',
  category: 'Packages',
  status: 'Active',
  units: [
    {
      id: 'u-pkg-01',
      name: 'Wellness Weekend Retreat',
      price: 599.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      duration: '3 days'
    },
    {
      id: 'u-pkg-02',
      name: 'Adventure Seeker Bundle',
      price: 320.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800&q=80',
      duration: 'Full day'
    },
    {
      id: 'u-pkg-03',
      name: 'Romantic Escape for Two',
      price: 750.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
      duration: '2 days'
    },
    {
      id: 'u-pkg-04',
      name: 'Family Fun Day Pass',
      price: 180.00,
      currency: '€',
      activeDays: ['S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800&q=80',
      duration: 'Full day'
    },
    {
      id: 'u-pkg-05',
      name: 'Cultural Explorer Package',
      price: 265.00,
      currency: '€',
      activeDays: ['T', 'W', 'Th', 'S'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
      duration: 'Full day'
    },
    {
      id: 'u-pkg-06',
      name: 'VIP Luxury Experience',
      price: 1250.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      duration: '2 days'
    }
  ]
});