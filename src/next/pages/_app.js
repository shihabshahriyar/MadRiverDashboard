import '../styles/globals.css'
import { Rinkeby, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import AuthProvider from '../store/AuthProvider'
import TransactionProvider from '../store/TransactionProvider'
import { getDefaultProvider } from 'ethers'

const dappConfig = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: getDefaultProvider('rinkeby'),
  },
}

function MyApp({ Component, pageProps }) {
  return <AuthProvider>
      <TransactionProvider>
          <DAppProvider config={dappConfig}>
              <Component {...pageProps} />
          </DAppProvider>
        </TransactionProvider>
      </AuthProvider>
}

export default MyApp
