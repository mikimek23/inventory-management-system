import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "../repositories/supplier.repositories.js";
import AppError from "../utils/AppError.js";

export const getSuppliersService = async () => {
  const suppliers = await getSuppliers();
  return suppliers;
};
export const createSupplierService = async (data) => {
  const supplier = await createSupplier(data);
  return supplier;
};
export const updateSupplierService = async (supplierId, data) => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }
  const updatedSupplier = await updateSupplier(supplierId, data);
  return updatedSupplier;
};
export const updateSupplierStatusService = async (supplierId) => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }
  const status = supplier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const updatedSupplier = await updateSupplier(supplierId, { status: status });
  return updatedSupplier;
};
