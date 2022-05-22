import React, { useContext, useState } from 'react'
import users from '../users.json'
import axios from 'axios'

export const AuthContext = React.createContext(null)
const API = 'http://localhost:8000/express'

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState('')
    const [message, setMessage] = useState('')

    const login = async ({ user, token }) => {
        try {
            // await axios({ method: 'post', url: `${API}/login`, data: { token } })
            axios.defaults.headers.common['auth-token'] = token
            setUser(user)
            setToken(token)
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        } catch (error) {
            alert(error?.response?.data?.message)
            throw error
        }
    }

    async function fetchUser() {
        const user = JSON.parse(localStorage.getItem('user')) || null
        const token = localStorage.getItem('token') || ''
        axios.defaults.headers.common['auth-token'] = token
        setUser(user)
        setToken(token)
    }

    function getUserType() {
        let foundUser = users.find((usr) => usr.email == user?.email)
        if(foundUser) {
            return {
                userFound: true,
                type: foundUser.type
            }
        } else {
            return {
                userFound: false,
                type: ''
            }
        }

    }

    const logout = async () => {
        try {
            // const token = localStorage.getItem('token') || ''
            // await axios({ method: 'post', url: `${API}/logout`, data: { token } })
            axios.defaults.headers.common['auth-token'] = null
            setUser(null)
            setToken(null)
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (error) {
            alert(error.response.data.message)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, message, login, fetchUser, logout, getUserType }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
