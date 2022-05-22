import { useContext, useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import AuthGuard from '../../layouts/AuthGuard'
import { AuthContext } from "../../store/AuthProvider";
import { TransactionContext } from "../../store/TransactionProvider";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useEthers, useSendTransaction, useContractFunction } from '@usedapp/core'
import {Contract} from '@usedapp/core/node_modules/@ethersproject/contracts'
import { ethers, utils } from "ethers";
import { FiMail, FiDollarSign, FiCheck } from 'react-icons/fi'
import ERC20ABI from '../../contracts/ERC20.json'
import MadRiverABI from '../../contracts/MadRiver.json'
import Web3 from 'web3'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip';
import format from 'date-fns/format'

// import { readFile } from 'fs/promises'

// let config
// readFile(new URL('../../../../local.conf.json', import.meta.url)).then((res) => {
//     config = JSON.parse(res)
// })

// const config = JSON.parse(readFile(new URL('', import.meta.url)));

const ERCInterface = new utils.Interface(ERC20ABI)

const MadRiverAddress = '0x6823AdD85dd35F632b3AfFf980977818FAed6a23'
const TetherAddress = '0x3B00Ef435fA4FcFF5C209a37d1f3dcff37c705aD'
const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926'

const TetherContract = new Contract(TetherAddress, ERCInterface)
const USDContract = new Contract(USDCAddress, ERCInterface)


export default function Requests({ text }) {
    const {  account } = useEthers()
    const [txIdBeingMined, setTxId] = useState('')
    const [isMining, setMining] = useState(false)
    const { user, getUserType, fetchUser, logout } = useContext(AuthContext)
    const { getTransactions, transactions, updateStatus, updateStatusBatch } = useContext(TransactionContext)
    const { sendTransaction, state } = useSendTransaction()
    const [checkedIndices, setCheckedIndices] = useState([])
    const [MadRiverContract, setContract] = useState(null)
    const [TetherContract2, setContract2] = useState(null)
    const [USDContract2, setContract3] = useState(null) 
    // const { state:updateState, send:sendBatchTransaction } = useContractFunction(MadRiverContract, 'batchTransaction');
    const { state: usdcState, send:sendUSDC } = useContractFunction(USDContract, 'transferFrom')
    // const { state: usdcApprove, send:usdcApproveTransaction } = useContractFunction(USDContract, 'approve')
    // const { state: usdTApprove, send:usdTApproveTransaction } = useContractFunction(TetherContract, 'approve')
    const { state: usdtState, send:sendUSDT } = useContractFunction(TetherContract, 'transferFrom')

    const [filter,setFilter] = useState('')

    async function loadWeb3() {
        if (window.ethereum) {
            console.log('Ethereum provider',window.ethereum)
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
            console.log('Current provider',window.web3.currentProvider)
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      }

      async function loadBlockchainData() {
        const web3 = window.web3
        const contract = new web3.eth.Contract(MadRiverABI, MadRiverAddress)
        const contract2 = new web3.eth.Contract(ERC20ABI, TetherAddress)
        const contract3 = new web3.eth.Contract(ERC20ABI, USDCAddress)
        setContract({ ...contract })
        setContract2({ ...contract2 })
        setContract3({ ...contract3 })
      }

    useEffect(() => {
        async function getAllTransactions() {
            try {
                await fetchUser()
                await getTransactions()
                await loadWeb3()
                await loadBlockchainData()
            } catch(error) {
                if(error?.response?.data?.message == 'logout') {
                    logout()
                }
            }
        }
        getAllTransactions()
    }, [])


    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    async function batchUpdate() {
        // const accounts = await web3.eth.getAccounts()
        // console.log(accounts[0])
        let transactionsToSend = [...transactions.filter((transaction) => checkedIndices?.find((tx) => tx.id === transaction._id)?.isChecked == true)]

        setMining(true)
       
        MadRiverContract.methods.batchTransaction([...transactionsToSend.map((tx) => { 
            if(tx.coinType == "ETH") {
                return { recipient: tx.address, amount:utils.parseEther(tx.amount.toString()), coinType: tx.coinType}
            }
            else {
                return {recipient: tx.address, amount: tx.amount * 1000000, coinType: tx.coinType }
            }
            return {}
         })]).send({ from: account, value: utils.parseEther(transactionsToSend.reduce((a, b) => { 
            if(b.coinType == "ETH") {
                return a+ b.amount
            }
            else 
                return a 
        }, 0).toString()) }).on('receipt', (receipt) => {
                updateStatusBatch('sent', checkedIndices.filter((tx) => tx.isChecked == true).map((tx) => tx.id), receipt.transactionHash)
                setMining(false)
                toast.clearWaitingQueue();
                toast('Successfully mined!', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
             }).on('error', (error) => {
                //  alert(error.message)
                 console.log(error)
                 setMining(false)
                 toast.clearWaitingQueue();
                 toast('Failed Mining', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
             })
    }

    async function batchStatusUpdate(status) {
        updateStatusBatch(status, checkedIndices.filter((tx) => tx.isChecked == true).map((tx) => tx.id), '')
    }


    function getColor(status) {
        if(status == 'denied') {
            return 'text-red-700 bg-red-100'
        } else if (status == 'approved') {
            return 'text-green-700 bg-green-100'
        } else if (status == 'pending') {
            return 'text-amber-600 bg-amber-100'
        } else if (status == 'sent') {
            return 'text-blue-600 bg-blue-100'
        }
    }

    async function approveTransaction(status, id) {
        let tx = transactions.find((t) => t._id == id)
        if(tx.coinType == 'ETH') {
            setTxId(id)
            sendTransaction({ to: tx.address, value: utils.parseEther(tx.amount.toString()) })
        } else if (tx.coinType == 'USDT') {
            setTxId(id)
            // sendApproval(account, 1000000000000000000000)
            sendUSDT(account, tx.address, tx.amount * 1000000)
        //     TetherToken.methods.approve(tx.address, tx.amount).
        //     send({ from: account }).on('transactionHash', (hash) => {
        //         TetherToken.methods.transferFrom(account, tx.address,).send({ from: this.state.account }).on('transactionHash', (hash) => {
        //           .......
        //         })
        //   })
        } else if (tx.coinType == 'USDC') {
            setTxId(id)
            sendUSDC(account, tx.address, tx.amount * 1000000)

        }

    }

    function checkTx(id) {
        setCheckedIndices(checkedIndices.map((tx) => {
            if(tx.id == id)
                tx.isChecked = !tx.isChecked
            return tx
        }))
    }

    useEffect(() => {
        if(state.status == 'Success') {
            updateStatus('sent', txIdBeingMined, state.receipt.transactionHash)
            setTxId('')
            setMining(false)
            toast.clearWaitingQueue();
            toast('Successfully mined!', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                });
        }
        if (state.status == 'Mining' || state.status == 'PendingSignature') {
            setMining(true)
            toast.clearWaitingQueue();
            toast('Mining transaction', {
                position: "bottom-center",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }

        if(state.status == 'Fail' || state.status == 'Exception') {
            alert(state.errorMessage)
            setMining(false)
            toast.clearWaitingQueue();
            toast('Failed Mining', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }, [state.status])

    useEffect(() => {
        if(usdtState.status == 'Success') {
            updateStatus('sent', txIdBeingMined, usdtState.receipt.transactionHash)
            setTxId('')
            setMining(false)
            toast.clearWaitingQueue();
            toast('Successfully mined!', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                });
        }
        if (usdtState.status == 'Mining' || usdtState.status == 'PendingSignature') {
            setMining(true)
            toast.clearWaitingQueue();
            toast('Mining transaction', {
                position: "bottom-center",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }

        if(usdtState.status == 'Fail' || usdtState.status == 'Exception') {
            alert(usdtState.errorMessage)
            setMining(false)
            toast.clearWaitingQueue();
            toast('Failed Mining', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }, [usdtState.status])

    useEffect(() => {
        if(usdcState.status == 'Success') {
            updateStatus('sent', txIdBeingMined, usdcState.receipt.transactionHash)
            setTxId('')
            setMining(false)
            toast.clearWaitingQueue();
            toast('Successfully mined!', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
        if (usdcState.status == 'Mining' || usdcState.status == 'PendingSignature') {
            setMining(true)
            toast.clearWaitingQueue();
            toast('Mining transaction', {
                position: "bottom-center",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }

        if(usdcState.status == 'Fail' || usdcState.status == 'Exception') {
            alert(usdcState.errorMessage)
            setMining(false)
            toast.clearWaitingQueue();
            toast('Failed Mining', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }, [usdcState.status])

    useEffect(() => {
        if(transactions)
        setCheckedIndices([...transactions.map((t) => ({ id: t._id, isChecked: false }))])
    }, [transactions])


    return (
        <AuthGuard type="must-be-logged-in">
            <div className="w-full pb-40">
                <Navbar route="requests" />
                <ReactTooltip />

                <div className="sm:px-6 lg:px-20 w-full mt-10">
                    <div className="px-4 py-4 md:py-7">
                        <div className="flex items-center justify-center">
                            <p tabIndex="0" className="focus:outline-none text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-normal text-gray-800">Tasks</p>
                        </div>
                    </div>
                    <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10 rounded-lg border">
                        <div className="sm:flex items-center justify-between">
                            <div className="flex items-center justify-center">
                                <a className="" href=" javascript:void(0)" onClick={() => setFilter('')}>
                                    <div className={`py-2 px-8 ${filter == '' ? 'bg-blue-100 text-blue-700' : ''} rounded`}>
                                        <p>All</p>
                                    </div>
                                </a>
                                <a className="ml-4 sm:ml-8" href="javascript:void(0)">
                                    <div className={`py-2 px-8 ${filter == 'sent' ? 'bg-indigo-100 text-blue-700' : ''} rounded`} onClick={() => setFilter('sent')}>
                                        <p>Sent</p>
                                    </div>
                                </a>
                                <a className="ml-4 sm:ml-8" href="javascript:void(0)">
                                    <div className={`py-2 px-8 ${filter == 'pending' ? 'bg-indigo-100 text-blue-700' : ''} rounded`} onClick={() => setFilter('pending')}>
                                        <p>Pending</p>
                                    </div>
                                </a>
                                <a className="r ml-4 sm:ml-8" href="javascript:void(0)">
                                    <div className={`py-2 px-8 ${filter == 'approved' ? 'bg-blue-100 text-blue-700' : ''} rounded`} onClick={() => setFilter('approved')}>
                                        <p>Approved</p>
                                    </div>
                                </a>
                                <a className="r ml-4 sm:ml-8" href="javascript:void(0)">
                                    <div className={`py-2 px-8 ${filter == 'denied' ? 'bg-blue-100 text-blue-700' : ''} rounded`} onClick={() => setFilter('denied')}>
                                        <p>Denied</p>
                                    </div>
                                </a>
                            </div>
                            {user && getUserType().type == 'admin' && checkedIndices.some((tx) => tx.isChecked == true) && !isMining && <div>
                                                    <Menu as="div" className="relative inline-block text-left">
                                                        <div>
                                                            <Menu.Button className="inline-flex justify-center w-full z-[1] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                                                                Batch Options
                                                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                                            </Menu.Button>
                                                        </div>

                                                        <Transition
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            
                                                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 z-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                                                                <div className="py-1">
                                                                <Menu.Item onClick={() => batchUpdate()}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Send
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item onClick={() => batchStatusUpdate('approved')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Approve
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item onClick={() => batchStatusUpdate('pending')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Pending
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item onClick={() => batchStatusUpdate('denied')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Deny
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                </div>
                                                                
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </div>}
                        </div>
                        <div className="mt-7">
                            <table className="w-full whitespace-nowrap">
                                <tbody>
                                    {
                                        user && transactions.filter((transaction,i) => {
                                            if(filter == '') 
                                                return true
                                            else return transaction.status == filter
                                        }).filter((transaction) => {
                                            if (getUserType().type == 'admin')
                                                return true
                                            else {
                                                return transaction.email == user.email
                                            }
                                        }).map((transaction, index) => (
                                            <tr key={transaction._id} className="focus:outline-none h-16 border border-gray-100 rounded">
                                                <td>
                                    <div className="ml-5">
                                    {!isMining && getUserType().type == 'admin' && transaction.status != 'sent' && <div  onClick={() => checkTx(transaction._id)} className={`w-5 flex justify-center items-center rounded cursor-pointer h-5 ${checkedIndices?.find((tx) => tx.id == transaction._id)?.isChecked ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                    {checkedIndices?.find((tx) => tx.id == transaction._id)?.isChecked && <FiCheck size={15} className="text-white" />}

                                    </div>}
                                    </div>
                                </td>
                                                <td className="">
                                                    <div className="flex items-center pl-5 space-x-2">
                                                    {/* <FiTag size="20" className="text-slate-500" /> */}
                                                        <div className="text-base font-medium leading-none text-gray-700 mr-2">{transaction.memo}</div>
                                                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M6.66669 9.33342C6.88394 9.55515 7.14325 9.73131 7.42944 9.85156C7.71562 9.97182 8.02293 10.0338 8.33335 10.0338C8.64378 10.0338 8.95108 9.97182 9.23727 9.85156C9.52345 9.73131 9.78277 9.55515 10 9.33342L12.6667 6.66676C13.1087 6.22473 13.357 5.62521 13.357 5.00009C13.357 4.37497 13.1087 3.77545 12.6667 3.33342C12.2247 2.89139 11.6251 2.64307 11 2.64307C10.3749 2.64307 9.77538 2.89139 9.33335 3.33342L9.00002 3.66676" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M9.33336 6.66665C9.11611 6.44492 8.8568 6.26876 8.57061 6.14851C8.28442 6.02825 7.97712 5.96631 7.66669 5.96631C7.35627 5.96631 7.04897 6.02825 6.76278 6.14851C6.47659 6.26876 6.21728 6.44492 6.00003 6.66665L3.33336 9.33332C2.89133 9.77534 2.64301 10.3749 2.64301 11C2.64301 11.6251 2.89133 12.2246 3.33336 12.6666C3.77539 13.1087 4.37491 13.357 5.00003 13.357C5.62515 13.357 6.22467 13.1087 6.66669 12.6666L7.00003 12.3333" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg> */}
                                                    </div>
                                                </td>
                                                <td className="pl-24">
                                                    <div className="flex items-center">
                                                    <FiMail size="20" className="text-slate-500" />

                                                        <p className="text-sm leading-none text-gray-600 ml-2">{transaction.email}</p>
                                                    </div>
                                                </td>
                                                {/* <td className="pl-5">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                            <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg>
                                        <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                                    </div>
                                </td> */}
                                                <td className="pl-5">
                                                    <div className="flex items-center">
                                                    <FiDollarSign size="20" className="text-slate-500" />

                                                        <p className="text-sm leading-none text-gray-600 ml-2">{transaction.amount} {transaction.coinType}</p>
                                                    </div>
                                                </td>
                                                <td className="pl-5">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                            <path
                                                                d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                                                stroke="#52525B"
                                                                strokeWidth="1.25"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            ></path>
                                                        </svg>
                                                        <p className="text-sm leading-none text-gray-600 ml-2">{transaction.address}</p>
                                                    </div>
                                                </td>
                                                <td className="pl-5">
                                                    <button data-tip={`Created at ${format(new Date(transaction.createdAt), 'MM/dd/yyyy')}, Updated at ${format(new Date(transaction.updatedAt), 'MM/dd/yyyy')}`} className={`py-3 px-3 text-sm focus:outline-none leading-none capitalize ${getColor(transaction.status)} rounded`}>{transaction.status}</button>
                                                </td>
                                                {/* <td className="pl-4">
                                    <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                                </td> */}
                                                {transaction.status == 'sent' && transaction.hash != '' && <td>
                                                    <a target="_blank" rel="noreferrer" href={`https://rinkeby.etherscan.io/tx/${transaction.hash}`} className="bg-white px-3 py-2 border shadow rounded-lg cursor-pointer hover:bg-gray-50">View Transaction</a>
                                                </td>}
                                                {user && getUserType().type == 'admin' && transaction.status != 'sent' && !isMining && <td>
                                                    <Menu as="div" className="relative inline-block text-left">
                                                        <div>
                                                            <Menu.Button className="inline-flex justify-center w-full z-[1] rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                                                                Options
                                                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                                            </Menu.Button>
                                                        </div>

                                                        <Transition
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 z-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                                                                <div className="py-1">
                                                                <Menu.Item onClick={() =>  approveTransaction('sent', transaction._id)}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Send
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                 <Menu.Item onClick={() =>  updateStatus('approved', transaction._id, '')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Approve
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item onClick={() => updateStatus('pending', transaction._id, '')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Pending
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item onClick={() => updateStatus('denied', transaction._id, '')}>
                                                                        {({ active }) => (
                                                                            <a
                                                                                href="#"
                                                                                className={classNames(
                                                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                    'block px-4 py-2 text-sm'
                                                                                )}
                                                                            >
                                                                                Deny
                                                                            </a>
                                                                        )}
                                                                    </Menu.Item>
                                                                </div>
                                                                
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </td>}
                                            </tr>
                                        ))
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}