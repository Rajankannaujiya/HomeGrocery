"use client";

import { ArrowRight, CheckCircle, Package } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
type Props = {};

function page({}: Props) {
  const dotArray = [
    { top: "10%", left: "15%", anim: "animate-bounce", delay: "0s" },
    { top: "12%", left: "20%", anim: "animate-pulse", delay: "0.2s" },
    { top: "20%", left: "10%", anim: "animate-bounce", delay: "0.4s" },
    { top: "32%", left: "30%", anim: "animate-pulse", delay: "0.1s" },
    { top: "24%", left: "50%", anim: "animate-bounce", delay: "0.6s" },
    { top: "18%", left: "70%", anim: "animate-pulse", delay: "0.3s" },
    { top: "25%", left: "40%", anim: "animate-bounce", delay: "0.5s" },
    { top: "10%", left: "60%", anim: "animate-pulse", delay: "0.2s" },
    { top: "38%", left: "80%", anim: "animate-bounce", delay: "0.7s" },
    { top: "15%", left: "90%", anim: "animate-pulse", delay: "0.4s" },
  ];
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-linear-to-b from-teal-50 to-white">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className="relative"
      >
        <CheckCircle className="text-teal-600 w-24 h-24 md:w-28 md:h-28" />

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.3, 0, 0.3], scale: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="w-full h-full rounded-full bg-teal-200 blur-2xl"></div>
        </motion.div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold text-teal-700 mt-6"
      >
        Order Place Successfully
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-gray-600 mt-3 text-sm md:text-base max-w-md"
      >
        Thank you for shopping with us! Your order has been placed and is being
        processed. You can track its progress in your
        <span className="font-semibold text-teal-700"> My Order</span> section
      </motion.p>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{
          y: [0, -10, 0],
          opacity: 1,
        }}
        transition={{
          opacity: { duration: 0.6, delay: 1 },

          y: {
            delay: 1,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="mt-10"
      >
        <Package className="w-16 h-16 md:w-20 md:h-20 text-teal-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-12"
      >
        <Link href={"/user/my-orders"}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
          >
            Go to My Orders Page
            <ArrowRight className="w-6 h-6" />
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {dotArray.map((dot, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-teal-600/90 rounded-full ${dot.anim}`}
                style={{
                  top: dot.top,
                  left: dot.left,
                  animationDelay: dot.delay,
                }}
              />
            ))}
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

export default page;
