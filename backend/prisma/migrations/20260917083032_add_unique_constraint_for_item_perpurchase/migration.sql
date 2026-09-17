/*
  Warnings:

  - A unique constraint covering the columns `[purchase_id,product_id]` on the table `purchase_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "purchase_items_purchase_id_product_id_key" ON "purchase_items"("purchase_id", "product_id");
