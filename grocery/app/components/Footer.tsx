"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { MapPin, Phone, Mail, X, Share, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function Footer() {
  const { data: session, status } = useSession();
  const [currentYear, setCurrentYear] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  if (!mounted || status === "loading") {
    return <div className="h-20" />; 
  }

  if (!session?.user) return null;

  const user = session.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-linear-to-r from-teal-600 to-teal-700 text-white mt-20 w-full mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] items-center"
    >
      <div className="w-full px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-teal-500/40 justify-items-center items-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold mb-3">HomeGrocery</h2>
          <p className="text-sm text-teal-100 leading-relaxed md:pl-10 xl:pl-30">
            Your one-stop online grocery store delivering freshness to your doorstep. 
            Shop Smart, eat fresh and save more every day!
          </p>
        </div>

        <div className="p-1">
          <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-teal-100 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </li>
            <li>
              {user.role === "USER" && <Link href="/user/cart" className="hover:text-white transition">Cart</Link>}
              {user.role === "ADMIN" && <Link href="/admin/view-grocery" className="hover:text-white transition">View Grocery</Link>}
            </li>
            <li>
              {user.role === "USER" && <Link href="/user/my-orders" className="hover:text-white transition">My Orders</Link>}
              {user.role === "ADMIN" && <Link href="/admin/manage-orders" className="hover:text-white transition">Manage Orders</Link>}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-teal-100 text-sm">
            <li className="flex items-center gap-2"><MapPin size={16} /> Mumbai, India</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 0000000000</li>
            <li className="flex items-center gap-2"><Mail size={16} /> support@homegrocery.in</li>
          </ul>

          <div className="flex gap-4 mt-6">
            <Link href="https://facebook.com" target="_blank" className="hover:text-white text-teal-100 transition"><Share className="w-5 h-5" /></Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-white text-teal-100 transition"><Camera className="w-5 h-5" /></Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-white text-teal-100 transition"><X className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>

      <div className="py-6 text-center text-sm text-teal-200/70">
         © {currentYear || "2026"} HomeGrocery. All rights reserved.
      </div>
    </motion.div>
  );
}

export default Footer;