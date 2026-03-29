import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountType, Variant_credit_debit } from "../backend";
import type { LedgerEntryDTO } from "../backend";
import { useActor } from "./useActor";

export { AccountType, Variant_credit_debit };

export function useAccountBalances() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["accountBalances"],
    queryFn: async () => {
      if (!actor) return { cashBalance: 0n, bankBalance: 0n };
      return actor.getAccountBalances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSales() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllExpenseCategories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["expenseCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenseCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTags() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTags();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProfits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllLedgerEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ledgerEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLedgerEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: bigint;
      cashAmount: bigint;
      onlineAmount: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSale(
        params.date,
        params.cashAmount,
        params.onlineAmount,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["accountBalances"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerEntries"] });
    },
  });
}

export function useCreateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: bigint;
      amount: bigint;
      categoryId: bigint;
      accountType: AccountType;
      tagIds: bigint[];
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createExpense(
        params.date,
        params.amount,
        params.categoryId,
        params.accountType,
        params.tagIds,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["accountBalances"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerEntries"] });
    },
  });
}

export function useCreateExpenseCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createExpenseCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
    },
  });
}

export function useCreateTag() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTag(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useCreateProfitEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: bigint;
      amount: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProfitEntry(params.date, params.amount, params.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profits"] });
    },
  });
}

export function useCreateLedgerEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: LedgerEntryDTO) => {
      if (!actor) throw new Error("Not connected");
      return actor.createLedgerEntry(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledgerEntries"] });
      queryClient.invalidateQueries({ queryKey: ["accountBalances"] });
    },
  });
}

export function useDeleteSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSale(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["accountBalances"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["accountBalances"] });
    },
  });
}

export function useDeleteProfitEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProfitEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profits"] });
    },
  });
}
