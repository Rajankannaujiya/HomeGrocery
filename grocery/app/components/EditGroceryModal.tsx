
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, X, Upload, Loader, Save } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { GroceryItem } from "@/app/types/grocery";

interface EditModalProps {
  item: GroceryItem | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const EditGroceryModal = ({ item, onClose, onUpdateSuccess }: EditModalProps) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState<number | string>(0);
  const [image, setImage] = useState<File | null>(null);

  const categories = [
    "FRUITS_AND_VEGETABLES", "DAIRY_AND_EGGS", "RICE_ATTA_AND_GRAINS",
    "SNACKS_AND_BISCUITS", "SPICES_AND_MASALAS", "BEVERAGES_AND_DRINKS",
    "PERSONAL_CARE", "HOUSEHOLD_ESSENTIALS", "INSTANT_AND_PACKAGED_FOOD",
    "BABY_AND_PET_CARE",
  ];

  const units = ["KG", "G", "L", "ML", "PIECE", "PACK", "DOZEN", "BOX"];

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setPrice(item.price);
      setPreview(item.image);
    }
  }, [item]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", item?.id || "");
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price.toString());
      formData.append("unit", unit);
      if (image) formData.append("image", image);

      const response = await fetch("/api/admin/update-grocery", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Item updated successfully!");
        onUpdateSuccess();
        onClose();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-teal-100"
          >
            <div className="bg-teal-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pencil size={20} className="text-teal-200" />
                <h2 className="text-lg font-bold">Edit Product</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Grocery Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {preview && (
                    <Image src={preview} fill alt="Preview" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <label 
                    htmlFor="edit-image" 
                    className="flex items-center gap-2 text-sm font-bold text-teal-700 cursor-pointer hover:underline"
                  >
                    <Upload size={16} /> Change Image
                  </label>
                  <input 
                    type="file" 
                    id="edit-image" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                  <p className="text-xs text-teal-600/70 mt-1">PNG, JPG or WebP (Max 2MB)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  className="flex-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <><Save size={20}/> Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditGroceryModal;