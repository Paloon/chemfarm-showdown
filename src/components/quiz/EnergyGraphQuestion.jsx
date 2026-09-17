export function EnergyGraphQuestion({ question, answers, onChange, feedback }) {
  const { reactantEnergy, peakEnergy, productEnergy } = question.question_data
  const maxEnergy = Math.max(peakEnergy * 1.18, 120)
  const y = (energy) => 188 - (energy / maxEnergy) * 145
  const reactantY = y(reactantEnergy)
  const peakY = y(peakEnergy)
  const productY = y(productEnergy)
  const path = `M 35 ${reactantY} C 80 ${reactantY}, 96 ${peakY}, 145 ${peakY} C 190 ${peakY}, 190 ${productY}, 255 ${productY}`

  return (
    <div className="energy-question">
      <p className="question-prompt">คำนวณพลังงานก่อกัมมันต์</p>
      <div className="energy-chart">
        <svg viewBox="0 0 290 225" role="img" aria-label="กราฟพลังงานของปฏิกิริยา">
          <defs><linearGradient id="energyLine" x1="0" x2="1"><stop stopColor="#76d2ed" /><stop offset=".55" stopColor="#f7c15a" /><stop offset="1" stopColor="#f16d4c" /></linearGradient></defs>
          <path className="chart-axis" d="M 24 14 V 198 H 278 M 19 22 L 24 12 L 29 22 M 269 193 L 279 198 L 269 203" />
          <path className="chart-grid" d="M 25 53 H 272 M 25 93 H 272 M 25 133 H 272 M 25 173 H 272" />
          <path className="energy-line" d={path} />
          <line className="level-line" x1="30" y1={reactantY} x2="75" y2={reactantY} />
          <line className="level-line" x1="218" y1={productY} x2="272" y2={productY} />
          <text x="32" y={reactantY - 8}>{reactantEnergy} kJ</text>
          <text x="31" y={reactantY + 17}>สารตั้งต้น</text>
          <text x="132" y={Math.max(18, peakY - 9)}>{peakEnergy} kJ</text>
          <text x="218" y={productY - 8}>{productEnergy} kJ</text>
          <text x="218" y={productY + 17}>ผลิตภัณฑ์</text>
          <text className="axis-label" x="196" y="218">พลังงาน (kJ)</text>
          <text className="axis-label" x="-138" y="12" transform="rotate(-90)">พลังงานศักย์</text>
        </svg>
      </div>
      <div className="answer-grid energy-answers">
        <label className={feedback?.fields?.EaForward === false ? 'is-wrong' : feedback?.fields?.EaForward ? 'is-correct' : ''}>
          <span>Ea ไปข้างหน้า (kJ):</span>
          <span className="answer-input"><input autoFocus inputMode="numeric" pattern="-?[0-9]*" value={answers.EaForward} onChange={(event) => onChange('EaForward', event.target.value)} /><i /></span>
        </label>
        <label className={feedback?.fields?.EaReverse === false ? 'is-wrong' : feedback?.fields?.EaReverse ? 'is-correct' : ''}>
          <span>Ea ย้อนกลับ (kJ):</span>
          <span className="answer-input"><input inputMode="numeric" pattern="-?[0-9]*" value={answers.EaReverse} onChange={(event) => onChange('EaReverse', event.target.value)} /><i /></span>
        </label>
      </div>
    </div>
  )
}
