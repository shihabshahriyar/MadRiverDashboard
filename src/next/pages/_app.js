import '../styles/globals.css'
import { Rinkeby, DAppProvider} from '@usedapp/core'
// import { formatEther } from '@ethersproject/units'
import AuthProvider from '../store/AuthProvider'
import TransactionProvider from '../store/TransactionProvider'
import { getDefaultProvider } from 'ethers'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'

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
              <ToastContainer limit={1}/>
          </DAppProvider>
        </TransactionProvider>
      </AuthProvider>
}

export default MyApp
