import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../store/AuthProvider'
import { useRouter } from 'next/router'


const AuthGuard = ({ children, type }) => {
    const { token, user, getUserType, logout } = useContext(AuthContext)
    const router = useRouter()

    useEffect(() => {
        if(type == 'must-be-logged-in') {
            if(!token) {
                router.push('/login')

            } else {
                if(getUserType().userFound == false) {
                    logout()
                    router.push('/login')
                    alert("This user is not authorized to access app")
                }
            }
        } else if (type == 'must-be-logged-out') {
            if(token && user) {
                router.push('/dashboard')

            } else {

            }
        } else if (type == 'either') {

        }
    }, [user, token])

    return (
        <div className="w-full">
            {children}
        </div>
    )
}

export default AuthGuard