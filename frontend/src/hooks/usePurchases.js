import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import purchaseApi from "../services/purchase.api";

export const usePurchases = (params = {}) => {
  return useQuery({
    queryKey: ["purchases", params],
    queryFn: () => purchaseApi.getAll(params),
  });
};

export const usePurchase = (id) => {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: () => purchaseApi.getById(id),
    enabled: !!id,
  });
};

export const usePurchaseMutations = () => {
  const queryClient = useQueryClient();

  const createPurchase = useMutation({
    mutationFn: (data) => purchaseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  const updatePurchase = useMutation({
    mutationFn: ({ id, data }) => purchaseApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
    },
  });

  const completePurchase = useMutation({
    mutationFn: (id) => purchaseApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const cancelPurchase = useMutation({
    mutationFn: (id) => purchaseApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
    },
  });

  return {
    createPurchase,
    updatePurchase,
    completePurchase,
    cancelPurchase,
  };
};

export default usePurchases;
