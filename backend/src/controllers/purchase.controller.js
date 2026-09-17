import {
    cancelPurchaseService,
    completePurchaseService,
    createPurchaseService,
  getPurchaseService,
  getPurchasesService,
  updatePurchaseService,
} from "../services/purchase.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPurchasesController = asyncHandler(async (req, res) => {
  const response = await getPurchasesService();
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const getPurchaseController = asyncHandler(async (req, res) => {
  const response = await getPurchaseService(req.params.id);
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const createPurchaseController = asyncHandler(async(req,res)=>{
    const response = await createPurchaseService(req.user.id,req.body)
    res.status(201).json({
    success: true,
    message:"Purchase created successfully",
    data: response,
  });
})
export const updatePurchaseController = asyncHandler(async(req,res)=>{
    const response = await updatePurchaseService(req.params.id,req.body)
    res.status(200).json({
    success: true,
    message:"Purchase updated successfully",
    data: response,
  });
})
export const completePurchaseController = asyncHandler(async(req,res)=>{
    const response =await completePurchaseService(req.params.id)
    res.status(200).json({
    success: true,
    message:"Purchase completed successfully",
    data: response,
  });
})
export const cancelPurchaseController = asyncHandler(async(req,res)=>{
    const response =await cancelPurchaseService(req.params.id)
    res.status(200).json({
    success: true,
    message:"Purchase cancelled successfully",
    data: response,
  });
})
