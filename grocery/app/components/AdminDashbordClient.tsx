"use client"
import { IndianRupee, Package, Truck, User } from "lucide-react"
import {motion} from "motion/react"
import { useState } from "react"
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


type Props = {
    earning: {
        today: number;
        sevenDays: number;
        totalRevenue: number;
    },
    stats: {
    title: string;
    value: number;
}[],

chartData: {
    day: string;
    orders: number
}[]
}


const AdminDashbordClient = ({earning, stats, chartData}: Props) => {

    const [filter, setFilter] = useState<"today" | "sevenDays" | "total">("today");
    const currentEarning = filter=== "today" ? earning.today : filter==="sevenDays" ? earning.sevenDays : earning.totalRevenue;

    const title =  filter=== "today" ? "Today's Earning" : filter==="sevenDays" ? "Last 7 Days Earning" : "Total Earning";



  return (
    <div className='pt-28 w-[98%] md:w-[80%] mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 text-center sm:text-left'>
            <motion.h1
            initial={{opacity:0, y:20}}
            animate={{opacity:1, y:0}}
            transition={{duration: 0.5}}
            className="text-3xl md:text-4xl font-bold text-teal-700"
            >
                🛍️ Admin Dashboard
            </motion.h1>

            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition w-full sm:w-auto" value={filter } onChange={(e)=>setFilter(e.target.value as any)}>
                <option value="sevenDays">Last 7 Days</option>
                <option value="today">Today</option>
                <option value="total">total</option>
            </select>
        </div>

        <motion.div
        initial={{opacity:0, y:15}}
        animate={{opacity:1, y:0}}
        transition={{duration: 0.3}}
        className="bg-teal-50 border border-teal-200 shadow-sm rounded-2xl p-6 text-center mb-10"
        >
            <h2 className="text-lg font-semibold text-teal-700 mb-2">{title}</h2>
            <p className="text-4xl font-semibold text-teal-800">₹{currentEarning.toLocaleString()}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((s,i)=>{
                const icon = [
                    <Package key={"p"} className="text-teal-700 w-6 h-6"/>,
                    <User key={"u"} className="text-teal-700 w-6 h-6"/>,
                    <Truck key={"t"} className="text-teal-700 w-6 h-6"/>,
                    <IndianRupee key={"r"} className="text-teal-700 w-6 h-6"/>,
                ]
                return <motion.div
                    key={i}
                    initial={{opacity:0, y:20}}
                    animate={{opacity:1, y:0}}
                    transition={{delay:i*0.1}}
                    className="bg-white border border-gray-100 shadow-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all"
                >   

                <div className="bg-teal-100 p-3 rounded-xl">
                    {icon[i]}
                </div>
                <div className="gap-2">
                    <p className="text-gray-600 text-sm">{s.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                </div>
                    
                </motion.div>
})}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 mb-10">
            <h2 className="text-lg font-semi    bold text-gray-700 mb-4">📊 Order Overview (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                          <XAxis dataKey="day" />
                          <YAxis />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <Bar dataKey="orders" fill="teal" barSize={30} radius={[6,6,0,0]} />

                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}

export default AdminDashbordClient