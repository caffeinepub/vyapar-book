import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AccountType,
  useAllExpenseCategories,
  useAllExpenses,
  useAllTags,
  useCreateExpense,
  useCreateExpenseCategory,
  useCreateTag,
  useDeleteExpense,
} from "../hooks/useQueries";
import {
  dateToTimestamp,
  formatDate,
  formatRupees,
  parseRupees,
  todayStr,
} from "../utils/formatters";

function AddExpenseSheet({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [account, setAccount] = useState<AccountType>(AccountType.cash);
  const [selectedTags, setSelectedTags] = useState<bigint[]>([]);
  const [notes, setNotes] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);

  const { data: categories = [] } = useAllExpenseCategories();
  const { data: tags = [] } = useAllTags();
  const createExpense = useCreateExpense();
  const createCategory = useCreateExpenseCategory();
  const createTag = useCreateTag();

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      await createCategory.mutateAsync(newCatName.trim());
      toast.success("Category created");
      setNewCatName("");
      setShowNewCat(false);
    } catch {
      toast.error("Failed to create category");
    }
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync(newTagName.trim());
      toast.success("Tag created");
      setNewTagName("");
      setShowNewTag(false);
    } catch {
      toast.error("Failed to create tag");
    }
  }

  function toggleTag(id: bigint) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !categoryId) {
      toast.error("Fill in amount and category");
      return;
    }
    try {
      await createExpense.mutateAsync({
        date: dateToTimestamp(date),
        amount: parseRupees(amount),
        categoryId: BigInt(categoryId),
        accountType: account,
        tagIds: selectedTags,
        notes,
      });
      toast.success("Expense added");
      onClose();
    } catch {
      toast.error("Failed to add expense");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <Label htmlFor="exp-date">Date</Label>
        <Input
          id="exp-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select
          value={categoryId}
          onValueChange={(val) => {
            setCategoryId(val);
            if (val === "__new__") setShowNewCat(true);
          }}
        >
          <SelectTrigger data-ocid="expense.select" className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
            <SelectItem value="__new__">+ New Category</SelectItem>
          </SelectContent>
        </Select>
        {(categoryId === "__new__" || showNewCat) && (
          <div className="flex gap-2 mt-2">
            <Input
              data-ocid="expense.category.input"
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddCategory}
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="exp-amount">Amount (₹)</Label>
        <Input
          id="exp-amount"
          data-ocid="expense.input"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label>Debit From Account</Label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            data-ocid="expense.cash.toggle"
            onClick={() => setAccount(AccountType.cash)}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
              account === AccountType.cash
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border"
            }`}
          >
            Cash
          </button>
          <button
            type="button"
            data-ocid="expense.bank.toggle"
            onClick={() => setAccount(AccountType.bank)}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
              account === AccountType.bank
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border"
            }`}
          >
            Bank
          </button>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <button
              key={tag.id.toString()}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedTags.includes(tag.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border"
              }`}
            >
              {tag.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowNewTag(true)}
            className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-primary text-primary"
          >
            + New Tag
          </button>
        </div>
        {showNewTag && (
          <div className="flex gap-2 mt-2">
            <Input
              data-ocid="expense.tag.input"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddTag}
              disabled={createTag.isPending}
            >
              {createTag.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="exp-notes">Notes</Label>
        <Textarea
          id="exp-notes"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <Button
        data-ocid="expense.submit_button"
        type="submit"
        className="w-full h-11 rounded-xl"
        disabled={createExpense.isPending}
      >
        {createExpense.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Add Expense
      </Button>
    </form>
  );
}

export default function Expenses() {
  const { data: expenses = [], isLoading } = useAllExpenses();
  const { data: categories = [] } = useAllExpenseCategories();
  const deleteExpense = useDeleteExpense();
  const [open, setOpen] = useState(false);

  const sortedExpenses = [...expenses].sort((a, b) => Number(b.date - a.date));

  function getCategoryName(id: bigint): string {
    return categories.find((c) => c.id === id)?.name ?? "Unknown";
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Expenses</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="expense.open_modal_button"
              size="sm"
              className="h-9 rounded-full px-4 gap-1"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[90vh] overflow-y-auto"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Add Expense</SheetTitle>
            </SheetHeader>
            <AddExpenseSheet onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div data-ocid="expense.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : sortedExpenses.length === 0 ? (
        <div
          data-ocid="expense.empty_state"
          className="text-center py-10 text-muted-foreground text-sm bg-secondary rounded-xl"
        >
          No expenses recorded yet.
        </div>
      ) : (
        <div className="space-y-2" data-ocid="expense.list">
          {sortedExpenses.map((exp, idx) => (
            <div
              key={exp.id.toString()}
              data-ocid={`expense.item.${idx + 1}`}
              className="bg-white border border-border rounded-xl p-3 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(exp.date)}
                    </span>
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {getCategoryName(exp.categoryId)}
                    </Badge>
                    <Badge
                      className={`text-xs px-2 py-0 ${
                        exp.accountType === AccountType.cash
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                      variant="outline"
                    >
                      {exp.accountType === AccountType.cash ? "Cash" : "Bank"}
                    </Badge>
                  </div>
                  <p className="text-base font-bold text-red-500">
                    {formatRupees(exp.amount)}
                  </p>
                  {exp.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exp.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  data-ocid={`expense.delete_button.${idx + 1}`}
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
