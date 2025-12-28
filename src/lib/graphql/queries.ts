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

export const GET_BOOKING_BY_ID_QUERY = gql`
  query GetBookingById($id: ID!) {
    booking(id: $id) {
      id
      startDate
      endDate
      totalPrice
      status
      car {
        brand { name }
        model { name }
        images { 
          imagePath 
          isPrimary
        }
      }
    }
  }
`;

export const GET_MY_BOOKINGS_QUERY = gql`
  query GetMyBookings {
    myBookings {
      id
      startDate
      endDate
      totalPrice
      status
      rentalType
      pickupLocation
      dropoffLocation
      car {
        brand { name }
        model { name }
        plateNumber
        images { 
          imagePath 
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
      depositAmount
      pricePerDay
      pricePerHour
      pricePerKm
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
      depositAmount
      pricePerHour
      pricePerKm
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