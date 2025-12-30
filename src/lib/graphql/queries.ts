import { gql } from '@apollo/client';

// --- 👤 USER & PROFILE QUERIES ---

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      username
      email
      phoneNumber
      isEmailVerified
      role
      driverProfile {
        id
        status
        licenseNumber
        licenseExpiry
        dateOfBirth
        address
        licenseFrontUrl
        licenseBackUrl
        idProofUrl
        addressProofUrl
        verificationNote
      }
    }
  }
`;

export const GET_MY_BOOKINGS_QUERY = gql`
  query GetMyBookings {
    myBookings {
      id
      createdAt
      startDate
      endDate

      # Meter Tracking & KM Management
      startMeter
      endMeter
      allowedKm
      extraKmUsed
      extraKmCharge

      # Financials
      totalPrice
      totalFinalPrice
      basePrice
      taxAmount
      depositAmount
      surchargeAmount

      status
      rentalType
      bookingType
      repairOrderId
      pickupLocation
      dropoffLocation
      car {
        brand { name }
        model { name }
        plateNumber
        dailyKmLimit
        extraKmCharge
        images {
          imagePath
          isPrimary
        }
      }
      payment {
        status
        amount
      }
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
    }
  }
`;

export const GET_ALL_BOOKINGS_QUERY = gql`
  query GetAllBookings {
    bookings {
      id
      startDate
      endDate

      # Meter Tracking & KM Management
      startMeter
      endMeter
      allowedKm
      extraKmUsed
      extraKmCharge

      # Financials
      totalPrice
      totalFinalPrice
      basePrice
      taxAmount
      depositAmount
      surchargeAmount

      status
      rentalType
      bookingType
      repairOrderId
      pickupLocation
      dropoffLocation
      user {
        id
        username
        email
        phoneNumber
      }
      car {
        brand { name }
        model { name }
        plateNumber
        dailyKmLimit
        extraKmCharge
        images {
          imagePath
          isPrimary
        }
      }
      payment {
        status
        amount
      }
      verification {
        isVerified
        expiresAt
      }
    }
  }
`;

// --- 🚗 CARS QUERIES ---

export const GET_CARS_QUERY = gql`
  query GetCars($filter: CarFilterInput) {
    cars(filter: $filter) {
      id
      brand { id name }
      model { id name }
      year
      fuelType
      transmission
      seats
      mileage

      # KM Limits & Meter Tracking
      dailyKmLimit
      extraKmCharge
      currentMileage

      depositAmount
      pricePerDay
      pricePerHour
      critAirRating
      status
      images {
        id
        imagePath
        altText
        isPrimary
      }
    }
  }
`;

export const GET_CAR_QUERY = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand { id name logoUrl }
      model { id name }
      year
      plateNumber
      fuelType
      transmission
      seats
      mileage

      # KM Limits & Meter Tracking
      dailyKmLimit
      extraKmCharge
      currentMileage

      depositAmount
      pricePerHour
      pricePerDay
      critAirRating
      status
      descriptionEn
      descriptionFr
      images {
        id
        imagePath
        altText
        isPrimary
      }
    }
  }
`;

export const GET_AVAILABLE_CARS_QUERY = gql`
  query GetAvailableCars($startDate: String!, $endDate: String!) {
    availableCars(startDate: $startDate, endDate: $endDate) {
      id
      brand { name }
      model { name }
      year
      fuelType
      transmission
      seats
      pricePerDay
      pricePerHour
      images {
        imagePath
        isPrimary
      }
    }
  }
`;

// --- ⚙️ UTILS (ENUMS & SETTINGS) ---

export const GET_CAR_ENUMS = gql`
  query GetCarEnums {
    fuelTypeEnum: __type(name: "FuelType") {
      enumValues { name }
    }
    transmissionEnum: __type(name: "TransmissionType") {
      enumValues { name }
    }
    critAirEnum: __type(name: "CritAirCategory") {
      enumValues { name }
    }
    carStatusEnum: __type(name: "CarStatus") {
      enumValues { name }
    }
  }
`;

export const GET_PLATFORM_SETTINGS_QUERY = gql`
  query GetPlatformSettings {
    platformSettings {
      id
      companyName
      description
      logoUrl
      currency
      taxPercentage
      supportPhone
      supportEmail
      address
      facebookUrl
      twitterUrl
      instagramUrl
      linkedinUrl
    }
  }
`;

export const GET_BRANDS_QUERY = gql`
  query GetBrands {
    brands {
      id
      name
      logoUrl
    }
  }
`;

export const GET_MODELS_QUERY = gql`
  query GetModels($brandId: ID!) {
    models(brandId: $brandId) {
      id
      name
    }
  }
`;

export const GET_BOOKING_QUERY = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      startDate
      endDate

      # Meter Tracking & KM Management
      startMeter
      endMeter
      allowedKm
      extraKmUsed
      extraKmCharge

      # Financials
      totalPrice
      totalFinalPrice
      basePrice
      taxAmount
      depositAmount
      surchargeAmount

      status
      rentalType
      bookingType
      repairOrderId
      pickupLocation
      dropoffLocation
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        seats
        dailyKmLimit
        extraKmCharge
        pricePerDay
        pricePerHour
        depositAmount
        images {
          imagePath
          isPrimary
        }
      }
      payment {
        status
        amount
      }
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
    }
  }
`;

export const CHECK_CAR_AVAILABILITY_QUERY = gql`
  query CheckCarAvailability($carId: ID!, $startDate: String!, $endDate: String!) {
    checkCarAvailability(carId: $carId, startDate: $startDate, endDate: $endDate) {
      available
      conflictingBookings {
        id
        startDate
        endDate
        user {
          username
        }
      }
    }
  }
`;

export const GET_BOOKING_ID_BY_TOKEN_QUERY = gql`
  query GetBookingIdByToken($token: String!) {
    verifyBookingToken(token: $token) {
      success
      bookingId
    }
  }
`;