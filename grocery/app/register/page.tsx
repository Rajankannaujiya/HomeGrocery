"use client"

import RegisterForm from "@/app/components/RegisterForm"
import Welcome from "@/app/components/Welcome"
import { useState } from "react"


type Props = {}

const Register = (props: Props) => {

  const [step, setStep] = useState(1)

  return (
    <div className="">
        {step === 1 ? <Welcome nextStep={setStep} />: <RegisterForm prevStep={setStep}/>}
    </div>
  )
}

export default Register