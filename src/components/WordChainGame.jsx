"use client"

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Timer, Trophy } from 'lucide-react';

const startWords = [
  "apple", "beach", "cloud", "dance", "earth", "flame", "green", "heart",
  "image", "juice", "kite", "light", "music", "night", "ocean", "peace",
  "quiet", "river", "storm", "table", "until", "voice", "water", "youth"
];

const INITIAL_LETTER_LIMITS = {
  a: 3, b: 2, c: 2, d: 2, e: 3, f: 2, g: 2, h: 2, i: 3, j: 1, k: 1, l: 2,
  m: 2, n: 2, o: 3, p: 2, q: 1, r: 2, s: 2, t: 2, u: 2, v: 1, w: 2, x: 1,
  y: 1, z: 1
};

const LetterLimit = ({ letter, remaining, total, isRequired, multiplier }) => {
  const getColor = () => {
    if (remaining === 0) return 'bg-red-200 border-red-300';
    if (remaining === 1) return 'bg-yellow-200 border-yellow-300';
    return 'bg-green-200 border-green-300';
  };

  const getMultiplierStyle = () => {
    if (!multiplier) return '';
    return multiplier === 2 ? 'bg-blue-500' : 'bg-purple-500';
  };

  return (
    <div className={`
      relative flex flex-col items-center p-1 rounded-lg border
      ${getColor()}
      ${isRequired ? 'ring-2 ring-blue-400' : ''}
      transition-all duration-300
    `}>
      <div className="text-sm font-bold">{letter.toUpperCase()}</div>
      <div className="text-xs font-medium">{remaining}/{total}</div>
      {multiplier && remaining > 0 && (
        <div className={`
          absolute -top-2 -right-2 w-5 h-5 rounded-full 
          ${getMultiplierStyle()} text-white text-xs
          flex items-center justify-center font-bold
          border-2 border-white
        `}>
          {multiplier}x
        </div>
      )}
    </div>
  );
};

const letterRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

const generateMultipliers = (currentLetterLimits) => {
  const multipliers = {};
  const availableLetters = Object.entries(currentLetterLimits)
    .filter(([_, remaining]) => remaining > 0)
    .map(([letter]) => letter);
  
  if (availableLetters.length === 0) return multipliers;
  
  const numTwoX = Math.min(2, availableLetters.length);
  for (let i = 0; i < numTwoX; i++) {
    const index = Math.floor(Math.random() * availableLetters.length);
    multipliers[availableLetters[index]] = 2;
    availableLetters.splice(index, 1);
  }
  
  if (availableLetters.length > 0) {
    const index = Math.floor(Math.random() * availableLetters.length);
    multipliers[availableLetters[index]] = 3;
  }
  
  return multipliers;
};

const WordChainGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [wordChain, setWordChain] = useState([]);
  const [timer, setTimer] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [letterLimits, setLetterLimits] = useState({});
  const [multipliers, setMultipliers] = useState({});
  const [lastScoreInfo, setLastScoreInfo] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setGameOver(true);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const calculateScore = (word, timeLeft) => {
    const lastLetter = word[word.length - 1].toLowerCase();
    const multiplier = multipliers[lastLetter] || 1;
    
    let points = word.length * 2;
    const timeBonus = Math.floor(timeLeft * 1.5);
    points += timeBonus;
    
    const firstLetter = word[0].toLowerCase();
    const remainingUses = letterLimits[firstLetter] - 1;
    if (remainingUses === 0) points += 15;
    else if (remainingUses === 1) points += 5;
    
    const finalPoints = points * multiplier;
    
    setLastScoreInfo({
      word,
      basePoints: word.length * 2,
      timeBonus,
      multiplier,
      multiplierLetter: multiplier > 1 ? lastLetter : null,
      total: finalPoints
    });

    return finalPoints;
  };

  const startGame = () => {
    const randomWord = startWords[Math.floor(Math.random() * startWords.length)];
    const initialLimits = {...INITIAL_LETTER_LIMITS};
    const firstLetter = randomWord[0].toLowerCase();
    initialLimits[firstLetter]--;
    
    setWordChain([randomWord]);
    setLetterLimits(initialLimits);
    setCurrentWord('');
    setTimer(10);
    setIsActive(true);
    setGameOver(false);
    setError('');
    setScore(0);
    setMultipliers(generateMultipliers(initialLimits));
    setLastScoreInfo(null);
  };

  const validateWord = (word) => {
    return /^[a-zA-Z]+$/.test(word);
  };

  const submitWord = () => {
    setIsSubmitting(true);
    const word = currentWord.toLowerCase();
    
    if (!validateWord(word)) {
      setError('Word can only contain letters');
      setIsSubmitting(false);
      return;
    }

    if (word.length < 3) {
      setError('Word must be at least 3 letters long');
      setIsSubmitting(false);
      return;
    }

    if (wordChain.includes(word)) {
      setError('Word has already been used');
      setIsSubmitting(false);
      return;
    }

    const lastWord = wordChain[wordChain.length - 1];
    if (word[0] !== lastWord[lastWord.length - 1]) {
      setError(`Word must start with "${lastWord[lastWord.length - 1].toUpperCase()}"`);
      setIsSubmitting(false);
      return;
    }

    const firstLetter = word[0];
    if (letterLimits[firstLetter] === 0) {
      setError(`No more uses remaining for letter "${firstLetter.toUpperCase()}"`);
      setIsSubmitting(false);
      return;
    }

    const lastLetterOfNewWord = word[word.length - 1];
    const updatedLimits = {
      ...letterLimits,
      [firstLetter]: letterLimits[firstLetter] - 1
    };

    if (letterLimits[lastLetterOfNewWord] === 0) {
      setLetterLimits(updatedLimits);
      const newScore = calculateScore(word, timer);
      setScore(prevScore => {
        const updatedScore = prevScore + newScore;
        setHighScore(Math.max(updatedScore, highScore));
        return updatedScore;
      });

      setWordChain(prev => [...prev, word]);
      setGameOver(true);
      setIsActive(false);
      setIsSubmitting(false);
      return;
    }

    setLetterLimits(updatedLimits);
    const newScore = calculateScore(word, timer);
    setScore(prevScore => {
      const updatedScore = prevScore + newScore;
      setHighScore(Math.max(updatedScore, highScore));
      return updatedScore;
    });

    setWordChain(prev => [...prev, word]);
    setCurrentWord('');
    setTimer(10);
    setError('');
    setIsSubmitting(false);
    setMultipliers(generateMultipliers(updatedLimits));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitWord();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };

  const getRequiredLetter = () => {
    if (!isActive || wordChain.length === 0) return null;
    const lastWord = wordChain[wordChain.length - 1];
    return lastWord[lastWord.length - 1];
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5" />
          Word Chain Game
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">High Score: {highScore}</div>
            <div className="text-sm font-bold">Score: {score}</div>
          </div>

          {lastScoreInfo && isActive && (
            <div className="text-sm text-center bg-blue-50 p-2 rounded-lg">
              <div>
                {lastScoreInfo.word}
                {lastScoreInfo.multiplier > 1 && (
                  <span className="font-bold text-blue-600">
                    {` → ${lastScoreInfo.multiplier}x bonus (${lastScoreInfo.multiplierLetter.toUpperCase()})`}
                  </span>
                )}
                = {lastScoreInfo.total} points
              </div>
            </div>
          )}

          {isActive && (
            <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-center text-sm mb-2">
                <span className="font-bold">Required letter: </span>
                <span className="text-blue-600">{getRequiredLetter()?.toUpperCase()}</span>
                - End words with highlighted letters for multipliers!
              </div>
              {letterRows.map((row, index) => (
                <div key={index} className="flex justify-center gap-1">
                  {row.map(letter => (
                    <LetterLimit 
                      key={letter}
                      letter={letter}
                      remaining={letterLimits[letter]}
                      total={INITIAL_LETTER_LIMITS[letter]}
                      isRequired={letter === getRequiredLetter()}
                      multiplier={multipliers[letter]}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {!isActive && !gameOver && (
            <Button 
              onClick={startGame}
              className="w-full"
            >
              Start Game
            </Button>
          )}

          {isActive && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Timer className="w-4 h-4" />
                <span className="text-lg font-bold">{timer}s</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter a word starting with "${getRequiredLetter()?.toUpperCase()}"`}
                  className="w-full"
                  autoFocus
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || currentWord.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {gameOver && (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold">Game Over!</h3>
              <p>Chain Length: {wordChain.length} words</p>
              <p>Final Score: {score}</p>
              <p className="text-sm">
                {score === highScore && score > 0 ? "🎉 New High Score! 🎉" : ""}
              </p>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          )}

          {wordChain.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Your Chain:</h3>
              <p className="text-sm">
                {wordChain.join(' → ')}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>Scoring:</p>
            <ul className="list-disc pl-4">
              <li>Base points = word length × 2</li>
              <li>Speed bonus = up to 15 points</li>
              <li>Last letter use = 15 bonus points</li>
              <li>Low remaining uses = 5 bonus points</li>
              <li>Bonus multipliers: 2x or 3x (blue/purple)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordChainGame;
