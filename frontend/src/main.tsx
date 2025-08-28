import { PrivyProvider } from '@privy-io/react-auth'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet'],
        embeddedWallets: { createOnLogin: 'off' },
        appearance: { theme: 'light' },
        supportedChains: [
          {
/*          id: 999,
            name: 'HyperEVM',
            nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
            rpcUrls: { default: { http: ['https://rpc.hyperliquid.xyz/evm'] } },
            blockExplorers: { default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz/evm' } }, */
            id: 998,
            name: 'HyperEVM Testnet',
            nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
            rpcUrls: { 
              default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
              fallback: { http: ['https://api.hyperliquid-testnet.xyz/'] },
            },
            
            blockExplorers: { default: { name: 'Hyperliquid Testnet Explorer', url: 'https://app.hyperliquid-testnet.xyz/explorer' } },
          },
        ],
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
