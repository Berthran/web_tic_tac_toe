import React from 'react'
import Game from './components/Game'

export default function App() {
  return (
    <div className='w-full p-4 items-center justify-center bg-slate-300 border-4 rounded-lg '>
      <div className='w-full items-center justify-center bg-green-500 border-4 rounded-lg '>
        <h1 className='text-center font-bold text-4xl'>
          Tic-Tac-Toe
        </h1>
      </div>
      <div className="flex p-6 mt-4 w-full items-center justify-center bg-green-500 border-4 rounded-lg">
        <Game className='p-6'/>
      </div>
    </div>
  )
}

