import prisma from "../config/database.js";

export const getCustomers = async () => {
  return prisma.customer.findMany();
};
export const getCustomerById = async (id) => {
  return prisma.customer.findUnique({ where: { id } });
};
export const createCustomer = async (data) => {
  return prisma.customer.create({ data });
};
export const updateCustomer = async (customerId, data) => {
  return prisma.customer.update({ where: { id: customerId }, data });
};
