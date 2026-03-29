import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Loader2, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllExpenseCategories,
  useAllTags,
  useCreateExpenseCategory,
  useCreateTag,
} from "../hooks/useQueries";

export default function SettingsPage() {
  const { data: categories = [], isLoading: catLoading } =
    useAllExpenseCategories();
  const { data: tags = [], isLoading: tagLoading } = useAllTags();
  const createCategory = useCreateExpenseCategory();
  const createTag = useCreateTag();

  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory.mutateAsync(newCatName.trim());
      toast.success("Category added");
      setNewCatName("");
    } catch {
      toast.error("Failed to add category");
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync(newTagName.trim());
      toast.success("Tag added");
      setNewTagName("");
    } catch {
      toast.error("Failed to add tag");
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-base font-bold text-foreground">Settings</h2>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Expense Categories
          </h3>
        </div>

        {catLoading ? (
          <div
            data-ocid="settings.categories.loading_state"
            className="space-y-2"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-2 mb-3"
            data-ocid="settings.categories.list"
          >
            {categories.map((cat, idx) => (
              <Badge
                key={cat.id.toString()}
                data-ocid={`settings.categories.item.${idx + 1}`}
                variant={cat.isDefault ? "default" : "secondary"}
                className="px-3 py-1.5 text-sm"
              >
                {cat.name}
                {cat.isDefault && (
                  <span className="ml-1 text-xs opacity-70">(default)</span>
                )}
              </Badge>
            ))}
            {categories.length === 0 && (
              <p
                data-ocid="settings.categories.empty_state"
                className="text-sm text-muted-foreground"
              >
                No categories yet.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <Input
            data-ocid="settings.category.input"
            placeholder="New category name"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1"
          />
          <Button
            data-ocid="settings.category.submit_button"
            type="submit"
            className="h-10 rounded-lg px-4 gap-1"
            disabled={createCategory.isPending || !newCatName.trim()}
          >
            {createCategory.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </Button>
        </form>
      </section>

      {/* Tags */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tags</h3>
        </div>

        {tagLoading ? (
          <div data-ocid="settings.tags.loading_state" className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-2 mb-3"
            data-ocid="settings.tags.list"
          >
            {tags.map((tag, idx) => (
              <Badge
                key={tag.id.toString()}
                data-ocid={`settings.tags.item.${idx + 1}`}
                variant="outline"
                className="px-3 py-1.5 text-sm border-primary text-primary"
              >
                # {tag.name}
              </Badge>
            ))}
            {tags.length === 0 && (
              <p
                data-ocid="settings.tags.empty_state"
                className="text-sm text-muted-foreground"
              >
                No tags yet.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleAddTag} className="flex gap-2">
          <Input
            data-ocid="settings.tag.input"
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1"
          />
          <Button
            data-ocid="settings.tag.submit_button"
            type="submit"
            className="h-10 rounded-lg px-4 gap-1"
            disabled={createTag.isPending || !newTagName.trim()}
          >
            {createTag.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </Button>
        </form>
      </section>

      {/* About */}
      <section className="bg-secondary rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          About BizBook
        </h3>
        <p className="text-xs text-muted-foreground">
          A comprehensive business accounting app for small businesses. Track
          sales, expenses, cash flow, and analyze your profits.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          All amounts in Indian Rupees (₹)
        </p>
      </section>

      <footer className="text-center py-2 text-xs text-muted-foreground">
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
