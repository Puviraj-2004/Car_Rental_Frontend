import { gql } from '@apollo/client';

// 1. புதிய Enum Query (Add Car/Edit Car பக்கங்களுக்கு மிகவும் முக்கியம்)
export const GET_CAR_ENUMS = gql`
  query GetCarEnums {
    fuelTypeEnum: __type(name: "FuelType") {
      enumValues {
        name
      }
    }
    transmissionEnum: __type(name: "TransmissionType") {
      enumValues {
        name
      }
    }
    critAirEnum: __type(name: "CritAirCategory") {
      enumValues {
        name
      }
    }
  }
`;

export const GET_CARS_QUERY = gql`
  query GetCars {
    cars {
      id
      brand
      model
      year
      plateNumber
      fuelType
      transmission
      pricePerHour    
      pricePerKm      
      pricePerDay
      critAirRating # இது இப்போது Enum ஆக வரும்
      availability
      images {        
        id
        imagePath
        isPrimary
      }
    }
  }
`;

export const GET_CAR_QUERY = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand
      model
      year
      plateNumber
      fuelType
      transmission
      seats
      doors
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating # இது இப்போது Enum ஆக வரும்
      availability
      descriptionEn
      descriptionFr
      createdAt
      updatedAt
      images {
        id
        carId
        imagePath
        altText
        isPrimary
        createdAt
        updatedAt
      }
      bookings {
        id
        startDate
        endDate
        status
      }
    }
  }
`;

export const GET_AVAILABLE_CARS_QUERY = gql`
  query GetAvailableCars($startDate: String!, $endDate: String!) {
    availableCars(startDate: $startDate, endDate: $endDate) {
      id
      brand
      model
      year
      plateNumber
      fuelType
      transmission
      seats
      doors
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      availability
      descriptionEn
      descriptionFr
      createdAt
      updatedAt
      images {
        id
        carId
        imagePath
        altText
        isPrimary
      }
    }
  }
`;