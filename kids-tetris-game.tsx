import React, { useState, useEffect, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-400',
  S: 'bg-green-400',
  Z: 'bg-red-400',
  J: 'bg-blue-400',
  L: 'bg-orange-400'
};

const TetrisGame = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);

  const createNewPiece = useCallback(() => {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      shape: SHAPES[randomShape],
      color: randomShape
    };
  }, []);

  const checkCollision = useCallback((piece, pos, boardState) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && boardState[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    
    return newBoard;
  }, [board, currentPiece, position]);

  const clearLines = useCallback((boardState) => {
    let linesCleared = 0;
    const newBoard = boardState.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;
    
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const newPiece = { ...currentPiece, shape: rotated };
    
    if (!checkCollision(newPiece, position, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, position, board, checkCollision, isPaused, gameOver]);

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;
    
    const newPos = { x: position.x, y: position.y + 1 };
    
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    } else {
      const merged = mergePiece();
      const { newBoard, linesCleared } = clearLines(merged);
      
      setBoard(newBoard);
      setScore(prev => prev + linesCleared * 100 * level);
      
      if (linesCleared > 0 && score > 0 && score % 500 === 0) {
        setLevel(prev => prev + 1);
      }
      
      const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
      
      if (checkCollision(nextPiece, startPos, newBoard)) {
        setGameOver(true);
      } else {
        setCurrentPiece(nextPiece);
        setNextPiece(createNewPiece());
        setPosition(startPos);
      }
    }
  }, [currentPiece, nextPiece, position, board, checkCollision, mergePiece, clearLines, createNewPiece, score, level, isPaused, gameOver]);

  const moveHorizontal = useCallback((direction) => {
    if (!currentPiece || isPaused || gameOver) return;
    
    const newPos = { x: position.x + direction, y: position.y };
    
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, checkCollision, isPaused, gameOver]);

  const drop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;
    
    let newPos = { ...position };
    while (!checkCollision(currentPiece, { x: newPos.x, y: newPos.y + 1 }, board)) {
      newPos.y++;
    }
    setPosition(newPos);
    setTimeout(moveDown, 50);
  }, [currentPiece, position, board, checkCollision, moveDown, isPaused, gameOver]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(createNewPiece());
      setNextPiece(createNewPiece());
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, [currentPiece, createNewPiece, gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const speed = Math.max(200, 1000 - (level - 1) * 100);
    const interval = setInterval(moveDown, speed);
    return () => clearInterval(interval);
  }, [moveDown, gameOver, isPaused, level]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          drop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHorizontal, moveDown, rotatePiece, drop, gameOver]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setNextPiece(null);
    setPosition({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setLevel(1);
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const maxSize = 4;
    const grid = Array(maxSize).fill(null).map(() => Array(maxSize).fill(null));
    
    const offsetY = Math.floor((maxSize - nextPiece.shape.length) / 2);
    const offsetX = Math.floor((maxSize - nextPiece.shape[0].length) / 2);
    
    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          grid[offsetY + y][offsetX + x] = nextPiece.color;
        }
      }
    }
    
    return grid;
  };

  const displayBoard = renderBoard();
  const nextPieceGrid = renderNextPiece();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          🎮 신나는 테트리스! 🎮
        </h1>
        
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div 
              className="border-4 border-purple-400 rounded-lg overflow-hidden shadow-lg"
              style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}
            >
              {displayBoard.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <div
                      key={x}
                      className={`border border-gray-200 ${cell ? COLORS[cell] : 'bg-gray-50'}`}
                      style={{ width: BLOCK_SIZE, height: BLOCK_SIZE }}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => moveHorizontal(-1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                ←
              </button>
              <button
                onClick={rotatePiece}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                ↻
              </button>
              <button
                onClick={() => moveHorizontal(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                →
              </button>
              <button
                onClick={moveDown}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                ↓
              </button>
              <button
                onClick={drop}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                ⬇
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-xl"
              >
                ⏸
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-rose-700 mb-3">🔮 다음 블록</h2>
              <div className="bg-white rounded-lg p-2 border-2 border-rose-300">
                {nextPieceGrid && nextPieceGrid.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => (
                      <div
                        key={x}
                        className={`border border-gray-100 ${cell ? COLORS[cell] : 'bg-gray-50'}`}
                        style={{ width: 22, height: 22 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-orange-700 mb-2">🌟 점수</h2>
              <p className="text-4xl font-bold text-orange-800">{score}</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">🎯 레벨</h2>
              <p className="text-4xl font-bold text-purple-800">{level}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-200 to-teal-200 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-green-700 mb-3">📝 조작법</h2>
              <div className="text-sm text-green-800 space-y-2">
                <p>⬅️➡️ 좌우 이동</p>
                <p>⬆️ 회전</p>
                <p>⬇️ 빠르게 내리기</p>
                <p>스페이스 한번에 떨어뜨리기</p>
                <p>P 일시정지</p>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-2xl text-xl shadow-lg transform hover:scale-105 transition"
            >
              🔄 새 게임
            </button>
          </div>
        </div>
        
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center transform scale-110">
              <h2 className="text-5xl font-bold text-red-600 mb-4">게임 오버!</h2>
              <p className="text-3xl font-bold text-gray-700 mb-6">최종 점수: {score}</p>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-2xl text-2xl shadow-lg"
              >
                다시 도전하기! 🎮
              </button>
            </div>
          </div>
        )}
        
        {isPaused && !gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center">
              <h2 className="text-5xl font-bold text-purple-600 mb-4">⏸ 일시정지</h2>
              <p className="text-2xl text-gray-700">P를 눌러서 계속하기</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TetrisGame;