import { useEffect, useState } from 'react'
import { EnergyGraphQuestion } from './EnergyGraphQuestion.jsx'
import { RateTableQuestion } from './RateTableQuestion.jsx'

export function QuizModal({ question, elapsedMs, fastLimitMs, attemptLimitMs, feedback, score, onSubmit, onClose }) {
  const isRate = question.type === 'rate_table'
  const [answers, setAnswers] = useState(isRate ? { m: '', n: '' } : { EaForward: '', EaReverse: '' })
  const sTimeLeft = Math.max(0, (fastLimitMs - elapsedMs) / 1000)
  const totalTimeLeft = Math.max(0, (attemptLimitMs - elapsedMs) / 1000)
  const fastProgress = Math.max(0, 1 - elapsedMs / fastLimitMs)
  const canSubmit = Object.values(answers).every((value) => value !== '') && !feedback

  useEffect(() => {
    if (feedback?.timedOut) return
    const submitOnEnter = (event) => {
      if (event.key === 'Enter' && canSubmit) onSubmit(answers)
    }
    window.addEventListener('keydown', submitOnEnter)
    return () => window.removeEventListener('keydown', submitOnEnter)
  }, [answers, canSubmit, feedback?.timedOut, onSubmit])

  const changeAnswer = (key, value) => {
    if (/^-?\d*$/.test(value)) setAnswers((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="modal-backdrop quiz-backdrop">
      <section className="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <header className="quiz-titlebar">
          <h2 id="quiz-title">{isRate ? 'ปริศนาอันดับตาราง' : 'Ea ก่อกัมมันต์'}</h2>
          <button onClick={onClose} aria-label="ปิดโจทย์">×</button>
        </header>
        <div className="quiz-status">
          <div className="quiz-clock">
            <span>⏱</span><strong>{sTimeLeft > 0 ? `${sTimeLeft.toFixed(1)} วิ` : `เกรด A · ${Math.ceil(totalTimeLeft)} วิ`}</strong>
          </div>
          <span>คะแนน: <strong>{score}</strong></span>
        </div>
        <div className="fast-timer"><i style={{ width: `${fastProgress * 100}%` }} /></div>
        <div className="quiz-paper">
          {isRate ? (
            <RateTableQuestion question={question} answers={answers} onChange={changeAnswer} feedback={feedback} />
          ) : (
            <EnergyGraphQuestion question={question} answers={answers} onChange={changeAnswer} feedback={feedback} />
          )}
        </div>
        <div className="quiz-submit-row">
          <button disabled={!canSubmit} onClick={() => onSubmit(answers)}>ส่งคำตอบ</button>
          <small>ตอบใน 5 วินาที รับปุ๋ยเกรด S</small>
        </div>
        {feedback && (
          <div className={`quiz-feedback ${feedback.correct ? 'is-correct' : 'is-wrong'}`}>
            {feedback.correct ? (
              <><span className="feedback-icon">✓</span><strong>ถูกต้อง! ได้ปุ๋ยเกรด {feedback.grade}</strong><Confetti /></>
            ) : (
              <><span className="feedback-icon">×</span><strong>{feedback.timedOut ? 'หมดเวลาแล้ว' : 'ยังไม่ถูก ลองโจทย์ใหม่อีกครั้ง'}</strong></>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
}
