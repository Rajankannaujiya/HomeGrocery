"use client"
import { ArrowRight, Bike, ShoppingBasket } from "lucide-react"
import { motion } from "motion/react"

type PropsType = {
  nextStep:(n:number)=>void
}

const Welcome = ({nextStep}: PropsType) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <motion.div
        initial={{ opacity: 0, y:-10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:1, delay:0.3 }} className="flex items-center gap-3">
            <ShoppingBasket className="w-10 h-10 text-teal-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-teal-700">HomeGrocery</h1>
        </motion.div>
        <motion.p
        initial={{ opacity: 0, y:10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:1, delay:0.3 }} className="mt-4 text-gray-700 text-lg md:text-xl max-w-g">
            Fresh groceries delivered to your doorstep in minutes — fast, reliable, and affordable.
        </motion.p>

      <motion.div
        initial={{ opacity: 0, scale:0.9 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:1, delay:0.3 }} className="flex items-center gap-3 drop-shadow-md">
            <ShoppingBasket className="w-24 h-24 md:w-32 md:h-32 text-teal-700 font-extrabold" />
            <Bike className="w-24 h-24 md:w-32 md:h-32 font-extrabold text-orange-700 drop-shadow-md"/>
        </motion.div>
        
        <motion.button
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:1, delay:0.3 }} className="inline-flex items-center gap-1 md:gap-2 bg-teal-600 hover:bg-teal-700 font-semibold text-white rounded-2xl shadow-md transition-all duration-100 py-3 px-8 cursor-pointer mt-4"
        onClick={()=>nextStep(2)}
        >
          <span className="">Next</span>
          <ArrowRight />
        </motion.button>

    </div>
  )
}

export default Welcome