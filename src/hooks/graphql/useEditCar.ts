import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CAR_QUERY, 
  GET_CAR_ENUMS, 
  GET_BRANDS_QUERY, 
  GET_MODELS_QUERY,
  GET_MODELS_BY_BRAND_QUERY,
  GET_CARS_QUERY 
} from '@/lib/graphql/queries';
import { 
  UPDATE_CAR_MUTATION, 
  ADD_CAR_IMAGE_MUTATION, 
  DELETE_CAR_IMAGE_MUTATION, 
  SET_PRIMARY_CAR_IMAGE_MUTATION 
} from '@/lib/graphql/mutations';

export const useEditCar = (carId: string , selectedBrandId: string) => {
  const { data: carData, loading: carLoading, error: carError } = useQuery(GET_CAR_QUERY, {
    variables: { id: carId },
    fetchPolicy: 'no-cache'
  });
  
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  
  const { data: modelData } = useQuery(GET_MODELS_BY_BRAND_QUERY, {
    variables: { brandId: selectedBrandId || carData?.car?.brand?.id || '' },
    skip: !(selectedBrandId || carData?.car?.brand?.id),
  });

  const [updateCar] = useMutation(UPDATE_CAR_MUTATION, { refetchQueries: [{ query: GET_CARS_QUERY }] });
  const [uploadCarImages] = useMutation(ADD_CAR_IMAGE_MUTATION);
  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE_MUTATION);
  const [setPrimaryCarImage] = useMutation(SET_PRIMARY_CAR_IMAGE_MUTATION);

  return {
    carData: carData?.car, carLoading, carError,
    enumData, brandData, modelData,
    updateCar, uploadCarImages, deleteCarImage, setPrimaryCarImage
  };
};