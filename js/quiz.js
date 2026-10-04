import { ensureSubjectState, saveState } from './storage.js';

let quizState = null;

function getQuizMarkup(subjectName, questions) {
  return `
    <form id="quiz-form">
      ${questions
        .map(
          (question, index) => `
            <div class="quiz-question">
              <p><strong>${index + 1}. ${question.question}</strong></p>
              ${question.options
                .map(
                  (option, optionIndex) => `
                    <label class="option">
                      <input type="radio" name="q${index}" value="${optionIndex}" />
                      <span>${option}</span>
                    </label>
                  `
                )
                .join('')}
            </div>
          `
        )
        .join('')}
      <button type="submit" class="secondary-btn">Submit Quiz</button>
    </form>
  `;
}

function showResults(subjectName, questions, answers, appState, onComplete) {
  const quizBody = document.getElementById('quiz-body');

  const correctCount = questions.reduce((count, question, index) => {
    return count + (Number(answers[index]) === Number(question.correctAnswer) ? 1 : 0);
  }, 0);

  const score = Math.round((correctCount / questions.length) * 100);

  const subjectState = ensureSubjectState(
    quizState.sessionId,
    quizState.subject,
    appState
  );

  subjectState.quizScore = score;
  subjectState.completed =
    subjectState.checklist.every(Boolean) && subjectState.quizScore !== null;

  saveState(appState);

  quizBody.innerHTML = `
    <div class="quiz-results">
      <h4>Quiz complete</h4>

      <p>
        Score:
        <strong>${correctCount}/${questions.length}</strong>
        (${score}%)
      </p>

      <ul class="quiz-review">
        ${questions
          .map((question, index) => {
            const selected = Number(answers[index]);
            const correct = Number(question.correctAnswer);
            const isCorrect = selected === correct;

            return `
              <li class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                <strong>
                  ${isCorrect ? '✓ Correct' : '✗ Wrong'}
                </strong>

                <p>${question.question}</p>

                <p>
                  <small>
                    Your answer:
                    ${
                      selected >= 0
                        ? question.options[selected]
                        : "Not answered"
                    }
                  </small>
                </p>

                ${
                  !isCorrect
                    ? `
                      <p>
                        <small>
                          Correct answer:
                          ${question.options[correct]}
                        </small>
                      </p>
                    `
                    : ""
                }
              </li>
            `;
          })
          .join('')}
      </ul>

      <button type="button" class="secondary-btn" data-action="close-quiz">
        Close
      </button>
    </div>
  `;

  if (typeof onComplete === 'function') {
    onComplete();
  }
}

export function openQuizModal(sessionId, subjectName, subject, quizQuestions, appState, onComplete) {
  quizState = { sessionId, subjectName, subject, quizQuestions, appState, onComplete };
  const quizBody = document.getElementById('quiz-body');
  const modal = document.getElementById('quiz-modal');
  const title = document.getElementById('quiz-title');

  title.textContent = `${subjectName} Quiz`;
  quizBody.innerHTML = getQuizMarkup(subjectName, quizQuestions);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  quizBody.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const answers = quizQuestions.map((_, index) => formData.get(`q${index}`) ?? '-1');
    showResults(subjectName, quizQuestions, answers, appState, onComplete);
  });
}

export function closeQuizModal() {
  const modal = document.getElementById('quiz-modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('quiz-body').innerHTML = '';
}

export function attachQuizEvents() {
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close-quiz"]')) {
      closeQuizModal();
    }
  });
}
