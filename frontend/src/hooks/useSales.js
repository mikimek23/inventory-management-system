import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import saleApi from "../services/sale.api";

export const useSales = (params = {}) => {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => saleApi.getAll(params),
  });
};

export const useSale = (id) => {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => saleApi.getById(id),
    enabled: !!id,
  });
};

export const useSaleMutations = () => {
  const queryClient = useQueryClient();

  const createSale = useMutation({
    mutationFn: (data) => saleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const updateSale = useMutation({
    mutationFn: ({ id, data }) => saleApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", id] });
    },
  });

  const completeSale = useMutation({
    mutationFn: (id) => saleApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", id] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const cancelSale = useMutation({
    mutationFn: (id) => saleApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", id] });
    },
  });

  return {
    createSale,
    updateSale,
    completeSale,
    cancelSale,
  };
};

export default useSales;
