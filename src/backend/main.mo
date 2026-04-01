import Map "mo:core/Map";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type UniqueId = Nat;
  type Timestamp = Int;
  type Rupiah = Nat;
  type Id = Nat;

  type AccountType = {
    #cash;
    #bank;
  };

  type ExpenseCategory = {
    id : Id;
    name : Text;
    isDefault : Bool;
  };

  type ExpenseEntry = {
    id : Id;
    date : Timestamp;
    amount : Rupiah;
    categoryId : Id;
    accountType : AccountType;
    tagIds : [Id];
    notes : Text;
  };

  type Tag = {
    id : Id;
    name : Text;
  };

  type SaleEntry = {
    id : Id;
    date : Timestamp;
    cashAmount : Rupiah;
    onlineAmount : Rupiah;
    notes : Text;
  };

  type ProfitEntry = {
    id : Id;
    date : Timestamp;
    amount : Rupiah;
    notes : Text;
  };

  type LedgerEntry = {
    id : Id;
    date : Timestamp;
    amount : Rupiah;
    accountType : AccountType;
    description : Text;
    entryType : {
      #credit;
      #debit;
    };
    createdBy : Principal;
    createdAt : Timestamp;
  };

  type AccountBalances = {
    cashBalance : Rupiah;
    bankBalance : Rupiah;
  };

  type Rational = {
    numerator : Int;
    denominator : Int;
  };

  type LedgerEntryDTO = {
    date : Timestamp;
    amount : Rupiah;
    accountType : AccountType;
    description : Text;
    entryType : {
      #credit;
      #debit;
    };
  };

  public type UserProfile = {
    name : Text;
    businessName : Text;
  };

  module ExpenseCategory {
    public func compare(category1 : ExpenseCategory, category2 : ExpenseCategory) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  module Tag {
    public func compareByName(tag1 : Tag, tag2 : Tag) : Order.Order {
      Text.compare(tag1.name, tag2.name);
    };
  };

  module ExpenseEntry {
    public func compareByDate(entry1 : ExpenseEntry, entry2 : ExpenseEntry) : Order.Order {
      Int.compare(entry1.date, entry2.date);
    };
  };

  // Storage
  let categories = Map.empty<Id, ExpenseCategory>();
  let tags = Map.empty<Id, Tag>();
  let expenses = Map.empty<Id, ExpenseEntry>();
  let sales = Map.empty<Id, SaleEntry>();
  let profits = Map.empty<Id, ProfitEntry>();
  let ledgers = Map.empty<Id, LedgerEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Unique ID generators (persistent counters)
  var nextCategoryId : UniqueId = 1;
  var nextExpenseId : UniqueId = 1;
  var nextTagId : UniqueId = 1;
  var nextSaleId : UniqueId = 1;
  var nextProfitId : UniqueId = 1;
  var nextLedgerId : UniqueId = 1;

  // Internal helper to seed default categories (idempotent)
  func seedDefaultCategories() {
    let defaultCategoryNames = [
      "Rent",
      "Stock Purchase",
      "Power Bill",
      "Transport",
      "Miscellaneous",
    ];
    for (name in defaultCategoryNames.values()) {
      let existingCategory = categories.values().find(
        func(category) { category.name == name }
      );
      switch (existingCategory) {
        case (?_category) {};
        case (null) {
          let categoryId = nextCategoryId;
          nextCategoryId += 1;
          let newCategory : ExpenseCategory = {
            id = categoryId;
            name;
            isDefault = true;
          };
          categories.add(categoryId, newCategory);
        };
      };
    };
  };

  // Seed default categories at canister startup
  seedDefaultCategories();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    userProfiles.add(caller, profile);
  };

  // Initialize: any authenticated user can call this (idempotent, seeds default categories)
  public shared ({ caller }) func initialize() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    seedDefaultCategories();
  };

  // Expense Categories
  public shared ({ caller }) func createExpenseCategory(name : Text) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let categoryId = nextCategoryId;
    nextCategoryId += 1;
    let category : ExpenseCategory = {
      id = categoryId;
      name;
      isDefault = false;
    };
    categories.add(categoryId, category);
    categoryId;
  };

  public query ({ caller }) func getExpenseCategory(categoryId : Id) : async ?ExpenseCategory {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    categories.get(categoryId);
  };

  public query ({ caller }) func getAllExpenseCategories() : async [ExpenseCategory] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    categories.values().toArray().sort();
  };

  // Tags
  public shared ({ caller }) func createTag(name : Text) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let tagId = nextTagId;
    nextTagId += 1;
    let tag : Tag = {
      id = tagId;
      name;
    };
    tags.add(tagId, tag);
    tagId;
  };

  public query ({ caller }) func getTag(tagId : Id) : async ?Tag {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    tags.get(tagId);
  };

  public query ({ caller }) func getAllTags() : async [Tag] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    tags.values().toArray().sort(Tag.compareByName);
  };

  // Expenses
  public shared ({ caller }) func createExpense(date : Timestamp, amount : Rupiah, categoryId : Id, accountType : AccountType, tagIds : [Id], notes : Text) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Invalid category ID") };
      case (_) {
        let expenseId = nextExpenseId;
        nextExpenseId += 1;
        let expense : ExpenseEntry = {
          id = expenseId;
          date;
          amount;
          categoryId;
          accountType;
          tagIds;
          notes;
        };
        expenses.add(expenseId, expense);
        expenseId;
      };
    };
  };

  public query ({ caller }) func getExpense(expenseId : Id) : async ?ExpenseEntry {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    expenses.get(expenseId);
  };

  public query ({ caller }) func getAllExpenses() : async [ExpenseEntry] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    expenses.values().toArray().sort(ExpenseEntry.compareByDate);
  };

  public shared ({ caller }) func deleteExpense(expenseId : Id) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let existingExpense = expenses.get(expenseId);

    switch (existingExpense) {
      case (null) { Runtime.trap("Expense entry not found") };
      case (_) {
        expenses.remove(expenseId);
      };
    };
  };

  // Sales
  public shared ({ caller }) func createSale(date : Timestamp, cashAmount : Rupiah, onlineAmount : Rupiah, notes : Text) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let saleId = nextSaleId;
    nextSaleId += 1;
    let sale : SaleEntry = {
      id = saleId;
      date;
      cashAmount;
      onlineAmount;
      notes;
    };
    sales.add(saleId, sale);
    saleId;
  };

  public query ({ caller }) func getSale(saleId : Id) : async ?SaleEntry {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    sales.get(saleId);
  };

  public query ({ caller }) func getAllSales() : async [SaleEntry] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    sales.values().toArray();
  };

  public shared ({ caller }) func deleteSale(saleId : Id) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    let existingSale = sales.get(saleId);

    switch (existingSale) {
      case (null) { Runtime.trap("Sale entry not found") };
      case (_) {
        sales.remove(saleId);
      };
    };
  };

  // Profits
  public shared ({ caller }) func createProfitEntry(date : Timestamp, amount : Rupiah, notes : Text) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let profitEntryId = nextProfitId;
    nextProfitId += 1;
    let profit : ProfitEntry = {
      id = profitEntryId;
      date;
      amount;
      notes;
    };
    profits.add(profitEntryId, profit);
    profitEntryId;
  };

  public query ({ caller }) func getProfitEntry(profitId : Id) : async ?ProfitEntry {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    profits.get(profitId);
  };

  public query ({ caller }) func getAllProfits() : async [ProfitEntry] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    profits.values().toArray();
  };

  public shared ({ caller }) func deleteProfitEntry(profitId : Id) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    let existingProfit = profits.get(profitId);

    switch (existingProfit) {
      case (null) { Runtime.trap("Profit entry not found") };
      case (_) {
        profits.remove(profitId);
      };
    };
  };

  // Ledger
  public shared ({ caller }) func createLedgerEntry(
    dto : LedgerEntryDTO
  ) : async Id {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let ledgerEntryId = nextLedgerId;
    nextLedgerId += 1;
    let ledger : LedgerEntry = {
      id = ledgerEntryId;
      date = dto.date;
      amount = dto.amount;
      accountType = dto.accountType;
      description = dto.description;
      entryType = dto.entryType;
      createdBy = caller;
      createdAt = Time.now();
    };
    ledgers.add(ledgerEntryId, ledger);
    ledgerEntryId;
  };

  public query ({ caller }) func getLedgerEntry(ledgerId : Id) : async ?LedgerEntry {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    ledgers.get(ledgerId);
  };

  public query ({ caller }) func getAllLedgerEntries() : async [LedgerEntry] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    ledgers.values().toArray();
  };

  // Account Balances Calculation
  public query ({ caller }) func getAccountBalances() : async AccountBalances {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    let cashInCredits = sales.values().toArray().foldLeft(0, func(acc, sale) { acc + sale.cashAmount });

    let cashBookCredits = ledgers.values().toArray().foldLeft(0, func(acc, entry) {
      switch (entry.accountType, entry.entryType) {
        case (#cash, #credit) { acc + entry.amount };
        case (_) { acc };
      }
    });

    let cashCredits = cashInCredits + cashBookCredits;

    let cashBookDebits = ledgers.values().toArray().foldLeft(0, func(acc, entry) {
      switch (entry.accountType, entry.entryType) {
        case (#cash, #debit) { acc + entry.amount };
        case (_) { acc };
      }
    });

    let expensesDebits = expenses.values().toArray().foldLeft(0, func(acc, expense) {
      switch (expense.accountType) {
        case (#cash) { acc + expense.amount };
        case (#bank) { acc };
      }
    });

    let cashDebits = cashBookDebits + expensesDebits;

    let cashBalance = if (cashCredits >= cashDebits) { cashCredits - cashDebits } else { 0 };

    let bankInCredits = sales.values().toArray().foldLeft(0, func(acc, sale) { acc + sale.onlineAmount });

    let bankBookCredits = ledgers.values().toArray().foldLeft(0, func(acc, entry) {
      switch (entry.accountType, entry.entryType) {
        case (#bank, #credit) { acc + entry.amount };
        case (_) { acc };
      }
    });

    let bankCredits = bankInCredits + bankBookCredits;

    let bankBookDebits = ledgers.values().toArray().foldLeft(0, func(acc, entry) {
      switch (entry.accountType, entry.entryType) {
        case (#bank, #debit) { acc + entry.amount };
        case (_) { acc };
      }
    });

    let bankExpensesDebits = expenses.values().toArray().foldLeft(0, func(acc, expense) {
      switch (expense.accountType) {
        case (#bank) { acc + expense.amount };
        case (#cash) { acc };
      }
    });

    let bankDebits = bankBookDebits + bankExpensesDebits;

    let bankBalance = if (bankCredits >= bankDebits) { bankCredits - bankDebits } else { 0 };

    {
      cashBalance;
      bankBalance;
    };
  };

  public query ({ caller }) func getAllExpenseCategoriesWithExpenses() : async [(ExpenseCategory, [ExpenseEntry])] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    categories.values().toArray().map(
      func(category) {
        let categoryExpenses = expenses.values().toArray().filter(
          func(expense) {
            expense.categoryId == category.id
          }
        );
        (category, categoryExpenses);
      }
    );
  };
};
