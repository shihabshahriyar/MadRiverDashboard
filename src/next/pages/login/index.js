import { GoogleLogin } from 'react-google-login';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../store/AuthProvider';
import AuthGuard from '../../layouts/AuthGuard';

const CLIENT_ID = '216274540535-2j61735jajct79qb7qdail1fp95cn7db.apps.googleusercontent.com'


export default function Login() {
    const { login, fetchUser } = useContext(AuthContext)

    const responseGoogle = (response) => {
        login({ user: response.profileObj, token: response.tokenId })
    }
    
    const handleFailure = (result) => {
        alert(result)
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AuthGuard type="must-be-logged-out">
            <div className="bg-white w-full h-screen flex justify-center items-center">
                <GoogleLogin clientId={CLIENT_ID} onSuccess={responseGoogle} onFailure={handleFailure} render={(renderProps) => <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="py-2 px-4 border bg-blue-500 text-white shadow rounded">Login with Google</button>
                }>

                </GoogleLogin>
            </div>
        </AuthGuard>
    )
}