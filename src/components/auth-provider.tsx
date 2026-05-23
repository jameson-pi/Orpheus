"use client"

import React from "react"
import {NeonAuthUIProvider} from '@neondatabase/neon-js/auth/react'
import {authClient} from '@/lib/auth-client'

export function AuthProvider({children}: { children: React.ReactNode }) {
    return (
        <NeonAuthUIProvider authClient={authClient} emailOTP>
            {children}
        </NeonAuthUIProvider>
    )
}

