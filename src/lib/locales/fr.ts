export default {
  // Navigation
  nav: {
    home: 'Accueil',
    about: 'À propos',
    cars: 'Voitures',
    contact: 'Contact',
    bookNow: 'Réserver',
    profile: 'Profil',
    myBookings: 'Mes réservations',
    settings: 'Paramètres',
    logout: 'Déconnexion',
  },

  navigation: {
    home: 'Accueil',
    search: 'Recherche',
    bookings: 'Mes réservations',
    profile: 'Profil',
    logout: 'Déconnexion',
  },

  // Home/Search Page
  home: {
    title: 'Voitures disponibles',
    searchPlaceholder: 'Rechercher des voitures...',
    noCars: 'Aucune voiture disponible pour le moment.',
    loading: 'Chargement...',
    carsAvailable: 'voitures disponibles',
  },

  // Hero Section
  hero: {
    headline: 'Trouvez votre véhicule idéal, à tout moment',
    subtitle: 'Location de voitures abordable et fiable pour chaque voyage',
    bookNow: 'Réserver maintenant',
    viewCars: 'Voir les voitures',
  },

  // Car Details
  carDetails: {
    title: 'Détails de la voiture',
    bookNow: 'Réserver maintenant',
    year: 'Année',
    critAir: 'Classement Crit\'Air',
    fuelType: 'Type de carburant',
    transmission: 'Transmission',
    seats: 'sièges',
    doors: 'portes',
    pricePerDay: 'Prix par jour',
    noDescription: 'Aucune description disponible.',
  },

  // Booking
  booking: {
    title: 'Réserver {{brand}} {{model}}',
    step1: 'Détails de la réservation',
    step2: 'Paiement',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    pickupLocation: 'Lieu de prise en charge (optionnel)',
    dropoffLocation: 'Lieu de dépose (optionnel)',
    continueToPayment: 'Continuer vers le paiement',
    back: 'Retour',
    email: 'Email',
    nameOnCard: 'Nom sur la carte',
    payNow: 'Payer maintenant',
    processing: 'Traitement en cours...',
    testCardInfo: 'Carte de test : 4242 4242 4242 4242 | Exp : Toute date future | CVV : 3 chiffres',
    bookingConfirmed: 'Réservation confirmée !',
    thankYou: 'Merci pour votre réservation',
    bookingId: 'ID de réservation',
    status: 'Statut',
    totalPrice: 'Prix total',
    basePrice: 'Prix de base',
    tax: 'Taxe (20%)',
    browseMoreCars: 'Parcourir plus de voitures',
  },

  // Forms
  forms: {
    required: 'Ce champ est requis',
    invalidDate: 'La date de fin doit être après la date de début',
    selectDates: 'Veuillez sélectionner les dates de début et de fin',
  },

  // Errors
  errors: {
    generic: 'Une erreur s\'est produite. Veuillez réessayer.',
    stripeNotLoaded: 'Stripe n\'est pas encore chargé. Veuillez réessayer.',
    cardElementNotFound: 'Élément de carte introuvable',
  },

  // GDPR
  gdpr: {
    consent: 'J\'accepte le traitement de mes données personnelles conformément à la politique de confidentialité',
    privacyPolicy: 'Politique de confidentialité',
    cookiePolicy: 'Politique de cookies',
  },
};