import {
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
  Leaf,
  Loader,
  LogIn,
  Mail,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import googleLogo from "@/public/googleImg.png";

type PropsType = {
  prevStep: (n: number) => void;
};
const RegisterForm = ({ prevStep }: PropsType) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleRegister = async(emai:React.FormEvent)=>{
    emai.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({name, email, password})
      })
      
      if(!response.ok){
        toast.error("some error has occured");
        setLoading(false)
        return
      }

      const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            toast.error("User created, but login failed. Please login manually.");
            router.push("/login");
        } else {
            toast.success("Registration successful!");
            router.push("/")
        }
    } catch (error) {
      setLoading(false)
      console.log(error)
      toast.error("Registration failed!")
    }
  }
  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-6 py-10 bg-white relative">
      <div
        className="absolute top-6 left-6 flex items-center gap-2 text-teal-700 hover:text-teal800 transition-colors cursor-pointer"
        onClick={() => prevStep(1)}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-teal-700 font-extrabold text-4xl md:text-5xl mb-3"
      >
        Create Account
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-gray-600 flex items-center p-2 mb-8"
      >
        Join HomeGrocery Now
        <Leaf className="w-5 h-5 text-teal-600" />
      </motion.p>

      <motion.form 
      onSubmit={handleRegister}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col gap-5 w-full max-w-sm md:max-w-md"
      >
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter your Name"
            className="w-full border border-gray-200 rounded-xl p-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Enter your Email"
            className="w-full border border-gray-200 rounded-xl p-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className="relative">
          <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            className="w-full border border-gray-200 rounded-xl p-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <Eye
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <EyeOff
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </div>

        {(() => {
          const isFormValid = name !== "" && email !== "" && password !== "";
          return (
            <button
              disabled={!isFormValid || loading}
              className={`w-full inline-flex items-center py-3 rounded-xl transition-all duration-200 shadow-md font-semibold justify-center gap-2 ${
                isFormValid
                  ? "bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
             {loading ? <Loader className="w-5 h-5 animate-spin"/> : "Register"}
            </button>
          );
        })()}

        <div className="flex gap-2 items-center text-gray-400 text-sm mt-2">
          <span className="flex-1 h-px bg-gray-200"></span>
          OR
          <span className="flex-1 h-px bg-gray-200"></span>
        </div>

        <div className="w-full flex justify-center border border-gray-300 items-center gap-3 text-gray-700 bg-gray-100 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer" onClick={async () => {
    const result = await signIn("google", { 
        callbackUrl: "/"
    });
}}>
          <Image src={googleLogo} width={30} height={30} alt="google" />
          Countinue with google
        </div>

        <p className="flex justify-center items-center text-gray-600 text-sm gap-2 p-1" onClick={()=>router.push("/login")}>
          Already have an account ?
          <LogIn className="w-5 h-5"/>
          <span className="text-teal-600 font-semibold cursor-pointer hover:text-teal-700">Sign in</span>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterForm;
