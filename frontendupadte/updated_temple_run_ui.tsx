"use client"

import { useState, useEffect, useCallback } from 'react'
import { Settings, Trophy, ShoppingCart, Gift, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

type GameObject = {
  id: number
  type: 'obstacle' | 'coin'
  x: number
  y: number
}

const RunAndEarnUI = () => {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameOver'
  const [distance, setDistance] = useState(0)
  const [coins, setCoins] = useState(0)
  const [score, setScore] = useState(0)
  const [contractAddress, setContractAddress] = useState('')
  const [abi, setAbi] = useState('')
  const [playerPosition, setPlayerPosition] = useState(1) // 0: left, 1: center, 2: right
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])

  const generateGameObject = useCallback(() => {
    const newObject: GameObject = {
      id: Date.now(),
      type: Math.random() < 0.3 ? 'coin' : 'obstacle',
      x: Math.floor(Math.random() * 3), // 0: left, 1: center, 2: right
      y: -50,
    }
    setGameObjects(prev => [...prev, newObject])
  }, [])

  const moveGameObjects = useCallback(() => {
    setGameObjects(prev => 
      prev.map(obj => ({...obj, y: obj.y + 5}))
        .filter(obj => obj.y < 400)
    )
  }, [])

  const checkCollisions = useCallback(() => {
    const playerRect = {
      left: playerPosition * 33.33,
      right: (playerPosition + 1) * 33.33,
      top: 350,
      bottom: 400,
    }

    setGameObjects(prev => {
      let newCoins = coins
      let gameOver = false

      const remainingObjects = prev.filter(obj => {
        if (
          obj.x === playerPosition &&
          obj.y + 50 > playerRect.top &&
          obj.y < playerRect.bottom
        ) {
          if (obj.type === 'obstacle') {
            gameOver = true
            return false
          } else if (obj.type === 'coin') {
            newCoins++
            setScore(s => s + 10)
            return false
          }
        }
        return true
      })

      setCoins(newCoins)
      if (gameOver) {
        setGameState('gameOver')
      }

      return remainingObjects
    })
  }, [playerPosition, coins])

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        moveGameObjects()
        checkCollisions()
        setDistance(d => d + 1)
        setScore(s => s + 1)
      }, 50)

      const objectGenerator = setInterval(generateGameObject, 1000)

      return () => {
        clearInterval(gameLoop)
        clearInterval(objectGenerator)
      }
    }
  }, [gameState, moveGameObjects, checkCollisions, generateGameObject])

  const startGame = () => {
    setGameState('playing')
    setDistance(0)
    setCoins(0)
    setScore(0)
    setPlayerPosition(1)
    setGameObjects([])
  }

  const moveLeft = () => {
    setPlayerPosition(prev => Math.max(prev - 1, 0))
  }

  const moveRight = () => {
    setPlayerPosition(prev => Math.min(prev + 1, 2))
  }

  const MainMenu = () => (
    <div className="relative h-screen w-full bg-gradient-to-b from-green-800 to-yellow-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-700 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-yellow-700 rounded-full opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-yellow-400 mb-12 animate-bounce">Run And Run</h1>
        <button
          onClick={startGame}
          className="bg-yellow-500 text-green-900 px-12 py-6 rounded-full text-3xl font-bold shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 animate-pulse"
        >
          <Play className="inline-block mr-2" /> Play
        </button>
        
        <div className="absolute top-4 left-4">
          <button className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
            <Settings size={32} />
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
            <Trophy size={32} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <button className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
            <ShoppingCart size={32} />
          </button>
        </div>
        <div className="absolute bottom-4 right-4">
          <button className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
            <Gift size={32} />
          </button>
        </div>
      </div>
    </div>
  )

  const GameHUD = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Distance bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min((distance / 1000) * 100, 100)}%` }}
        ></div>
      </div>
      
      {/* Coin counter */}
      <div className="absolute top-4 left-4 flex items-center bg-black bg-opacity-50 rounded-full px-3 py-1">
        <div className="w-6 h-6 bg-yellow-400 rounded-full mr-2 animate-spin"></div>
        <span className="text-white text-xl font-bold">{coins}</span>
      </div>
      
      {/* Score */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full px-3 py-1">
        <span className="text-white text-xl font-bold">{score}</span>
      </div>
      
      {/* Pause button */}
      <button 
        onClick={() => setGameState('menu')}
        className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2 pointer-events-auto"
      >
        <Pause className="text-white" size={24} />
      </button>
    </div>
  )

  const GameOverScreen = () => (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-green-800 p-8 rounded-lg text-center">
        <h2 className="text-4xl font-bold text-yellow-400 mb-6">Game Over</h2>
        <p className="text-xl text-white mb-2">Distance: {distance}</p>
        <p className="text-xl text-white mb-2">Coins: {coins}</p>
        <p className="text-xl text-white mb-4">Score: {score}</p>
        <button 
          onClick={startGame}
          className="bg-yellow-500 text-green-900 px-6 py-3 rounded-full text-xl font-bold shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 mb-4"
        >
          Play Again
        </button>
        <div>
          <button 
            onClick={() => setGameState('menu')}
            className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg hover:bg-blue-400 transition-colors duration-300 mr-2"
          >
            Main Menu
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg hover:bg-green-400 transition-colors duration-300"
          >
            Watch Ad to Continue
          </button>
        </div>
      </div>
    </div>
  )

  const ContractInfo = () => (
    <div className="absolute bottom-16 left-4 bg-black bg-opacity-50 p-4 rounded-lg">
      <h3 className="text-yellow-400 font-bold mb-2">Contract Info</h3>
      <div className="mb-2">
        <label className="text-white text-sm">Address:</label>
        <input 
          type="text" 
          value={contractAddress} 
          onChange={(e) => setContractAddress(e.target.value)}
          className="w-full bg-gray-700 text-white px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="text-white text-sm">ABI:</label>
        <textarea 
          value={abi} 
          onChange={(e) => setAbi(e.target.value)}
          className="w-full bg-gray-700 text-white px-2 py-1 rounded h-20"
        />
      </div>
    </div>
  )

  return (
    <div className="h-screen w-full bg-green-900 overflow-hidden">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && (
        <>
          <div className="h-full w-full bg-gradient-to-b from-green-700 to-yellow-800 flex items-center justify-center">
            <div className="relative w-64 h-96 bg-green-800 overflow-hidden">
              {/* Lanes */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 border-r border-green-700"></div>
                <div className="flex-1 border-r border-green-700"></div>
                <div className="flex-1"></div>
              </div>

              {/* Game objects */}
              {gameObjects.map(obj => (
                <div
                  key={obj.id}
                  className={`absolute w-12 h-12 ${
                    obj.type === 'obstacle' ? 'bg-red-500' : 'bg-yellow-400'
                  } ${obj.type === 'coin' ? 'rounded-full' : 'rounded-md'}`}
                  style={{
                    left: `${obj.x * 33.33}%`,
                    top: `${obj.y}px`,
                  }}
                >
                  {obj.type === 'coin' && (
                    <div className="w-full h-full flex items-center justify-center text-yellow-800 font-bold text-2xl">
                      $
                    </div>
                  )}
                </div>
              ))}

              {/* Player */}
              <div 
                className="absolute bottom-0 w-12 h-16 bg-blue-500 transition-all duration-200 ease-in-out"
                style={{ left: `${playerPosition * 33.33}%` }}
              >
                <div className="w-full h-full relative">
                  <div className="absolute w-8 h-8 bg-yellow-500 rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="absolute w-12 h-8 bg-blue-600 bottom-0 left-0"></div>
                </div>
              </div>
            </div>
          </div>
          <GameHUD />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button 
              className="bg-yellow-500 text-green-900 p-4 rounded-full shadow-lg"
              onClick={moveLeft}
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="bg-yellow-500 text-green-900 p-4 rounded-full shadow-lg"
              onClick={moveRight}
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </>
      )}
      {gameState === 'gameOver' && <GameOverScreen />}
      <ContractInfo />
    </div>
  )
}

export default RunAndEarnUI