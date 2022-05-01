import Navbar from "../../components/navbar/navbar";
import { Fragment, useContext, useState, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import AuthGuard from '../../layouts/AuthGuard'
import { TransactionContext } from "../../store/TransactionProvider";
import { AuthContext } from "../../store/AuthProvider";
import web3 from 'web3'

function Dashboard() {
    const tokens = [
        { name: 'Ethereum', value: 'ETH' },
        { name: 'USD Coin', value: 'USDC' },
        { name: 'USD Token', value: 'USDT' },
    ]

    const [form, setForm] = useState({
        amount: 0,
        coinType: 'ETH',
        address: '',
        memo: '',
        status: 'pending'
    })
    
    const [selected, setSelected] = useState(tokens[0])
    const { addTransaction } = useContext(TransactionContext)
    const { user, logout, fetchUser } = useContext(AuthContext)
    const  [userType, setType ] = useState('')

    useEffect(() => {
        fetchUser()
    }, [])
    
    useEffect(() =>{ setForm(f => ({...f, coinType: selected.value }) ) }, [selected])


    async function onFormSubmit() {
        try {
            await addTransaction({...form, email: user.email, amount: Number(form.amount) })
            setForm({ ...form, amount: 0, address: '', memo: ''})
        } catch (error) {
            alert(error?.message)
            if(error?.response?.data?.message == 'logout') {
                logout()
            }
            console.log(error?.response?.data?.message)
            // logout()
        }
    }

    function renderSubmitButton() {
        if(form.address == '' || web3.utils.isAddress(form.address) == false) {
            return <button className="border shadow px-2 cursor-default py-4 bg-gray-200 text-black w-full rounded">Enter Valid Wallet Address</button>

        }

        if(form.memo == '') {
            return <button className="border shadow px-2 py-4 cursor-default bg-gray-200 text-black w-full rounded">Enter Memo</button>
        }

        return <button className="border shadow px-2 py-4 bg-blue-500 text-white w-full rounded" onClick={onFormSubmit}>Make Request</button>
    }

    return (
        <AuthGuard type="must-be-logged-in">
        <div className="w-full h-screen">
            <Navbar route="dashboard" />

            <div className="w-full flex justify-center flex-col items-center mt-10">
            <div className="focus:outline-none text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-normal text-gray-800 py-7">
                        Dashboard
            </div>
                <div className="bg-white w-[500px] px-8 py-6 border space-y-4 rounded-lg">


                    <div className="flex flex-row space-x-4">
                        <div className="flex-[2] flex justify-center items-center">
                            <input type="number" min="0" className="w-full outline-none h-10 rounded p-6 bg-[#F5F5F5]" placeholder="Enter Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
                        </div>
                        <div className="flex-1 flex justify-center items-center">
                            <Listbox value={selected} onChange={setSelected}>
                                <div className="relative mt-1 w-full">
                                    <Listbox.Button className="relative w-full py-4 pl-3 pr-10 text-left bg-white rounded-lg border cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                                        <span className="block truncate">{selected.name}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <SelectorIcon
                                                className="w-5 h-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {tokens.map((person, personIdx) => (
                                                <Listbox.Option
                                                    key={personIdx}
                                                    className={({ active }) =>
                                                        `cursor-default select-none relative py-2 pl-10 pr-4 ${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={person}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                            >
                                                                {person.name}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                    <CheckIcon className="w-5 h-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>
                    </div>

                    <div>
                        <input type="text" className="w-full outline-none h-10 rounded p-6 bg-[#F5F5F5]" placeholder="Enter Wallet Address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                    </div>

                    <div>
                        <textarea required placeholder="Transaction memo" rows={3} className="w-full outline-none rounded p-6 bg-[#F5F5F5]" value={form.memo} onChange={(e) => setForm({...form, memo: e.target.value})} />
                    </div>

                    <div>
                       {renderSubmitButton()}
                    </div>
                    <div>

                    </div>
                </div>
            </div>
        </div>
        </AuthGuard>
    )
}

export default Dashboard