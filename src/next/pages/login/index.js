import { GoogleLogin } from 'react-google-login';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../store/AuthProvider';
import AuthGuard from '../../layouts/AuthGuard';

const CLIENT_ID = '418664685673-v4mnqvduk7bi7o23h2l8vjutfsfhpsrj.apps.googleusercontent.com'

export default function Login() {
    const { login, fetchUser } = useContext(AuthContext)

    const responseGoogle = async (response) => {
          
        // console.log(ticket)
        // console.log(payload)
        await login({ user: response.profileObj, token: response.tokenId })
    }
    
    const handleFailure = (result) => {
        alert(result)
        console.log(result)
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