"use client";

import { ArrowLeft, Loader, PlusCircle, Upload } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

type Props = {};

const page = (props: Props) => {
  const categories = [
    "FRUITS_AND_VEGETABLES",
    "DAIRY_AND_EGGS",
    "RICE_ATTA_AND_GRAINS",
    "SNACKS_AND_BISCUITS",
    "SPICES_AND_MASALAS",
    "BEVERAGES_AND_DRINKS",
    "PERSONAL_CARE",
    "HOUSEHOLD_ESSENTIALS",
    "INSTANT_AND_PACKAGED_FOOD",
    "BABY_AND_PET_CARE",
  ];

  const units = ["KG", "G", "L", "ML", "PIECE", "PACK", "DOZEN", "BOX"];

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState("")
  const [price, setPrice] = useState<number | string>(0)
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null)
   const [preview, setPreview] = useState<string | null>(null)

   const handleImageChange = (e:ChangeEvent<HTMLInputElement>)=>{
    const files = e.target.files;
    if(!files || files.length === 0){
      return;
    }
    const file = files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
   }

  const handleSubmit = async (e:React.FormEvent) => {
  e.preventDefault(); 

  if (!name || !category || !price || !unit || !image) {
    toast.error("Please fill all required fields and upload an image");
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price.toString());
    formData.append("unit", unit);
    formData.append("image", image); 

    const response = await fetch("/api/admin/add-grocery", {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log(data)

    if (response.ok) {
      toast.success("Grocery added successfully!");
    } else {
      toast.error(data.message || "Failed to add grocery");
    }

  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Something went wrong during upload");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 to-white py-16 px-4 relative">
  <Link
    href={"/"}
    className="absolute top-6 left-6 flex items-center gap-2 text-teal-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-teal-100 hover:shadow-lg transition-all"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="hidden md:flex">Back to home</span>
  </Link>

  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-teal-100 p-8 md:p-12"
  >
    {/* Header Section */}
    <div className="flex flex-col items-center mb-10 text-center">
      <div className="flex items-center gap-3 bg-teal-50 px-5 py-2 rounded-full border border-teal-100">
        <PlusCircle className="text-teal-600 w-6 h-6" />
        <h1 className="font-bold text-xl text-gray-800">Add New Grocery</h1>
      </div>
      <p className="text-gray-500 text-sm mt-3">
        Enter the details below to list a new item in your inventory.
      </p>
    </div>

    <form className="space-y-6" onSubmit={handleSubmit}>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="name" className="text-gray-700 font-semibold">Grocery Name</label>
          <span className="text-red-500">*</span>
        </div>
        <input
          type="text"
          id="name"
          placeholder="eg: Fresh Milk, Organic Sweets"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 transition-all placeholder:text-gray-400"
          onChange={(e)=>setName(e.target.value)}
          value={name}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1 mb-2">
            <label htmlFor="category" className="text-gray-700 font-semibold">Category</label>
            <span className="text-red-500">*</span>
          </div>
          <select
            name="category"
            id="category"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 transition-all bg-white"
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label htmlFor="unit" className="text-gray-700 font-semibold">Unit</label>
            <span className="text-red-500">*</span>
          </div>
          <select
            name="unit"
            id="unit"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 transition-all bg-white"
            onChange={(e)=>setUnit(e.target.value)}
            value={unit}
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="price" className="text-gray-700 font-semibold">Price (₹)</label>
          <span className="text-red-500">*</span>
        </div>
        <input
          type="number"
          id="price"
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          onChange={(e)=>setPrice(e.target.value)}
          value={price}
        />
      </div>
      <div className="flex  flex-col sm:flex-row items-center gap-5">
        <div className="flex items-center gap-1 mb-2">
          <label htmlFor="image" className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border-teal-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto"><Upload className="w-5 h-5"/> Upload Image</label>
          <span className="text-red-500">*</span>
        </div>
        <input
          type="file"
          accept="image/*" 
          id="image"
          hidden
          onChange={handleImageChange}
        />

        {preview && <Image src={preview} width={100} height={100} alt="image" className="rounded-xl shadow-md border border-gray-200 object-cover"/>}
      </div>

      
      <motion.button 
      whileHover={{scale:1.06}}
      whileTap={{scale:0.9}}
      className="mt-4 w-full bg-linear-to-r from-teal-500 to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="w-5 h-5 animate-spin"/> : "Add Grocery"}
      </motion.button>
    </form>
  </motion.div>
</div>
  );
};

export default page;
