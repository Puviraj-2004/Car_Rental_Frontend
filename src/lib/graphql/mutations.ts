import { gql } from '@apollo/client';

export const CREATE_CAR_MUTATION = gql`
  mutation CreateCar($input: CreateCarInput!) {
    createCar(input: $input) {
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
    }
  }
`;

export const UPDATE_CAR_MUTATION = gql`
  mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_CAR_MUTATION = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id)
  }
`;

export const UPLOAD_CAR_IMAGES_MUTATION = gql`
  mutation UploadCarImages($input: UploadCarImagesInput!) {
    uploadCarImages(input: $input) {
      id
      carId
      imagePath
      altText
      isPrimary
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CAR_IMAGE_MUTATION = gql`
  mutation DeleteCarImage($imageId: ID!) {
    deleteCarImage(imageId: $imageId)
  }
`;

export const SET_PRIMARY_CAR_IMAGE_MUTATION = gql`
  mutation SetPrimaryCarImage($carId: ID!, $imageId: ID!) {
    setPrimaryCarImage(carId: $carId, imageId: $imageId)
  }
`;


