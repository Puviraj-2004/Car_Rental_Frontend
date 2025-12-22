export default {
  // Navigation
  navigation: {
    home: 'Home',
    search: 'Search',
    bookings: 'My Bookings',
    profile: 'Profile',
    logout: 'Logout',
  },

  // Home/Search Page
  home: {
    title: 'Available Cars',
    searchPlaceholder: 'Search cars...',
    noCars: 'No cars available at the moment.',
  },

  // Car Details
  carDetails: {
    title: 'Car Details',
    bookNow: 'Book Now',
    year: 'Year',
    critAir: 'Crit\'Air Rating',
    fuelType: 'Fuel Type',
    transmission: 'Transmission',
    seats: 'seats',
    doors: 'doors',
    pricePerDay: 'Price per day',
    noDescription: 'No description available.',
  },

  // Booking
  booking: {
    title: 'Book {{brand}} {{model}}',
    step1: 'Booking Details',
    step2: 'Payment',
    startDate: 'Start Date',
    endDate: 'End Date',
    pickupLocation: 'Pickup Location (optional)',
    dropoffLocation: 'Drop-off Location (optional)',
    continueToPayment: 'Continue to Payment',
    back: 'Back',
    email: 'Email',
    nameOnCard: 'Name on Card',
    payNow: 'Pay Now',
    processing: 'Processing...',
    testCardInfo: 'Test card: 4242 4242 4242 4242 | Exp: Any future date | CVV: Any 3 digits',
    bookingConfirmed: 'Booking Confirmed!',
    thankYou: 'Thank you for your reservation',
    bookingId: 'Booking ID',
    status: 'Status',
    totalPrice: 'Total Price',
    basePrice: 'Base Price',
    tax: 'Tax (20%)',
    browseMoreCars: 'Browse More Cars',
  },

  // Forms
  forms: {
    required: 'This field is required',
    invalidDate: 'End date must be after start date',
    selectDates: 'Please select both start and end dates',
  },

  // Errors
  errors: {
    generic: 'An error occurred. Please try again.',
    stripeNotLoaded: 'Stripe is not loaded yet. Please try again.',
    cardElementNotFound: 'Card element not found',
  },

  // GDPR
  gdpr: {
    consent: 'I agree to the processing of my personal data in accordance with the Privacy Policy',
    privacyPolicy: 'Privacy Policy',
    cookiePolicy: 'Cookie Policy',
  },
};