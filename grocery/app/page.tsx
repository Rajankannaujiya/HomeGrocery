import { auth } from "@/auth";
import { getUser } from "./actions/user";
import { redirect } from "next/navigation";
import { EditRoleMobile } from "./components/EditRoleMobile";
import Navbar from "./components/Navbar";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import GeoUpdate from "./components/GeoUpdate";
import DeliveryBoy from "./components/DeliveryBoy";
import { getAllGroceries } from "./actions/grocery";
import Footer from "./components/Footer";
import CartInitializer from "./components/CartInitializer";

export default async function Home(props: { searchParams: Promise<{ filter?: string }> }) {

  const { filter } = await props.searchParams;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await getUser(session);
  if (!user) {
    redirect("/login");
  }

  if (user.mobile === null ||  !user.mobile || !user.role) {
    return <EditRoleMobile />;
  }

  let groceries = await getAllGroceries();

  if (user.role === "USER" && filter && groceries) {
    const searchTerm = filter.toLowerCase();
    groceries = groceries.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm);
      const matchesCategory = item.category?.toLowerCase().includes(searchTerm);
      const matchesPrice = item.price?.toString().includes(searchTerm);
      
      return matchesName || matchesCategory || matchesPrice;
    });
  }

  return (
    <>
      <Navbar user={user} />
      <GeoUpdate />
      {user.role === "USER" && <CartInitializer />}
      <main className="container mx-auto">
        {user.role === "USER" ? (
          <UserDashboard groceries={groceries || []} />
        ) : user.role === "ADMIN" ? (
          <AdminDashboard />
        ) : (
          <DeliveryBoy />
        )}
      </main>
      <Footer />
    </>
  );
}