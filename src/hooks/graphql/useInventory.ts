import { useQuery, useMutation } from '@apollo/client';
import { GET_BRANDS_QUERY, GET_MODELS_QUERY } from '@/lib/graphql/queries';
import { 
  DELETE_BRAND_MUTATION, 
  UPDATE_BRAND_MUTATION, 
  DELETE_MODEL_MUTATION,
  UPDATE_MODEL_MUTATION,
  CREATE_BRAND_MUTATION,
  CREATE_MODEL_MUTATION
} from '@/lib/graphql/mutations';

export const useInventory = (selectedBrandId: string, activeTab: number) => {
  const { data: brands, refetch: refetchBrands } = useQuery(GET_BRANDS_QUERY);
  
  const { data: models, refetch: refetchModels, loading: modelsLoading } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: selectedBrandId },
    skip: !selectedBrandId && activeTab === 1
  });

  const [deleteBrand] = useMutation(DELETE_BRAND_MUTATION);
  const [updateBrand] = useMutation(UPDATE_BRAND_MUTATION);
  const [deleteModel] = useMutation(DELETE_MODEL_MUTATION);
  const [updateModel] = useMutation(UPDATE_MODEL_MUTATION);
  const [createBrand] = useMutation(CREATE_BRAND_MUTATION);
  const [createModel] = useMutation(CREATE_MODEL_MUTATION);

  return {
    brands: brands?.brands || [],
    models: models?.models || [],
    modelsLoading,
    refetchBrands,
    refetchModels,
    mutations: {
      createBrand, updateBrand, deleteBrand,
      createModel, updateModel, deleteModel
    }
  };
};