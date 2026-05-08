import { prisma } from "./prisma";

export type PaymentStatus = "pending" | "completed" | "failed";

export async function createPayment(id: string, amount: number, currency: string) {
  return prisma.payment.create({
    data: { id, amount, currency, status: "pending" },
  });
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  return prisma.payment.update({
    where: { id },
    data: { status },
  });
}

export async function getPayment(id: string) {
  return prisma.payment.findUnique({ where: { id } });
}

export async function getAllPayments() {
  return prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
}
