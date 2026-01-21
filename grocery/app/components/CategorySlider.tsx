'use client'
import { Apple, Baby, Box, ChevronLeft, ChevronRight, Coffee, Cookie, Flame, Heart, Home, Milk, Wheat } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { selectCategroy } from "../redux/slices/categorySlice";
import { Category } from "../types/grocery";

const CategorySlider = () => {
    const categories = [
        { id: 1, name: "FRUITS_AND_VEGETABLES", icon: Apple, color: "bg-emerald-100" },
        { id: 2, name: "DAIRY_AND_EGGS", icon: Milk, color: "bg-yellow-100" },
        { id: 3, name: "RICE_ATTA_AND_GRAINS", icon: Wheat, color: "bg-orange-100" },
        { id: 4, name: "SNACKS_AND_BISCUITS", icon: Cookie, color: "bg-pink-100" },
        { id: 5, name: "SPICES_AND_MASALAS", icon: Flame, color: "bg-red-100" },
        { id: 6, name: "BEVERAGES_AND_DRINKS", icon: Coffee, color: "bg-blue-100" },
        { id: 7, name: "PERSONAL_CARE", icon: Heart, color: "bg-purple-100" },
        { id: 8, name: "HOUSEHOLD_ESSENTIALS", icon: Home, color: "bg-lime-100" },
        { id: 9, name: "INSTANT_AND_PACKAGED_FOOD", icon: Box, color: "bg-green-100" },
        { id: 10, name: "BABY_AND_PET_CARE", icon: Baby, color: "bg-rose-100" },
    ];

    const [showLeft, setShowLeft] = useState<Boolean>();
    const [showRight, setShowRight] = useState<Boolean>();
    const {selectedCategory} = useAppSelector(state=> state.category);
    const dispatch = useAppDispatch();

    const formatCategoryName = (name: string) => {
        return name
            .toLowerCase()
            .split('_')
            .map(word => {
                if (word === 'and') return '&';
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll  = (direction: "left" | "right")=>{
        if(!scrollRef.current) return;
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollRef.current.scrollBy({left:scrollAmount, behavior: "smooth"})
    }

    const checkScroll = ()=>{
        if(!scrollRef.current) return;
        const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current;
        setShowLeft(scrollLeft>0);
        setShowRight(scrollLeft + clientWidth <= scrollWidth-5);
    }

    useEffect(()=>{
        const autoScroll = setInterval(()=>{
            if(!scrollRef.current) return;
            const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current;
        if(scrollLeft + clientWidth > scrollWidth-5){
            scrollRef.current.scrollTo({left:0, behavior:"smooth"});
        }
        else{
            scrollRef.current.scrollBy({left:300, behavior: "smooth"})
        }
        },3000);

        return ()=>clearInterval(autoScroll)
    },[])

    useEffect(()=>{
        scrollRef.current?.addEventListener("scroll", checkScroll);
        checkScroll();
        return ()=>removeEventListener("scroll", checkScroll)
    },[])

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale:0.9 }}
            whileInView={{ opacity: 1, y: 0, scale:1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount:0.5 }}
            className=" relative w-full max-w-350 mx-auto mt-12 px-4"
        >
            <h1 className="text-2xl md:text-3xl font-bold text-teal-800 mb-8 text-center">
                Shop by Category
            </h1>

            {showLeft && <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-teal-100 rounded-full w-10 h-10 flex items-center cursor-pointer" onClick={()=>scroll("left")}><ChevronLeft className="w-6 h-6 text-teal-700"/></button>}

            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 px-2 scrollbar-hide scroll-smooth scrollbar-hide" ref={scrollRef}>
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <motion.div
                            key={cat.id}
                            whileHover={{ y: -5 }}
                            className={`group shrink-0 w-36 md:w-44 h-48 flex flex-col items-center justify-center rounded-3xl ${cat.color} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20`}
                            onClick={()=>dispatch(selectCategroy(cat.name as Category))}
                        >
                            <div className="flex flex-col items-center p-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white/60 rounded-full mb-4 group-hover:bg-white transition-colors duration-300 shadow-sm">
                                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-teal-700" />
                                </div>

                                <p className="text-center text-xs md:text-sm font-bold text-gray-800 leading-[1.2] px-1">
                                    {formatCategoryName(cat.name)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {showRight && <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-teal-100 rounded-full w-10 h-10 flex items-center cursor-pointer" onClick={()=>scroll("right")}><ChevronRight className="w-6 h-6 text-teal-700"/></button>}
        </motion.div>
    );
};

export default CategorySlider;