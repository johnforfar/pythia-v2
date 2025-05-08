/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use client'

import AccountContextProvider from '@/contexts/AccountContext'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'

// Wagmi / Web3Modal v2 imports
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, polygon, polygonMumbai } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const metadata = {
  name: 'Pythia',
  description: 'Openmesh Pythia',
  url: 'https://openmesh.network',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const allChains = [mainnet, polygon, polygonMumbai] as const

const config = createConfig({
  chains: allChains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: metadata.name, appLogoUrl: metadata.icons[0] }),
  ],
  ssr: true, // Enable SSR
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // chains are typically derived from wagmiConfig
  // themeMode: 'dark',
  // defaultChain: mainnet,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccountContextProvider>
      <WagmiProvider config={config} reconnectOnMount={true}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute='class'
            enableSystem={false}
            defaultTheme='dark'
          >
            {children}
            <ToastContainer />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AccountContextProvider>
  )
}
