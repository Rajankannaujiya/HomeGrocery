"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bike, Loader, User, UserCog } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

type Props = {};

export const EditRoleMobile = (props: Props) => {
  const [roles, setRoles] = useState([
    { id: "ADMIN", label: "Admin", icon: UserCog },
    { id: "USER", label: "User", icon: User },
    { id: "DELIVERY_BOY", label: "Delivery", icon: Bike },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("User");

  const [mobile, setMobile] = useState("");
  const router = useRouter();

  const session = useSession();
  const {update} = session;

useEffect(()=>{
  const checkForAdmin = async()=>{
    try {
      const response = await fetch("/api/check-for-admin");

      const data = await response.json();
      if(!response.ok){
        toast.error(`${data.message}`)
        return;
      }
      if(data.adminExists && data.user.mobile){
        setRoles(prev=> prev.filter(r=>r.id !== "ADMIN"))
      }
    } catch (error) { 
      console.log("error in checking admin", error)
    }
  }
  checkForAdmin();
},[])
  const handleEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/edit-role-mobile", {
        method: "POST",
        body: JSON.stringify({ role: selectedRole, mobile }),
      });
      await update({role: selectedRole})
      if (!response.ok) {
        toast.error("something went wrong");
      }
      setLoading(false);
      toast.success("successfully");
      router.push("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(`server error ${error}`);
    }
  };
  return (
    <div className="flex items-center flex-col min-h-screen w-full p-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md-text-4xl font-extrabold text-teal-700 text-center mt-8"
      >
        Select your role
      </motion.h1>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <motion.div
              key={role.id}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col justify-center items-center w-48 h-44 rounded-2xl border-2 transition-all ${
                isSelected
                  ? "border-teal-600 bg-teal-100 shadow-lg"
                  : "border-gray-300 bg-white hover:border-teal-400"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <Icon />
              <span>{role.label}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex flex-col items-center mt-10"
      >
        <label htmlFor="mobile" className="text-gray-700 font-medium mb-2">
          Enter your mobile No.
        </label>
        <input
          type="tel"
          id="mobile"
          className="w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-800"
          placeholder="eg. 0000000000"
          onChange={(e) => setMobile(e.target.value)}
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        disabled={mobile.length !== 10 || !selectedRole}
        className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl w-50shadow-md transition-all duration-200 mt-10 ${
          selectedRole && mobile.length === 10
            ? " bg-teal-600 hover:bg-teal-700 text-white "
            : " bg-gray-300 text-gray-500 cursor-not-allowed "
        }`}
        onClick={handleEdit}
      >
        {loading ? "loading..." : "Go to Home"}
      </motion.button>
    </div>
  );
};
