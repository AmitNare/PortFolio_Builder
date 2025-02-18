import React from 'react'
import { useUserAuth } from './Components/UserAuthentication'

export default function Hero() {
  const {user} = useUserAuth();
  return (
    <div className='text-foreground'>
      Welcome
      {user && user.email}
    </div>
  )
}
