import { getAllGroceries } from "../actions/grocery";
import { getAllOrders } from "../actions/order"
import { getAllUser } from "../actions/user";
import AdminDashbordClient from "./AdminDashbordClient"

const AdminDashboard = async() => {

  const orders = await getAllOrders();
  const users = await getAllUser();
  const groceries = await getAllGroceries();

  const totalOrders = orders?.length;
  const totalCustomers = users?.length;
  const pendingDeliveries = orders?.filter((o)=>o.status === "PENDING").length;
  const totalRevenue = orders?.reduce((sum, o)=>sum + Number(o.totalAmount || 0), 0)

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0,0,0,0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate()-6);

  const todaysOrder = orders?.filter((o)=>new Date(o.createdAt) >=startOfToday)
  const todaysRevenue = todaysOrder?.reduce((sum, o)=>sum + Number(o.totalAmount || 0), 0)

  const sevenDaysOrder = orders?.filter((o)=>new Date(o.createdAt) >=sevenDaysAgo)
  const sevenDaysRevenue = sevenDaysOrder?.reduce((sum, o)=>sum + Number(o.totalAmount || 0), 0)

    const stats = [
    { title: "Total Orders", value: totalOrders ?? 0 },
    { title: "Total Customers", value: totalCustomers ?? 0 },
    { title: "Pending Deliveries", value: pendingDeliveries ?? 0 },
    { title: "Total Revenue", value: totalRevenue ?? 0 },
];

if (
    totalOrders === undefined ||
    totalCustomers === undefined ||
    pendingDeliveries === undefined ||
    totalRevenue === undefined ||
    todaysRevenue === undefined ||
    sevenDaysRevenue === undefined
  ) {
    return null;
  }

    const chartData = [

    ]

    for(let i=6; i >= 0; i--){
      const date = new Date();
      date.setDate(date.getDate()- i);
      date.setHours(0,0,0,0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate()+1);

      const ordersCount = orders?.filter((o)=>new Date(o.createdAt) >= date && new Date(o.createdAt) <nextDay);

      chartData.push({
        day: date.toLocaleDateString("en-Us", {weekday: "short"}),
        orders: ordersCount? ordersCount.length : 0
      })

    }



  return (
    <>
    <AdminDashbordClient 
      earning= {{
        today: todaysRevenue,
        sevenDays: sevenDaysRevenue,
        totalRevenue: totalRevenue
      }}

      stats={stats}
      chartData = {chartData}
    />
    </>
  )
}

export default AdminDashboard