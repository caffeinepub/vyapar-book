import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Loader2,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AccountType,
  Variant_credit_debit,
  useAccountBalances,
  useAllLedgerEntries,
  useCreateLedgerEntry,
} from "../hooks/useQueries";
import {
  dateToTimestamp,
  formatDate,
  formatRupees,
  parseRupees,
  todayStr,
} from "../utils/formatters";

function AddLedgerSheet({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState("");
  const [account, setAccount] = useState<AccountType>(AccountType.cash);
  const [entryType, setEntryType] = useState<Variant_credit_debit>(
    Variant_credit_debit.credit,
  );
  const [amount, setAmount] = useState("");
  const createLedger = useCreateLedgerEntry();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description) {
      toast.error("Fill in all required fields");
      return;
    }
    try {
      await createLedger.mutateAsync({
        date: dateToTimestamp(date),
        description,
        accountType: account,
        entryType,
        amount: parseRupees(amount),
      });
      toast.success("Entry added");
      onClose();
    } catch {
      toast.error("Failed to add entry");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <Label htmlFor="led-date">Date</Label>
        <Input
          id="led-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="led-desc">Description</Label>
        <Input
          id="led-desc"
          data-ocid="cashbook.input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label>Account</Label>
        <div className="flex gap-2 mt-1">
          {([AccountType.cash, AccountType.bank] as AccountType[]).map(
            (acc) => (
              <button
                key={acc}
                type="button"
                data-ocid={`cashbook.${acc}.toggle`}
                onClick={() => setAccount(acc)}
                className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  account === acc
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-foreground border-border"
                }`}
              >
                {acc === AccountType.cash ? "Cash" : "Bank"}
              </button>
            ),
          )}
        </div>
      </div>
      <div>
        <Label>Type</Label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            data-ocid="cashbook.credit.toggle"
            onClick={() => setEntryType(Variant_credit_debit.credit)}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
              entryType === Variant_credit_debit.credit
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-foreground border-border"
            }`}
          >
            Credit (In)
          </button>
          <button
            type="button"
            data-ocid="cashbook.debit.toggle"
            onClick={() => setEntryType(Variant_credit_debit.debit)}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
              entryType === Variant_credit_debit.debit
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-foreground border-border"
            }`}
          >
            Debit (Out)
          </button>
        </div>
      </div>
      <div>
        <Label htmlFor="led-amount">Amount (₹)</Label>
        <Input
          id="led-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <Button
        data-ocid="cashbook.submit_button"
        type="submit"
        className="w-full h-11 rounded-xl"
        disabled={createLedger.isPending}
      >
        {createLedger.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Add Entry
      </Button>
    </form>
  );
}

export default function CashBook() {
  const { data: entries = [], isLoading } = useAllLedgerEntries();
  const { data: balances } = useAccountBalances();
  const [activeAccount, setActiveAccount] = useState<AccountType>(
    AccountType.cash,
  );
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      [...entries]
        .filter((e) => e.accountType === activeAccount)
        .sort((a, b) => Number(b.date - a.date)),
    [entries, activeAccount],
  );

  const balance =
    activeAccount === AccountType.cash
      ? (balances?.cashBalance ?? 0n)
      : (balances?.bankBalance ?? 0n);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Cash Book</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="cashbook.open_modal_button"
              size="sm"
              className="h-9 rounded-full px-4 gap-1"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Add Ledger Entry</SheetTitle>
            </SheetHeader>
            <AddLedgerSheet onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Account Sub-tabs */}
      <div className="flex gap-2 bg-secondary p-1 rounded-xl">
        <button
          type="button"
          data-ocid="cashbook.cash.tab"
          onClick={() => setActiveAccount(AccountType.cash)}
          className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-colors ${
            activeAccount === AccountType.cash
              ? "bg-white text-primary shadow-card"
              : "text-muted-foreground"
          }`}
        >
          <Banknote className="w-4 h-4" /> Cash Account
        </button>
        <button
          type="button"
          data-ocid="cashbook.bank.tab"
          onClick={() => setActiveAccount(AccountType.bank)}
          className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-colors ${
            activeAccount === AccountType.bank
              ? "bg-white text-primary shadow-card"
              : "text-muted-foreground"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Bank Account
        </button>
      </div>

      {/* Running Balance */}
      <div className="bg-sidebar text-sidebar-foreground rounded-xl p-4">
        <p className="text-xs opacity-70 mb-1">
          {activeAccount === AccountType.cash ? "Cash" : "Bank"} Balance
        </p>
        <p className="text-2xl font-bold">{formatRupees(balance)}</p>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div data-ocid="cashbook.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="cashbook.empty_state"
          className="text-center py-10 text-muted-foreground text-sm bg-secondary rounded-xl"
        >
          No entries in this account yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, idx) => (
            <div
              key={entry.id.toString()}
              data-ocid={`cashbook.item.${idx + 1}`}
              className="bg-white border border-border rounded-xl p-3 shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.entryType === Variant_credit_debit.credit
                      ? "bg-green-50"
                      : "bg-red-50"
                  }`}
                >
                  {entry.entryType === Variant_credit_debit.credit ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={`text-xs mb-0.5 ${
                    entry.entryType === Variant_credit_debit.credit
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-600 border-red-200"
                  }`}
                  variant="outline"
                >
                  {entry.entryType === Variant_credit_debit.credit
                    ? "Cr"
                    : "Dr"}
                </Badge>
                <p
                  className={`text-sm font-bold ${
                    entry.entryType === Variant_credit_debit.credit
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {formatRupees(entry.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
