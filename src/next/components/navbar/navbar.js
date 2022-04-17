import { useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../../store/AuthProvider'
import { Ropsten, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { FiGrid, FiList, FiMail, FiPaperclip } from 'react-icons/fi'

export default function Navbar({ route }) {
    const router = useRouter()
    const { logout, user, getUserType } = useContext(AuthContext)
    const { activateBrowserWallet, account } = useEthers()
    const etherBalance = useEtherBalance(account)
    

    return (
        <div className="flex flex-row p-5">
          <div className="flex flex-1 justify-start items-center">
            <img src="https://storage.googleapis.com/job-listing-logos/8cdac335-eadb-4e6d-bf9c-7c817a6522e3.png" width={40} className="rounded"/>
            <div className="font-bold ml-3">Mad River</div>
          </div>
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-row bg-slate-100 space-x-1 py-1 px-1 rounded-lg">
              <div onClick={() => router.push('/dashboard')} className={`flex justify-center items-center ${route == 'dashboard' ? 'bg-white font-bold' : ''} rounded cursor-pointer text-gray-600  py-2 px-4`}>
                {route == 'dashboard' && <FiGrid size={20} className={`text-slate-500 mr-3`} />}
                Dashboard
              </div>
              <div onClick={() => router.push('/requests')} className={`flex justify-center items-center ${route == 'requests' ? 'bg-white font-bold' : ''} rounded cursor-pointer text-gray-600  py-2 px-4`}>
              {route == 'requests' && <FiList size={20} className={`text-slate-500 mr-3`} />}
                Request List
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-end space-x-2 items-center">
          <div className="flex flex-row  space-x-3 py-1 px-1 rounded-lg">
              {account && getUserType().type == 'admin' && <div onClick={() => {}} className={`flex justify-center items-center border rounded-lg text-gray-600  py-2 px-4`}>
              <FiPaperclip size={20} className={`text-slate-500 mr-3`} /> {account.substring(0, 15)}....
              </div>}
              <div onClick={() => {}} className={`flex justify-center items-center border rounded-lg ounded text-gray-600  py-2 px-4`}>
              <FiMail size={20} className={`text-slate-500 mr-3`} /> {user?.email}
              </div>
            </div>
            {!account && getUserType().type == 'admin' && <button  onClick={() => activateBrowserWallet()}  className="px-2 py-2 bg-blue-500 text-white shadow-sm rounded-lg">
                  Connect Wallet
                </button>}
          <button onClick={logout} className="py-2 px-4 border bg-blue-500 text-white rounded-md">Logout</button>
          </div>
        </div>
    )
  }
  