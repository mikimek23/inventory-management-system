import {
  getUserService,
  getUsersService,
  updateUserRoleService,
  updateUserStatusService,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUsersController = asyncHandler(async (req, res) => {
  const response = await getUsersService();
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const getUserController = asyncHandler(async (req, res) => {
  const response = await getUserService(req.params.id);
  res.status(200).json({
    success: true,
    data: response,
  });
});

export const updateUserRoleController = asyncHandler(async (req, res) => {
  const response = await updateUserRoleService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const updateUserStatusController = asyncHandler(async (req, res) => {
  const response = await updateUserStatusService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: response,
  });
});
