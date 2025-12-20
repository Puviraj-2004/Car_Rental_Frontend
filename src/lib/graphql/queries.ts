import { gql } from '@apollo/client';

export const GET_CARS_QUERY = gql`
  query GetCars($filter: CarFilterInput) {
    cars(filter: $filter) {
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
        createdAt
        updatedAt
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
