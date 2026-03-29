import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  useAccountBalances,
  useAllExpenses,
  useAllLedgerEntries,
  useAllProfits,
  useAllSales,
} from "../hooks/useQueries";
import { formatDate, formatRupees, isToday } from "../utils/formatters";

type Tab =
  | "dashboard"
  | "sales"
  | "expenses"
  | "cashbook"
  | "analytics"
  | "settings";

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: balances, isLoading: balLoading } = useAccountBalances();
  const { data: sales = [] } = useAllSales();
  const { data: expenses = [] } = useAllExpenses();
  const { data: profits = [] } = useAllProfits();
  const { data: ledgerEntries = [] } = useAllLedgerEntries();

  const todaySalesTotal = useMemo(() => {
    return sales
      .filter((s) => isToday(s.date))
      .reduce((sum, s) => sum + s.cashAmount + s.onlineAmount, 0n);
  }, [sales]);

  const todayExpensesTotal = useMemo(() => {
    return expenses
      .filter((e) => isToday(e.date))
      .reduce((sum, e) => sum + e.amount, 0n);
  }, [expenses]);

  type RecentItem = {
    date: bigint;
    label: string;
    amount: bigint;
    type: "credit" | "debit";
  };
  const recentItems = useMemo((): RecentItem[] => {
    const items: RecentItem[] = [
      ...sales.map((s) => ({
        date: s.date,
        label: "Sale (Cash+Online)",
        amount: s.cashAmount + s.onlineAmount,
        type: "credit" as const,
      })),
      ...expenses.map((e) => ({
        date: e.date,
        label: "Expense",
        amount: e.amount,
        type: "debit" as const,
      })),
      ...profits.map((p) => ({
        date: p.date,
        label: "Gross Profit",
        amount: p.amount,
        type: "credit" as const,
      })),
      ...ledgerEntries.map((l) => ({
        date: l.date,
        label: l.description,
        amount: l.amount,
        type:
          l.entryType === "credit" ? ("credit" as const) : ("debit" as const),
      })),
    ];
    return items.sort((a, b) => Number(b.date - a.date)).slice(0, 10);
  }, [sales, expenses, profits, ledgerEntries]);

  return (
    <div className="p-4 space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3" data-ocid="dashboard.section">
        <Card className="bg-sidebar text-sidebar-foreground border-0 shadow-card-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-4 h-4 opacity-70" />
              <span className="text-xs opacity-70 font-medium">
                Cash Balance
              </span>
            </div>
            {balLoading ? (
              <Skeleton className="h-7 w-24 bg-white/20" />
            ) : (
              <p className="text-xl font-bold">
                {formatRupees(balances?.cashBalance ?? 0n)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground border-0 shadow-card-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 opacity-70" />
              <span className="text-xs opacity-70 font-medium">
                Bank Balance
              </span>
            </div>
            {balLoading ? (
              <Skeleton className="h-7 w-24 bg-white/20" />
            ) : (
              <p className="text-xl font-bold">
                {formatRupees(balances?.bankBalance ?? 0n)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card className="border border-border shadow-card">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Today's Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-muted-foreground">Sales</span>
              </div>
              <p className="text-base font-bold text-foreground">
                {formatRupees(todaySalesTotal)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
              <p className="text-base font-bold text-foreground">
                {formatRupees(todayExpensesTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            data-ocid="dashboard.sale.primary_button"
            onClick={() => onNavigate("sales")}
            className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            + Add Sale
          </Button>
          <Button
            data-ocid="dashboard.expense.primary_button"
            onClick={() => onNavigate("expenses")}
            variant="outline"
            className="h-11 rounded-xl border-border font-semibold text-sm"
          >
            + Add Expense
          </Button>
          <Button
            data-ocid="dashboard.profit.secondary_button"
            onClick={() => onNavigate("sales")}
            variant="outline"
            className="h-11 rounded-xl border-border font-semibold text-sm"
          >
            + Profit Entry
          </Button>
          <Button
            data-ocid="dashboard.cashbook.secondary_button"
            onClick={() => onNavigate("cashbook")}
            variant="outline"
            className="h-11 rounded-xl border-border font-semibold text-sm"
          >
            + Cash Entry
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Recent Transactions
        </h3>
        {recentItems.length === 0 ? (
          <div
            data-ocid="dashboard.transactions.empty_state"
            className="text-center py-8 text-muted-foreground text-sm"
          >
            No transactions yet. Start by adding a sale or expense.
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item, idx) => (
              <div
                key={`${item.date}-${item.label}-${idx}`}
                data-ocid={`dashboard.transactions.item.${idx + 1}`}
                className="flex items-center justify-between p-3 bg-white border border-border rounded-xl shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === "credit" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {item.type === "credit" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    item.type === "credit" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.type === "credit" ? "+" : "-"}
                  {formatRupees(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
