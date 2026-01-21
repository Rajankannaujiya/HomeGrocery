"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Package,
  Pencil,
  Search,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GroceryItem, Unit } from "@/app/types/grocery";
import Image from "next/image";
import EditGroceryModal from "@/app/components/EditGroceryModal";

function Page() {
  const router = useRouter();
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<GroceryItem | null>(null);

  const formatCategoryName = (name: string) => {
    return name
      .toLowerCase()
      .split("_")
      .map((word) =>
        word === "and" ? "&" : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");
  };

  const units = ["KG", "G", "L", "ML", "PIECE", "PACK", "DOZEN", "BOX"];

  const getAllGroceries = async () => {
    try {
      const response = await fetch("/api/admin/get-groceries");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setGroceries(data.groceries);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch groceries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllGroceries();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/delete-grocery?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Item deleted successfully");
        setGroceries((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  const filteredGroceries = useMemo(() => {
    return groceries.filter(
      (g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, groceries]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-4 pb-20">
      <div className="w-[95%] md:w-[85%] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-teal-600 rounded-xl transition-all hover:shadow-md"
              onClick={() => router.push("/")}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-teal-800">
                <Package size={18} /> Manage Groceries
              </h1>
              <p className="text-gray-500 text-sm">
                {groceries.length} items total
              </p>
            </div>
          </div>

          <button
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm w-full sm:w-auto justify-center"
            onClick={() => router.push("/admin/add-grocery")}
          >
            <Plus size={18} /> Add New Item
          </button>
        </motion.div>
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Fetching your inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredGroceries.map((g) => (
                <motion.div
                  key={g.id || g.name}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-5 p-4 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all"
                >
                  <div className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={g.image}
                      alt={g.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between w-full h-full py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate max-w-50 md:max-w-sm">
                          {g.name}
                        </h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                          {formatCategoryName(g.category)}
                        </span>
                      </div>
                      <p className="text-teal-700 font-black text-xl">
                        ₹{g.price}
                        <span className="text-gray-600 text-xs font-medium lowercase">
                          /{g.unit}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-50 pt-3">
                      <button
                        className="flex-1 sm:flex-none bg-teal-50 text-teal-700 px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-600 hover:text-white transition-all"
                        onClick={() => setEditing(g)}
                      >
                        <Pencil size={16} /> Edit Details
                      </button>

                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {!loading && filteredGroceries.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              No groceries found
            </h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      <EditGroceryModal
        item={editing}
        onClose={() => setEditing(null)}
        onUpdateSuccess={getAllGroceries}
      />
    </div>
  );
}

export default Page;
