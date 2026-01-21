import type { Metadata } from "next";
import "./globals.css";
import groceryImage from '@/public/grocery.jpg'
import Provider from "./Provider";
import { ToastContainer } from "react-toastify";
import StoreProvider from "./redux/StoreProvider";
import InitUser from "./InitUser";


export const metadata: Metadata = {
  title: "Grossery Delivery",
  description: "10 mins grocery delivery",
  icons: [{ url: groceryImage.src, sizes: "16x16", type: "image/jpg" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-teal-100 to-white">
        <Provider>
          <StoreProvider >
            <InitUser />
            {children}
            <ToastContainer />
          </StoreProvider>
        </Provider>
        
      </body>
    </html>
  );
}
