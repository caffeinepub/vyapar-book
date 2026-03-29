import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface ExpenseCategory {
    id: Id;
    name: string;
    isDefault: boolean;
}
export interface LedgerEntryDTO {
    entryType: Variant_credit_debit;
    date: Timestamp;
    description: string;
    accountType: AccountType;
    amount: Rupiah;
}
export type Rupiah = bigint;
export interface LedgerEntry {
    id: Id;
    entryType: Variant_credit_debit;
    date: Timestamp;
    createdAt: Timestamp;
    createdBy: Principal;
    description: string;
    accountType: AccountType;
    amount: Rupiah;
}
export interface ProfitEntry {
    id: Id;
    date: Timestamp;
    notes: string;
    amount: Rupiah;
}
export interface Tag {
    id: Id;
    name: string;
}
export interface AccountBalances {
    cashBalance: Rupiah;
    bankBalance: Rupiah;
}
export type Id = bigint;
export interface SaleEntry {
    id: Id;
    date: Timestamp;
    onlineAmount: Rupiah;
    notes: string;
    cashAmount: Rupiah;
}
export interface ExpenseEntry {
    id: Id;
    categoryId: Id;
    date: Timestamp;
    tagIds: Array<Id>;
    accountType: AccountType;
    notes: string;
    amount: Rupiah;
}
export interface UserProfile {
    name: string;
    businessName: string;
}
export enum AccountType {
    bank = "bank",
    cash = "cash"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_credit_debit {
    credit = "credit",
    debit = "debit"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createExpense(date: Timestamp, amount: Rupiah, categoryId: Id, accountType: AccountType, tagIds: Array<Id>, notes: string): Promise<Id>;
    createExpenseCategory(name: string): Promise<Id>;
    createLedgerEntry(dto: LedgerEntryDTO): Promise<Id>;
    createProfitEntry(date: Timestamp, amount: Rupiah, notes: string): Promise<Id>;
    createSale(date: Timestamp, cashAmount: Rupiah, onlineAmount: Rupiah, notes: string): Promise<Id>;
    createTag(name: string): Promise<Id>;
    deleteExpense(expenseId: Id): Promise<void>;
    deleteProfitEntry(profitId: Id): Promise<void>;
    deleteSale(saleId: Id): Promise<void>;
    getAccountBalances(): Promise<AccountBalances>;
    getAllExpenseCategories(): Promise<Array<ExpenseCategory>>;
    getAllExpenseCategoriesWithExpenses(): Promise<Array<[ExpenseCategory, Array<ExpenseEntry>]>>;
    getAllExpenses(): Promise<Array<ExpenseEntry>>;
    getAllLedgerEntries(): Promise<Array<LedgerEntry>>;
    getAllProfits(): Promise<Array<ProfitEntry>>;
    getAllSales(): Promise<Array<SaleEntry>>;
    getAllTags(): Promise<Array<Tag>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpense(expenseId: Id): Promise<ExpenseEntry | null>;
    getExpenseCategory(categoryId: Id): Promise<ExpenseCategory | null>;
    getLedgerEntry(ledgerId: Id): Promise<LedgerEntry | null>;
    getProfitEntry(profitId: Id): Promise<ProfitEntry | null>;
    getSale(saleId: Id): Promise<SaleEntry | null>;
    getTag(tagId: Id): Promise<Tag | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
