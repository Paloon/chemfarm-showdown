export function pickRandomQuizQuestion(questions, random = Math.random) {
  if (!questions.length) return null

  const question = questions[Math.floor(random() * questions.length)]
  const answerFields = Object.keys(question.answer)
  const askedField = answerFields[Math.floor(random() * answerFields.length)]

  return { ...question, askedField }
}

export function createQuizAnswers(question) {
  return { [question.askedField]: '' }
}

export function evaluateQuizAnswer(question, answers) {
  const askedField = question.askedField
  const correct = Number(answers[askedField]) === Number(question.answer[askedField])

  return {
    isCorrect: correct,
    fieldResults: { [askedField]: correct },
  }
}
