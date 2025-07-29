import React from 'react'
import { useAppcontext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const Loading = () => {

    const {navigate} = useAppcontext()
    let {search} = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next');

    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=>{
                navigate(`/${nextUrl }`)

            },3000)
        }

    },[nextUrl])
  return (
        <div className="flex items-center justify-center h-screen">
        <div
            className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300"
            style={{ borderTopColor: 'var(--color-primary)' }}
        ></div>
        </div>
  )
}

export default Loading