"use server";

import { revalidatePath } from "next/cache";

export async function revalidateMasterBus() {
  revalidatePath("/master/bus");
}

export async function revalidateMasterEmployees() {
  revalidatePath("/master/employes");
}

export async function revalidateMasterSchedules() {
  revalidatePath("/schedule/input");
}

export async function revalidateMasterPositions() {
  revalidatePath("/master/position");
}

export async function revalidateMasterCustomers() {
  revalidatePath("/master/customers");
}
export async function revalidatePayments() {
  revalidatePath("/master/customers");
}
export async function revalidateTripSheet() {
  revalidatePath("/trip_sheet");
}

export async function revalidateMasterBusTypes() {
  revalidatePath("/master/bus-type");
}