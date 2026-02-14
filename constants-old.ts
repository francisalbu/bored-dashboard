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

export const getMockTransfers = (): ExperienceDetails => ({
  id: 'exp-004',
  title: 'Airport & City Transfers',
  category: 'Transfers',
  status: 'Active',
  units: [
    {
      id: 'u-trans-01',
      name: 'Airport Pickup (Sedan)',
      price: 50.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      duration: '45 min'
    },
    {
      id: 'u-trans-02',
      name: 'City Center Drop-off (Van)',
      price: 80.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80',
      duration: '30 min'
    },
    {
      id: 'u-trans-03',
      name: 'Luxury SUV Airport Transfer',
      price: 120.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: false,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      duration: '45 min'
    },
    {
      id: 'u-trans-04',
      name: 'Private Boat to Marina',
      price: 200.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
      duration: '1 hour'
    },
    {
      id: 'u-trans-05',
      name: 'Helicopter Transfer',
      price: 450.00,
      currency: '€',
      activeDays: ['M', 'W', 'F', 'S', 'Su'],
      instantBooking: false,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1512260797252-1f7f5d50ac62?w=800&q=80',
      duration: '15 min'
    },
    {
      id: 'u-trans-06',
      name: 'Shuttle to Beach Club',
      price: 15.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'transfer',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      duration: '20 min'
    }
  ]
});

export const getMockDining = (): ExperienceDetails => ({
  id: 'exp-005',
  title: 'Restaurant Table Reservations',
  category: 'Dining',
  status: 'Active',
  units: [
    {
      id: 'u-table-01',
      name: 'Terrace Table for 2',
      price: 0.00,
      currency: '€',
      activeDays: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-table-02',
      name: 'Private Dining Room (6-8)',
      price: 150.00,
      currency: '€',
      activeDays: ['F', 'S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      duration: '3 hours'
    },
    {
      id: 'u-table-03',
      name: 'Chef\'s Table Experience',
      price: 120.00,
      currency: '€',
      activeDays: ['W', 'Th', 'F', 'S'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
      duration: '2.5 hours'
    },
    {
      id: 'u-table-04',
      name: 'Rooftop Sunset Dinner (4)',
      price: 80.00,
      currency: '€',
      activeDays: ['Th', 'F', 'S', 'Su'],
      instantBooking: true,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-table-05',
      name: 'Wine Cellar Private Tasting',
      price: 250.00,
      currency: '€',
      activeDays: ['F', 'S'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
      duration: '2 hours'
    },
    {
      id: 'u-table-06',
      name: 'Beach BBQ Setup (up to 10)',
      price: 400.00,
      currency: '€',
      activeDays: ['S', 'Su'],
      instantBooking: false,
      type: 'activity',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      duration: '4 hours'
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