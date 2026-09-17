import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import stockApi from "../services/stock.api";

export const useStock = (params = {}) => {
  return useQuery({
    queryKey: ["stock", params],
    queryFn: () => stockApi.getStockList(params),
  });
};

export const useStockAdjustments = (params = {}) => {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () => stockApi.getAdjustments(params),
  });
};

export const useStockAdjustmentMutations = () => {
  const queryClient = useQueryClient();

  const createAdjustment = useMutation({
    mutationFn: (data) => stockApi.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    createAdjustment,
  };
};

export default useStock;
