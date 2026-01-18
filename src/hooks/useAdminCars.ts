import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CARS_QUERY, 
  GET_BRANDS_QUERY, 
  GET_MODELS_QUERY, 
  GET_CAR_ENUMS 
} from '@/lib/graphql/queries';
import { DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export interface AdminCarsFilter {
  brandIds: string[];
  modelIds: string[];
  fuelTypes: string[];
  transmissions: string[];
  statuses: string[];
  critAirRatings: string[];
  includeOutOfService: boolean;
}

export const useAdminCars = () => {
  const [filters, setFilters] = useState<AdminCarsFilter>({
    brandIds: [],
    modelIds: [],
    fuelTypes: [],
    transmissions: [],
    statuses: [],
    critAirRatings: [],
    includeOutOfService: true
  });

  const selectedBrandForModels = filters.brandIds.length > 0 ? filters.brandIds[0] : '';

  // Main Data Query
  const { loading, error, data, refetch } = useQuery(GET_CARS_QUERY, {
    variables: { filter: { ...filters, includeOutOfService: true } },
    fetchPolicy: 'cache-and-network'
  });

  // Supporting Metadata Queries
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: selectedBrandForModels },
    skip: !selectedBrandForModels,
  });

  // Mutation
  const [deleteCar, { loading: isDeleting }] = useMutation(DELETE_CAR_MUTATION, {
    onCompleted: () => refetch(),
  });

  const resetFilters = () => {
    setFilters({
      brandIds: [],
      modelIds: [],
      fuelTypes: [],
      transmissions: [],
      statuses: [],
      critAirRatings: [],
      includeOutOfService: true
    });
  };

  return {
    cars: data?.cars || [],
    brands: brandData?.brands || [],
    models: modelData?.models || [],
    enums: enumData || {},
    filters,
    setFilters,
    resetFilters,
    deleteCar,
    loading: loading || isDeleting,
    error
  };
};