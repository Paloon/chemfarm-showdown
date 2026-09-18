import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_QUESTIONS, QUIZ_COOLDOWN_SECONDS, QUIZ_FAST_LIMIT_MS } from '../data/gameConfig.js'
import { fetchQuestions, recordQuizAttempt } from '../lib/roomApi.js'
import { evaluateQuizAnswer, pickRandomQuizQuestion } from '../utils/quiz.js'

const ATTEMPT_LIMIT_MS = 15000

export function useQuizGame({ playerId, onAward }) {
  const [questions, setQuestions] = useState(DEMO_QUESTIONS)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [roundScore, setRoundScore] = useState(0)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    let active = true
    fetchQuestions()
      .then((data) => {
        if (active && data?.length) setQuestions(data)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!activeQuestion || !startedAt || feedback) return undefined
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt
      setElapsedMs(nextElapsed)
      if (nextElapsed >= ATTEMPT_LIMIT_MS) {
        setFeedback({ correct: false, timedOut: true, fields: {} })
        setCooldown(QUIZ_COOLDOWN_SECONDS)
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [activeQuestion, feedback, startedAt])

  useEffect(() => {
    if (!feedback) return undefined

    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setActiveQuestion(null)
      setStartedAt(null)
      setFeedback(null)
    }, feedback.correct ? 1800 : 1500)

    return () => window.clearTimeout(closeTimerRef.current)
  }, [feedback])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  const openQuiz = useCallback(() => {
    if (cooldown > 0 || !questions.length) return false
    const nextQuestion = pickRandomQuizQuestion(questions)
    setActiveQuestion(nextQuestion)
    setStartedAt(Date.now())
    setElapsedMs(0)
    setFeedback(null)
    return true
  }, [cooldown, questions])

  const closeQuiz = useCallback(() => {
    setCooldown((current) => Math.max(current, QUIZ_COOLDOWN_SECONDS))
    setActiveQuestion(null)
    setStartedAt(null)
    setFeedback(null)
  }, [])

  const submitAnswer = useCallback((answers) => {
    if (!activeQuestion || feedback) return
    const responseTime = Date.now() - startedAt
    const { isCorrect, fieldResults } = evaluateQuizAnswer(activeQuestion, answers)
    const grade = isCorrect ? (responseTime <= QUIZ_FAST_LIMIT_MS ? 'S' : 'A') : null

    setElapsedMs(responseTime)
    setFeedback({ correct: isCorrect, grade, fields: fieldResults })
    setCooldown(QUIZ_COOLDOWN_SECONDS)
    if (isCorrect) {
      setRoundScore((current) => current + 1)
      onAward(grade, responseTime)
    }

    recordQuizAttempt({
      player_id: playerId,
      question_id: activeQuestion.id,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      grade_earned: grade,
      submitted_answer: answers,
    }).catch(() => {})

  }, [activeQuestion, feedback, onAward, playerId, startedAt])

  return {
    activeQuestion,
    elapsedMs,
    cooldown,
    feedback,
    roundScore,
    openQuiz,
    closeQuiz,
    submitAnswer,
    fastLimitMs: QUIZ_FAST_LIMIT_MS,
    attemptLimitMs: ATTEMPT_LIMIT_MS,
  }
}
