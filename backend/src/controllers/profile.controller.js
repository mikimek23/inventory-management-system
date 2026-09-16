import { updateProfileService } from "../services/profile.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateProfileController = asyncHandler(async (req, res) => {
  const response = await updateProfileService(req.user.id, req.body);
  res.status(200).json({
    success: true,
    data: response,
  });
});
