import { gql } from '@apollo/client';

// 1. Enums-ஐ டைனமிக்காகப் பெற
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
  }
`;

// 2. அனைத்து பிராண்டுகளைப் பெற (Inventory & Autocomplete)
export const GET_BRANDS_QUERY = gql`
  query GetBrands {
    brands {
      id
      name
    }
  }
`;

// 3. ஒரு குறிப்பிட்ட பிராண்டிற்கான மாடல்களைப் பெற
export const GET_MODELS_QUERY = gql`
  query GetModels($brandId: ID!) {
    models(brandId: $brandId) {
      id
      name
    }
  }
`;

// 4. கார் லிஸ்ட் (Normalized)
export const GET_CARS_QUERY = gql`
  query GetCars($filter: CarFilterInput) {
    cars(filter: $filter) {
      id
      brand { id name }
      model { id name }
      year
      plateNumber
      fuelType
      transmission
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      availability
      images {
        id
        imagePath
        isPrimary
      }
    }
  }
`;

// 5. ஒரு குறிப்பிட்ட காரின் முழு விவரம்
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
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      availability
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
      brand { id name }
      model { id name }
      year
      plateNumber
      fuelType
      transmission
      seats
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      availability
      images {
        id
        imagePath
        isPrimary
      }
    }
  }
`;