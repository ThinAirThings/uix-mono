'use client'

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'


const makeQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60
        }
    }
})

let browserQueryClient: QueryClient | undefined = undefined

export const getQueryClient = () => isServer
    ? makeQueryClient()
    : !browserQueryClient
        ? browserQueryClient = makeQueryClient()
        : browserQueryClient

export const UixProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={getQueryClient()}>
        {children}
    </QueryClientProvider>
)