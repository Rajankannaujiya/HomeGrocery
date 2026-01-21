"use client"

import { SessionProvider } from "next-auth/react"

type Props = {}

const Provider = ({children}:{children: React.ReactNode}) => {
  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  )
}

export default Provider