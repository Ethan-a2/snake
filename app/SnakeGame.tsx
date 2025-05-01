"use client";

import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const SNAKE_START = [{ x: 8, y: 8 }];
const PLAYER_NAME_START = "";
const APPLE_START = { x: 12, y: 12 };
const DIRECTION_START = { x: 1, y: 0 };
const SPEED = 200;

const SnakeGame = () => {
  const [playerName, setPlayerName] = useState(PLAYER_NAME_START);
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [direction, setDirection] = useState(DIRECTION_START);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const getRandomPosition = () => {
    let newX: number, newY: number;
    do {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
    } while (snake.some(segment => segment.x === newX && segment.y === newY));
    return { x: newX, y: newY };
  };

  const moveSnake = () => {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    let newSnake = [head, ...snake.slice(0, -1)];
    if (head.x === apple.x && head.y === apple.y) {
      setApple(getRandomPosition());
      newSnake = [head, ...snake];
      setScore(prevScore => prevScore + 1);
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [snake, direction, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    (canvas as HTMLCanvasElement).width = GRID_SIZE * 20;
    (canvas as HTMLCanvasElement).height = GRID_SIZE * 20;

    ctx.clearRect(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);

    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * 20, apple.y * 20, 20, 20);

    ctx.fillStyle = 'green';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
  }, [snake, apple, gameOver]);

  const resetGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDirection(DIRECTION_START);
    setGameOver(false);
    setScore(0);
    saveScore();
  };

  const saveScore = async () => {
    try {
      const response = await fetch('/api/save-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName,
          score: score,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  return (
    <div>
      <h1>Snake Game</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <canvas ref={canvasRef} />
      <p>Score: {score}</p>
      {gameOver && (
        <div>
          <p>Game Over! Your score: {score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
