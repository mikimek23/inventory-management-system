import {
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../repositories/customer.repositories.js";
import AppError from "../utils/AppError.js";

export const getCustomersService = async () => {
  const customers = await getCustomers();
  return customers;
};
export const createCustomerService = async (data) => {
  const customer = await createCustomer(data);
  return customer;
};
export const updateCustomerService = async (customerId, data) => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  const updatedCustomer = await updateCustomer(customerId, data);
  return updatedCustomer;
};
export const updateCustomerStatusService = async (customerId) => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  const status = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const updatedCustomer = await updateCustomer(customerId, { status: status });
  return updatedCustomer;
};
