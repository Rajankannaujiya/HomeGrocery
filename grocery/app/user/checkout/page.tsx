"use client";
import { useAppSelector } from "@/app/redux/hook";
import {
  Home,
  MapPin,
  Navigation,
  Phone,
  Search,
  User,
  ArrowLeft,
  LocateFixed,
  Loader,
  CreditCard,
  CreditCardIcon,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import Script from "next/script";
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}
const MapView = dynamic(() => import("@/app/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

const Page = () => {
  const router = useRouter();
  const { userData } = useAppSelector((state) => state.user);
  const { cartData, subTotal, deliveryFee, finalTotal } = useAppSelector(
    (state) => state.cart
  );

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  const [isPaying, setIsPaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");

  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.name || "",
        mobile: userData.mobile || "",
      }));
    }
  }, [userData]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("location error", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      setMapLoading(true);
      try {
        const response = await fetch(
          `/api/geocode?lat=${position[0]}&lon=${position[1]}`
        );

        if (!response.ok) {
          setMapLoading(false);
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setMapLoading(false);

        setAddress((prev) => ({
          ...prev,
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          state: data.address.state || "",
          pincode: data.address.postcode || "",
          fullAddress: data.display_name || "",
        }));
      } catch (error) {
        setMapLoading(false);
        console.log(`Error: ${error}`);
      }
    };

    const timer = setTimeout(fetchAddress, 800); // Debounce
    return () => clearTimeout(timer);
  }, [position]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearchResults([]);
    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(searchQuery)}`
      );
      const data: NominatimResult[] = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        setSearchLoading(false);
      } else {
        setSearchLoading(false);
        toast.error(
          "Location not found in India. Please try a different name."
        );
      }
    } catch (error) {
      setSearchLoading(false);
      console.error("Search failed:", error);
    }
  };

  const handleCod = async () => {
    if (!position) return null;
    try {
      const response = await fetch("/api/user/order", {
        method: "POST",
        body: JSON.stringify({
          userId: userData?.id,
          items: cartData.map((item) => ({
            groceryId: item.id,
            name: item.name,
            price: item.price.toString(),
            unit: item.unit,
            image: item.image,
            quantity: item.quantity,
          })),
          totalAmount: finalTotal.toString(),
          address: {
            fullName: address.fullName,
            mobile: address.mobile,
            city: address.city,
            state: address.state,
            fullAddress: address.fullAddress,
            pincode: address.pincode,
            latitude: position[0],
            longitude: position[1],
          },
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(`something went wrong ${data}`);
        return;
      }
      
      router.push("/user/order-success");
    } catch (error) {
      console.log(`error in placing order COD ${error}`);
    }
  };

  const handleOnlineOrder = async () => {
    if(!position) return null
  try {
    const response = await fetch("/api/user/razorpay", {
        method: "POST",
        body: JSON.stringify({
          userId: userData?.id,
          items: cartData.map((item) => ({
            groceryId: item.id,
            name: item.name,
            price: item.price.toString(),
            unit: item.unit,
            image: item.image,
            quantity: item.quantity,
          })),
          totalAmount: finalTotal.toString(),
          address: {
            fullName: address.fullName,
            mobile: address.mobile,
            city: address.city,
            state: address.state,
            fullAddress: address.fullAddress,
            pincode: address.pincode,
            latitude: position[0],
            longitude: position[1],
          },
          paymentMethod,
        }),
      });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Failed to initiate payment");
      return;
    }

    console.log("the response data",data)

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount, 
      currency: "INR",
      name: "HomeGrocery",
      description: "Order Payment",
      order_id: data.orderId,
      handler: async function (response: any) {
        await verifyPayment(response);
      },
      prefill: {
        name: address.fullName,
        contact: address.mobile,
      },
      theme: {
        color: "#0d9488",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Payment Error:", error);
    toast.error("Could not reach payment gateway");
  }
};

const verifyPayment = async (razorpayResponse: any) => {

  try {
    const res = await fetch("/api/user/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      }),
    });

    if (res.ok) {
      toast.success("Payment Successful!");
      router.push("/user/order-success");
    } else {
      toast.error("Payment verification failed.");
    }
  } catch (err) {
    console.log("Verification error", err);
  }
};


  const handleCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("location error", err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="w-[92%] max-w-7xl mx-auto mt-4 mg-6 py-5">
      <Script 
      src="https://checkout.razorpay.com/v1/checkout.js" 
      strategy="lazyOnload"  />
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-teal-700 hover:underline"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold  mb-8 sm:text-3xl md:text-4xl  text-teal-700 text-center"
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm p-5 md:p-8 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="text-teal-700" /> Delivery Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={address.fullName}
                  className="pl-10 w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  onChange={(e) =>
  setAddress((prev) => ({
    ...prev,
    fullName: e.target.value
  }))
}
                />
              </div>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  value={address.mobile}
                  className="pl-10 w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  onChange={(e) =>
  setAddress((prev) => ({
    ...prev,
    mobile: e.target.value
  }))
}
                />
              </div>
            </div>

            <div className="relative">
              <Home
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
              <textarea
                rows={2}
                placeholder="Complete Address"
                value={address.fullAddress}
                className="pl-10 w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                onChange={(e) =>
                  setAddress({ ...address, fullAddress: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none"
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="State"
                value={address.state}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none"
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none"
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search city, area or locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />

                {searchResults.length > 0 && (
                  <div className="absolute z-9999 w-full bg-white mt-2 rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const lat = parseFloat(result.lat);
                          const lon = parseFloat(result.lon);
                          setPosition([lat, lon]);
                          setSearchResults([]);
                          setSearchQuery(result.display_name.split(",")[0]);
                        }}
                        className="w-full text-left p-3 hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {result.display_name.split(",").slice(0, 2).join(",")}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {result.display_name.split(",").slice(2).join(",")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-all font-medium text-sm shadow-md shadow-teal-100 whitespace-nowrap"
              >
                {searchLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Find on Map"
                )}
              </button>
            </div>
          </div>

          <div className="sticky top-10 mt-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-100 md:h-125">
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <Navigation size={14} /> Drag marker to your exact doorstep
              </p>
              {mapLoading ? (
                <div className="flex justify-center items-center py-10 w-full h-full">
                  <Loader className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <div className="w-full h-[90%] rounded-xl overflow-hidden">
                  <MapView position={position} setPosition={setPosition} />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-14 right-8 bg-teal-600 text-white shadow-lg rounded-full p-3 hover:bg-teal-700 transition-all flex flex-center justify-center z-999 "
                    onClick={handleCurrentLocation}
                  >
                    <LocateFixed className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duratio-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-teal-600 w-6 h-6" />
            Payment Method
          </h2>

          <div className="space-y-4 mb-6">
            <button
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all cursor-pointer ${
                paymentMethod === "ONLINE"
                  ? "border-teal-600 bg-teal-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setPaymentMethod("ONLINE")}
            >
              <CreditCardIcon className="text-teal-600" />
              <span className="font-medium text-gray-700">
                Pay Online (Razorpay)
              </span>
            </button>

            <button
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all cursor-pointer ${
                paymentMethod === "COD"
                  ? "border-teal-600 bg-teal-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <Truck className="text-teal-600" />
              <span className="font-medium text-gray-700">
                Cash On Delivery (Razorpay)
              </span>
            </button>
          </div>

          <div className="border-t border-gray-400 mt-4 pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>subTotal</span>
              <span className="text-teal-700 font-semibold">₹{subTotal}</span>
            </div>

            <div className="flex justify-between">
              <span>deliveryFee</span>
              <span className="text-teal-700 font-semibold">
                ₹{deliveryFee}
              </span>
            </div>

            <div className="flex justify-between items-center font-bold text-lg sm:text-xl border-t border-gray-400 pt-4 mt-4">
              <span className="text-gray-800">Final Total</span>
              <span className="text-teal-700 font-bold text-xl sm:text-2xl">
                ₹{finalTotal}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              disabled={isPaying}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-full hover:bg-teal-700 transition-all font-semibold"
              onClick={() => {
                if (paymentMethod === "COD") {
                  handleCod();
                } else {
                  setIsPaying(true);
                  handleOnlineOrder().finally(() => setIsPaying(false));
                }
              }}
            >
              {isPaying ? (
                <Loader className="animate-spin mx-auto" />
              ) : paymentMethod === "COD" ? (
                "Place Order"
              ) : (
                "Pay & Place Order"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
