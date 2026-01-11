import { useQuery, useMutation } from '@apollo/client';
import { GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';
import { CREATE_CAR_MUTATION, ADD_CAR_IMAGE_MUTATION, DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export const useAddCar = (brandId: string) => {
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId },
    skip: !brandId,
  });

  const [createCar] = useMutation(CREATE_CAR_MUTATION, { 
    refetchQueries: [{ query: GET_CARS_QUERY }] 
  });
  const [uploadImage] = useMutation(ADD_CAR_IMAGE_MUTATION);
  const [deleteCar] = useMutation(DELETE_CAR_MUTATION);

  return {
    enumData,
    brandData,
    modelData,
    createCar,
    uploadImage,
    deleteCar
  };
};