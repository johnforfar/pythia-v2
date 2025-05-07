/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use client'

import AccountContextProvider from '@/contexts/AccountContext'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, useWeb3ModalTheme } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, polygonMumbai } from 'wagmi/chains'

const chain =
  process.env.NEXT_PUBLIC_WALLET_ENVIRONMENT === 'Polygon'
    ? polygon
    : polygonMumbai
const chains = [chain]
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AccountContextProvider>
        <WagmiConfig config={wagmiConfig}>
          <ThemeProvider
            attribute="class"
            enableSystem={false}
            defaultTheme="dark"
          >
            {children}
          </ThemeProvider>
        </WagmiConfig>
      </AccountContextProvider>

      <ToastContainer />
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
