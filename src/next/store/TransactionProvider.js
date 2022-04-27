import React, { useContext, useState } from 'react'
import axios from 'axios'

export const TransactionContext = React.createContext(null)
const API = 'https://shihab-trial-project.madriver.io/express'
// const API = 'http://localhost:8000/express'

const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([])

    async function addTransaction(transaction) {
        try {
            const response = await axios.post(`${API}/add`, { transaction })
            setTransactions([ ...transactions, response.data.transaction ])
        } catch (error) {
            throw error
        }
    }

    async function getTransactions() {
        try {
            const response = await axios.get(`${API}/`)
            setTransactions([  ...response.data.transactions ])
        } catch (error) {
            throw error
        }
    }

    async function updateStatus(status, id, hash) {
        try {
            const response = await axios.post(`${API}/updateStatus`, { status, transactionId: id, hash })
            setTransactions([ ...transactions.map((tx) => {
                if(tx._id == id) {
                    tx.status = status
                    tx.hash = hash
                }
                return tx
            }) ])
        } catch (error) {
            throw error
        }
    }

    async function updateStatusBatch(status, ids, hash) {
        try {
            const response = await axios.post(`${API}/updateStatusBatch`, { status, transactionIds: ids, hash })
            setTransactions([ ...transactions.map((tx) => {
                ids.forEach((id) => {
                    if(tx._id == id) {
                        tx.status = status
                        tx.hash = hash
                    }
                })
                return tx
            }) ])
        } catch (error) {
            throw error
        }
    }

    return (
        <TransactionContext.Provider value={{ getTransactions, addTransaction, transactions, updateStatus, updateStatusBatch }}>
            {children}
        </TransactionContext.Provider>
    )
}

export default TransactionProvider
