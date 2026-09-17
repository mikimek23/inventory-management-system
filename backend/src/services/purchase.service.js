import prisma from "../config/database.js";
import { getProduct } from "../repositories/product.repositories.js";
import {
  createPurchase,
  createPurchaseItems,
  deletePurchaseItems,
  getPurchaseById,
  getPurchases,
  updatePurchase,
} from "../repositories/purchase.repositories.js";
import { getSupplierById } from "../repositories/supplier.repositories.js";
import AppError from "../utils/AppError.js";
import { generateRF } from "../utils/referenceNumber.js";
export const getPurchasesService = async () => {
  const purchases = await getPurchases();
  return purchases;
};
export const getPurchaseService = async (id) => {
  const purchase = await getPurchaseById(id);
  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }
  return purchase;
};
export const createPurchaseService = async (createdBy, data) => {
  return prisma.$transaction(async (tx) => {
    const supplier = await getSupplierById(data.supplierId);
    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }
    if (supplier.status === "INACTIVE") {
      throw new AppError("Deactivated suppliere", 403);
    }

    for (const item of data.items) {
      const product = await getProduct(item.productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }
      if (product.status === "INACTIVE") {
        throw new AppError("Deactivated Product", 403);
      }
    }
    const calculatedItems = data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      lineTotal: item.quantity * item.unitCost,
    }));
    const total = calculatedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const referenceNumber = await generateRF();
    console.log(referenceNumber);
    const purchaseData = {
      supplierId: data.supplierId,
      createdById: createdBy,
      referenceNumber,
      notes: data.notes,
      total,
    };
    const purchase = await createPurchase(tx, purchaseData);
    const purchaseItemsData = calculatedItems.map((item) => ({
      ...item,
      purchaseId: purchase.id,
    }));
    await createPurchaseItems(tx, purchaseItemsData);
    return purchase;
  });
};

export const updatePurchaseService = async (purchaseId, data) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await getPurchaseById(purchaseId);

    if (!purchase) {
      throw new AppError("Purchase not found", 404);
    }

    if (purchase.status !== "DRAFT") {
      throw new AppError("Only draft purchases can be updated", 409);
    }

    if (data.supplierId) {
      const supplier = await getSupplierById(data.supplierId);

      if (!supplier) {
        throw new AppError("Supplier not found", 404);
      }

      if (supplier.status === "INACTIVE") {
        throw new AppError("Deactivated supplier", 403);
      }
    }

    let updateData = {
      ...(data.supplierId && { supplierId: data.supplierId }),
      ...(data.notes !== undefined && { notes: data.notes }),
    };

    if (data.items) {
      for (const item of data.items) {
        const product = await getProduct(item.productId);

        if (!product) {
          throw new AppError("Product not found", 404);
        }

        if (product.status === "INACTIVE") {
          throw new AppError("Deactivated product", 403);
        }
      }

      const calculatedItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lineTotal: item.quantity * item.unitCost,
      }));

      const total = calculatedItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      );

      updateData = {
        ...updateData,
        total,
      };

      await deletePurchaseItems(tx, purchaseId);

      const purchaseItemsData = calculatedItems.map((item) => ({
        ...item,
        purchaseId,
      }));

      await createPurchaseItems(tx, purchaseItemsData);
    }

    const updatedPurchase = await updatePurchase(tx, purchaseId, updateData);

    return updatedPurchase;
  });
};
export const completePurchaseService = async (purchaseId) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await getPurchaseById(purchaseId);

    if (!purchase) {
      throw new AppError("Purchase not found", 404);
    }

    if (purchase.status !== "DRAFT") {
      throw new AppError("Only draft purchases can be completed", 409);
    }

    const updatedPurchase = await updatePurchase(tx, purchaseId, {
      status: "COMPLETED",
    });

    return updatedPurchase;
  });
};
export const cancelPurchaseService = async (purchaseId) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await getPurchaseById(purchaseId);

    if (!purchase) {
      throw new AppError("Purchase not found", 404);
    }

    if (purchase.status !== "DRAFT") {
      throw new AppError("Only draft purchases can be cancelled", 409);
    }

    const updatedPurchase = await updatePurchase(tx, purchaseId, {
      status: "CANCELLED",
    });

    return updatedPurchase;
  });
};
