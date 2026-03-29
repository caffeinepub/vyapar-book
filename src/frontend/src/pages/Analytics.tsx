import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAllExpenseCategories,
  useAllExpenses,
  useAllProfits,
  useAllSales,
} from "../hooks/useQueries";
import { formatRupees } from "../utils/formatters";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const COLORS = [
  "#0F7A86",
  "#2DB6C4",
  "#0B3A48",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#10B981",
  "#F97316",
];

const STOCK_PURCHASE = "Stock Purchase";

export default function Analytics() {
  const [filterMode, setFilterMode] = useState<"monthly" | "range">("monthly");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: expenses = [], isLoading: expLoading } = useAllExpenses();
  const { data: sales = [], isLoading: salLoading } = useAllSales();
  const { data: profits = [], isLoading: profLoading } = useAllProfits();
  const { data: categories = [] } = useAllExpenseCategories();

  const isLoading = expLoading || salLoading || profLoading;

  const dateInRange = useCallback(
    (ts: bigint): boolean => {
      const d = new Date(Number(ts));
      if (filterMode === "monthly") {
        return (
          d.getFullYear() === Number.parseInt(year) &&
          d.getMonth() + 1 === Number.parseInt(month)
        );
      }
      const from = fromDate ? new Date(fromDate).getTime() : 0;
      const to = toDate
        ? new Date(toDate).getTime() + 86400000
        : Number.POSITIVE_INFINITY;
      return Number(ts) >= from && Number(ts) <= to;
    },
    [filterMode, year, month, fromDate, toDate],
  );

  const filteredSales = useMemo(
    () => sales.filter((s) => dateInRange(s.date)),
    [sales, dateInRange],
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((e) => dateInRange(e.date)),
    [expenses, dateInRange],
  );
  const filteredProfits = useMemo(
    () => profits.filter((p) => dateInRange(p.date)),
    [profits, dateInRange],
  );

  const totalSales = filteredSales.reduce(
    (s, x) => s + x.cashAmount + x.onlineAmount,
    0n,
  );
  const totalGrossProfit = filteredProfits.reduce((s, x) => s + x.amount, 0n);
  const totalExpenses = filteredExpenses.reduce((s, x) => s + x.amount, 0n);

  const stockCategoryId = categories.find((c) => c.name === STOCK_PURCHASE)?.id;
  const expensesExclStock = filteredExpenses
    .filter((e) => e.categoryId !== stockCategoryId)
    .reduce((s, x) => s + x.amount, 0n);

  const netProfitLoss = totalGrossProfit - expensesExclStock;

  // Category-wise expenses
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filteredExpenses) {
      const catName =
        categories.find((c) => c.id === e.categoryId)?.name ?? "Unknown";
      map[catName] = (map[catName] ?? 0) + Number(e.amount) / 100;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories]);

  // Monthly trend for selected year
  const monthlyTrend = useMemo(() => {
    const yearInt = Number.parseInt(year);
    return MONTHS.map((monthName, mi) => {
      const monthSales = sales.filter((s) => {
        const d = new Date(Number(s.date));
        return d.getFullYear() === yearInt && d.getMonth() === mi;
      });
      const monthProfits = profits.filter((p) => {
        const d = new Date(Number(p.date));
        return d.getFullYear() === yearInt && d.getMonth() === mi;
      });
      const monthExpenses = expenses.filter((e) => {
        const d = new Date(Number(e.date));
        return (
          d.getFullYear() === yearInt &&
          d.getMonth() === mi &&
          e.categoryId !== stockCategoryId
        );
      });
      const gp = monthProfits.reduce((s, p) => s + Number(p.amount), 0);
      const exp = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
      return {
        month: monthName,
        sales:
          monthSales.reduce(
            (s, x) => s + Number(x.cashAmount + x.onlineAmount),
            0,
          ) / 100,
        profit: (gp - exp) / 100,
      };
    });
  }, [sales, profits, expenses, year, stockCategoryId]);

  const yearOptions = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString(),
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-bold text-foreground">Analytics</h2>

      {/* Filter Bar */}
      <Card className="border shadow-card">
        <CardContent className="p-3 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="analytics.monthly.toggle"
              onClick={() => setFilterMode("monthly")}
              className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-colors ${
                filterMode === "monthly"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-foreground border-border"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              data-ocid="analytics.range.toggle"
              onClick={() => setFilterMode("range")}
              className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-colors ${
                filterMode === "range"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-foreground border-border"
              }`}
            >
              Date Range
            </button>
          </div>

          {filterMode === "monthly" ? (
            <div className="flex gap-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger
                  data-ocid="analytics.year.select"
                  className="flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger
                  data-ocid="analytics.month.select"
                  className="flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">From</Label>
                <Input
                  data-ocid="analytics.from.input"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-0.5"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">To</Label>
                <Input
                  data-ocid="analytics.to.input"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-0.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div data-ocid="analytics.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* P&L Summary */}
          <Card className="border shadow-card">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold">
                Profit & Loss Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Total Sales
                </span>
                <span className="text-sm font-semibold">
                  {formatRupees(totalSales)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Total Gross Profit
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {formatRupees(totalGrossProfit)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Total Expenses
                </span>
                <span className="text-sm font-semibold text-red-500">
                  {formatRupees(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Expenses (excl. Stock)
                </span>
                <span className="text-sm font-semibold text-red-500">
                  {formatRupees(expensesExclStock)}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 rounded-lg px-2 mt-1 ${
                  netProfitLoss >= 0n ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <span className="text-sm font-bold">
                  Net {netProfitLoss >= 0n ? "Profit" : "Loss"}
                </span>
                <span
                  className={`text-base font-bold ${
                    netProfitLoss >= 0n ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {netProfitLoss >= 0n ? "" : "-"}
                  {formatRupees(
                    netProfitLoss >= 0n ? netProfitLoss : -netProfitLoss,
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Expense by Category */}
          {categoryData.length > 0 && (
            <Card className="border shadow-card">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold">
                  Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      fontSize={10}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={categoryData[index].name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`₹${v.toFixed(2)}`, "Amount"]}
                    />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Monthly Trend */}
          <Card className="border shadow-card">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold">
                Monthly Trend ({year})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={monthlyTrend}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toFixed(0)}`, ""]}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#0F7A86"
                    name="Sales"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Net P/L"
                    radius={[3, 3, 0, 0]}
                    fill="#10B981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
