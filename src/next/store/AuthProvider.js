import React, { useContext, useState } from 'react'
import users from '../users.json'

export const AuthContext = React.createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState('')
    const [message, setMessage] = useState('')

    const login = ({ user, token }) => {
        setUser(user)
        setToken(token)
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }

    async function fetchUser() {
        const user = JSON.parse(localStorage.getItem('user')) || null
        const token = localStorage.getItem('token') || ''
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

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, token, message, login, fetchUser, logout, getUserType }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
