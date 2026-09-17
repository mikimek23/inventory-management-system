import { getPurchaseByRN } from "../repositories/purchase.repositories.js";
import { getSaleByRN } from "../repositories/sale.repositories.js";

const generateReferenceNumber = async (prefix, getByReferenceNumber, db) => {
  const today = new Date();
  const year = String(today.getFullYear());
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  let counter = 1;
  let referenceNumber = `${prefix}-${year}-${month + day}-${String(counter).padStart(6, "0")}`;
  while (await getByReferenceNumber(referenceNumber, db)) {
    counter++;
    referenceNumber = `${prefix}-${year}-${month + day}-${String(counter).padStart(6, "0")}`;
  }
  return referenceNumber;
};

export const generateRF = () => generateReferenceNumber("PUR", getPurchaseByRN);
export const generateSaleRF = (db) =>
  generateReferenceNumber("SAL", getSaleByRN, db);
