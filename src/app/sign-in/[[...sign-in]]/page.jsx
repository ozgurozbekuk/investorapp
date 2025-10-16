import { SignedOut, SignIn, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div>
        <SignIn/>
    </div>
  )
}

export default page