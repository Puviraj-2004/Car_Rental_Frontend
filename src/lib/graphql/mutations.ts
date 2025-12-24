import { gql } from '@apollo/client';

// --- 🚗 CAR MUTATIONS ---

export const CREATE_CAR_MUTATION = gql`
  mutation CreateCar($input: CreateCarInput!) {
    createCar(input: $input) {
      id
      brandId
      modelId
      year
      plateNumber
      fuelType
      transmission
      seats
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      status
      createdAt
    }
  }
`;

export const UPDATE_CAR_MUTATION = gql`
  mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id
      brandId
      modelId
      year
      plateNumber
      fuelType
      transmission
      seats
      pricePerHour
      pricePerKm
      pricePerDay
      critAirRating
      status
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

// --- 🏷️ INVENTORY (BRAND & MODEL) MUTATIONS ---

export const CREATE_BRAND_MUTATION = gql`
  mutation CreateBrand($name: String!) {
    createBrand(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($id: ID!, $name: String!) {
    updateBrand(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_BRAND_MUTATION = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`;

export const CREATE_MODEL_MUTATION = gql`
  mutation CreateModel($name: String!, $brandId: ID!) {
    createModel(name: $name, brandId: $brandId) {
      id
      name
    }
  }
`;

export const UPDATE_MODEL_MUTATION = gql`
  mutation UpdateModel($id: ID!, $name: String!) {
    updateModel(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_MODEL_MUTATION = gql`
  mutation DeleteModel($id: ID!) {
    deleteModel(id: $id)
  }
`;

// --- 📸 IMAGE MUTATIONS ---

export const UPLOAD_CAR_IMAGES_MUTATION = gql`
  mutation UploadCarImages($input: UploadCarImagesInput!) {
    uploadCarImages(input: $input) {
      id
      carId
      imagePath
      altText
      isPrimary
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