import { gql } from '@apollo/client';

// --- 👤 USER & PROFILE QUERIES ---

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      fullName
      email
      phoneNumber
      dateOfBirth
      fullAddress
      role
      verification {
        id
        status
        licenseNumber
        licenseCategory
        licenseExpiry
        idNumber
        idExpiry
        licenseFrontUrl
        licenseBackUrl
        idCardUrl
        addressProofUrl
        rejectionReason
        aiMetadata
        verifiedAt
        createdAt
        updatedAt
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
      pickupTime
      returnTime

      # Meter Tracking
      startOdometer
      endOdometer
      
      # Corrected Field Name
      extraKmFee 

      # Financials
      totalPrice
      basePrice
      taxAmount
      depositAmount

      status
      bookingType
      repairOrderId
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
      car {
        brand { name }
        model { name }
        plateNumber
        dailyKmLimit
        extraKmCharge
        requiredLicense
        images {
          url
          isPrimary
        }
      }
      payment {
        status
        amount
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
      pickupTime
      returnTime
      totalPrice
      basePrice
      taxAmount
      depositAmount
      status
      bookingType
      repairOrderId
      createdAt
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
      user {
        id
        fullName
        email
        phoneNumber
      }
      car {
        id
        plateNumber
        status
        brand { name }
        model { name }
        images {
          url
          isPrimary
        }
      }
    }
  }
`;

// --- 🚗 CARS QUERIES ---

export const GET_CARS_QUERY = gql`
  query GetCars($filter: CarFilterInput) {
    cars(filter: $filter) {
      id
      plateNumber
      brand { id name }
      model { id name }
      year
      fuelType
      transmission
      seats
      requiredLicense

      # Car Specs
      dailyKmLimit
      extraKmCharge
      currentOdometer

      depositAmount
      pricePerDay
      critAirRating
      status
      images {
        id
        url
        isPrimary
      }
    }
  }
`;

export const GET_CAR_QUERY = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand { id name }
      model { id name }
      year
      plateNumber
      fuelType
      transmission
      seats
      requiredLicense

      dailyKmLimit
      extraKmCharge
      currentOdometer

      depositAmount
      pricePerDay
      critAirRating
      status
      images {
        id
        url
        isPrimary
      }
      createdAt
      updatedAt
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
      requiredLicense
      pricePerDay
      images {
        url
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
    transmissionEnum: __type(name: "Transmission") {
      enumValues { name }
    }
    critAirEnum: __type(name: "CritAirCategory") {
      enumValues { name }
    }
    carStatusEnum: __type(name: "CarStatus") {
      enumValues { name }
    }
    licenseCategoryEnum: __type(name: "LicenseCategory") {
      enumValues { name }
    }
  }
`;

export const GET_PLATFORM_SETTINGS_QUERY = gql`
  query GetPlatformSettings {
    platformSettings {
      id
      companyName
      currency
      taxPercentage
      youngDriverMinAge
      youngDriverFee
      supportPhone
      supportEmail
      address
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
      pickupTime
      returnTime

      user {
        id
        verification {
          status
          licenseFrontUrl
          licenseBackUrl
          idCardUrl
          addressProofUrl
        }
      }

      # Meter Tracking
      startOdometer
      endOdometer
      extraKmFee

      # Financials
      totalPrice
      basePrice
      taxAmount
      depositAmount

      status
      bookingType
      repairOrderId
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        requiredLicense
        dailyKmLimit
        extraKmCharge
        pricePerDay
        depositAmount
        images {
          url
          isPrimary
        }
      }
      payment {
        status
        amount
      }
    }
  }
`;

export const CHECK_CAR_AVAILABILITY_QUERY = gql`
  query CheckCarAvailability($carId: ID!, $startDate: String!, $endDate: String!, $excludeBookingId: ID) {
    checkCarAvailability(carId: $carId, startDate: $startDate, endDate: $endDate, excludeBookingId: $excludeBookingId) {
      available
      conflictingBookings {
        id
        startDate
        endDate
        user {
          fullName
        }
      }
    }
  }
`;

export const GET_BOOKING_ID_BY_TOKEN_QUERY = gql`
  query GetBookingIdByToken($token: String!) {
    bookingByToken(token: $token) {
      id
      status
    }
  }
`;

export const GET_BOOKING_BY_TOKEN_QUERY = gql`
  query GetBookingByToken($token: String!) {
    bookingByToken(token: $token) {
      id
      startDate
      endDate
      startOdometer
      endOdometer
      extraKmFee
      
      totalPrice
      basePrice
      taxAmount
      depositAmount
      status
      bookingType
      repairOrderId
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
      user {
        id
        fullName
        email
        phoneNumber
      }
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        requiredLicense
        dailyKmLimit
        extraKmCharge
        pricePerDay
        depositAmount
        images {
          url
          isPrimary
        }
      }
      payment {
        status
        amount
      }
    }
  }
`;