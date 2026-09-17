import { getPurchaseByRN } from "../repositories/purchase.repositories.js";

export const generateRF = async () => {
  const today = new Date();
  const year = String(today.getFullYear());
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  let counter = 1;
  let referenceNumber = `PUR-${year}-${month + day}-${String(counter).padStart(6, "0")}`;
  while (await getPurchaseByRN(referenceNumber)) {
    counter++;
    referenceNumber = `PUR-${year}-${month + day}-${String(counter).padStart(6, "0")}`;
  }
  return referenceNumber;
};
