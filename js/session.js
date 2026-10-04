import { loadState, loadCloudState, saveState, ensureSubjectState, isSessionCompleted, getOverallProgress } from './storage.js';
import { closeQuizModal, openQuizModal } from './quiz.js';

let sessions = [];
let quizzes = {};
let appState = loadState();
let activeSessionId = null;
let activeSubjectName = null;
const studentName = "Joyuu";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function sortSessions(sessionList) {
  return [...sessionList].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getSessionById(sessionId) {
  return sessions.find((session) => session.id === sessionId) || null;
}

function getCurrentSessionIndex(sessionList) {
  const todayValue = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  const currentIndex = sessionList.findIndex((session) => {
    const sessionDate = new Date(session.date).getTime();
    return sessionDate <= todayValue && !isSessionCompleted(session, appState);
  });

  if (currentIndex !== -1) {
    return currentIndex;
  }

  const firstIncompleteIndex = sessionList.findIndex((session) => !isSessionCompleted(session, appState));
  return firstIncompleteIndex === -1 ? sessionList.length - 1 : firstIncompleteIndex;
}

function renderDashboard(sessionList) {
  const greetingElement = document.getElementById('greeting');
  const summaryElement = document.getElementById('dashboard-summary');
  const sessionListElement = document.getElementById('session-list');
  const progress = getOverallProgress(sessionList, appState);
  const currentIndex = getCurrentSessionIndex(sessionList);

  greetingElement.textContent = `${getGreeting()}, ${studentName}`;
  summaryElement.innerHTML = `
    <div class="summary-card">
      <p class="eyebrow">Current session</p>
      <strong>${sessionList[currentIndex]?.sessionNumber ? `Session ${sessionList[currentIndex].sessionNumber}` : 'No sessions'}</strong>
    </div>
    <div class="summary-card">
      <p class="eyebrow">Overall progress</p>
      <strong>${progress.completed}/${progress.total} subjects completed</strong>
    </div>
  `;

  sessionListElement.innerHTML = sessionList
    .map((session, index) => {
      const completed = isSessionCompleted(session, appState);
      const locked = index > currentIndex && !completed;
      const badgeClass = completed ? 'status-pill--done' : locked ? 'status-pill--locked' : 'status-pill--progress';
      const badgeLabel = completed ? 'Completed' : locked ? 'Locked' : 'In progress';

      return `
        <article class="session-card">
          <div class="session-card__top">
            <div>
              <p class="eyebrow">Session ${session.sessionNumber}</p>
              <h3>${new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</h3>
              <p>${session.focusTopics.join(', ')}</p>
            </div>
            <span class="status-pill ${badgeClass}">${badgeLabel}</span>
          </div>
          <p>${completed ? 'All subjects are complete.' : 'Continue where you left off.'}</p>
          <button type="button" class="session-open-btn" data-session-id="${session.id}" ${locked ? 'disabled' : ''}>
            ${locked ? 'Locked' : completed ? 'Reopen' : 'Open'}
          </button>
        </article>
      `;
    })
    .join('');
}

function renderSessionView(session) {
  if (!session) {
    return;
  }

  const headerElement = document.getElementById('session-header');
  const contentElement = document.getElementById('session-content');
  const completed = isSessionCompleted(session, appState);
  const subjectMarkup = session.subjects
    .map((subject) => {
      const subjectState = ensureSubjectState(session.id, subject, appState);
      const checklistComplete = subjectState.checklist.every(Boolean);
      const quizScore = subjectState.quizScore;
      const quizReady = checklistComplete;
      const subjectCompleted = checklistComplete && quizScore !== null;

      return `
        <article class="subject-card">
          <div class="subject-card__title">
            <h3>${subject.name}</h3>
            <span class="status-pill ${subjectCompleted ? 'status-pill--done' : checklistComplete ? 'status-pill--progress' : 'status-pill--locked'}">
              ${subjectCompleted ? 'Completed' : checklistComplete ? 'Ready for quiz' : 'In progress'}
            </span>
          </div>
          <p><strong>Chapter:</strong> ${subject.chapterName}</p>
          <p><strong>Focus topic:</strong> ${subject.focusTopic}</p>
          <ul class="checklist">
            ${subject.checklist
              .map((item, index) => {
                const checked = subjectState.checklist[index];
                return `
                  <li>
                    <label>
                      <input type="checkbox" class="checklist-item" data-session-id="${session.id}" data-subject-name="${subject.name}" data-index="${index}" ${checked ? 'checked' : ''} />
                      <span>${item}</span>
                    </label>
                  </li>
                `;
              })
              .join('')}
          </ul>
          <div class="resources">
            ${subject.resources
              .map(
                (resource) => `
                  <a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.label}</a>
                `
              )
              .join('')}
          </div>
          <button type="button" class="subject-quiz-btn" data-session-id="${session.id}" data-subject-name="${subject.name}" ${quizReady ? '' : 'disabled'}>
            ${quizScore !== null ? 'Retake Quiz' : 'Start Quiz'}
          </button>
          ${quizScore !== null ? `<p class="score-display">Last score: ${quizScore}%</p>` : ''}
        </article>
      `;
    })
    .join('');

  headerElement.innerHTML = `
    <div>
      <p class="eyebrow">Study Session</p>
      <h2>Session ${session.sessionNumber}</h2>
      <p>${new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
    </div>
    <div>
      <p class="eyebrow">Focus topics</p>
      <p>${session.focusTopics.join(' • ')}</p>
      <p><strong>Status:</strong> ${completed ? 'Completed' : 'In progress'}</p>
    </div>
  `;
  contentElement.innerHTML = subjectMarkup;
}

function renderSubjectView(session, subjectName) {
  if (!session) {
    return;
  }

  const subject = session.subjects.find(
    (entry) => entry.name === subjectName
  );

  if (!subject) {
    return;
  }

  const headerElement = document.getElementById('session-header');
  const contentElement = document.getElementById('session-content');

  const completed = isSessionCompleted(session, appState);

  const subjectState = ensureSubjectState(session.id, subject, appState);
  const checklistComplete = subjectState.checklist.every(Boolean);
  const quizScore = subjectState.quizScore;
  const quizReady = checklistComplete;
  const subjectCompleted = checklistComplete && quizScore !== null;

  const subjectMarkup = `
    <article class="subject-card">
      <div class="subject-card__title">
        <h3>${subject.name}</h3>
        <span class="status-pill ${
          subjectCompleted
            ? 'status-pill--done'
            : checklistComplete
            ? 'status-pill--progress'
            : 'status-pill--locked'
        }">
          ${
            subjectCompleted
              ? 'Completed'
              : checklistComplete
              ? 'Ready for quiz'
              : 'In progress'
          }
        </span>
      </div>

      <p><strong>Chapter:</strong> ${subject.chapterName}</p>
      <p><strong>Focus topic:</strong> ${subject.focusTopic}</p>

      <ul class="checklist">
        ${subject.checklist
          .map((item, index) => {
            const checked = subjectState.checklist[index];

            return `
              <li>
                <label>
                  <input
                    type="checkbox"
                    class="checklist-item"
                    data-session-id="${session.id}"
                    data-subject-name="${subject.name}"
                    data-index="${index}"
                    ${checked ? 'checked' : ''}
                  />
                  <span>${item}</span>
                </label>
              </li>
            `;
          })
          .join('')}
      </ul>

      <div class="resources">
        ${subject.resources
          .map(
            (resource) => `
              <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
                ${resource.label}
              </a>
            `
          )
          .join('')}
      </div>

      <button
        type="button"
        class="subject-quiz-btn"
        data-session-id="${session.id}"
        data-subject-name="${subject.name}"
        ${quizReady ? '' : 'disabled'}
      >
        ${quizScore !== null ? 'Retake Quiz' : 'Start Quiz'}
      </button>

      ${
        quizScore !== null
          ? `<p class="score-display">Last score: ${quizScore}%</p>`
          : ''
      }
    </article>
  `;

  headerElement.innerHTML = `
    <div>
      <button class="primary-btn" id="back-to-overview">← Back</button>
      <p class="eyebrow">Study Session</p>
      <h2>Session ${session.sessionNumber}</h2>
      <p>${new Date(session.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}</p>
    </div>

    <div>
      <p class="eyebrow">Focus topics</p>
      <p>${session.focusTopics.join(' • ')}</p>
      <p><strong>Status:</strong> ${
        completed ? 'Completed' : 'In progress'
      }</p>
    </div>
  `;

  contentElement.innerHTML = subjectMarkup;
}

function getSubjectIcon(subjectName) {

  switch (subjectName) {

    case 'Mathematics':
      return '📘';

    case 'Science':
      return '🧪';

    case 'Social Science':
      return '🌍';

    case 'English':
      return '📖';

    case 'Hindi':
      return '🇮🇳';

    default:
      return '📚';

  }

}

function renderSessionOverview(session) {
  if (!session) {
    return;
  }

  const headerElement = document.getElementById('session-header');
  const contentElement = document.getElementById('session-content');

  headerElement.innerHTML = `
    <div>
      <button class="primary-btn" id="back-to-session-list">← Back</button>
      <p class="eyebrow">Study Session</p>
      <h2>Session ${session.sessionNumber}</h2>
      <p>Select a subject to continue.</p>
    </div>
  `;

  contentElement.innerHTML = session.subjects
    .map(
      (subject) => {

        const subjectState = ensureSubjectState(session.id, subject, appState);

        const checklistComplete = subjectState.checklist.every(Boolean);

        const quizScore = subjectState.quizScore;

        const subjectCompleted =
            checklistComplete && quizScore !== null;

        let status = "Not Started";
        let statusClass = "status-not-started";

        if (subjectCompleted) {

            status = "Completed";
            statusClass = "status-completed";

        } else if (subjectState.checklist.some(Boolean)) {

            status = "In Progress";
            statusClass = "status-progress";

        }

        return `

        <article
            class="subject-card subject-select-card open-subject-btn"
            data-subject-name="${subject.name}">

            <div class="subject-card-row">

                <div>

                    <h3>${getSubjectIcon(subject.name)} ${subject.name}</h3>

                    <p>${subject.chapterName}</p>

                    <span class="subject-status ${statusClass}">${status}</span>

                </div>

                <span class="subject-arrow">➜</span>

            </div>

        </article>
      `
      }
    )
    .join('');
}

function render() {
  const orderedSessions = sortSessions(sessions);

  if (!orderedSessions.length) {
    return;
  }

  if (!activeSessionId) {
    activeSessionId = orderedSessions[0].id;
  }

  const activeSession = getSessionById(activeSessionId) || orderedSessions[0];
  activeSessionId = activeSession.id;

  renderDashboard(orderedSessions);

  if (activeSubjectName) {
    renderSubjectView(activeSession, activeSubjectName);
  } else {
    renderSessionOverview(activeSession);
  }
}

function handleSessionClick(event) {
  const openButton = event.target.closest('.session-open-btn');

  if (!openButton) {
    return;
  }

  activeSessionId = openButton.dataset.sessionId;

  const session = getSessionById(activeSessionId);
  activeSubjectName = null;

  document.getElementById('session-list').style.display = 'none';
  document.getElementById('session-header').style.display = 'block';
  document.getElementById('session-content').style.display = 'grid';

  renderSessionOverview(session);
}

function handleSubjectClick(event) {
  const button = event.target.closest('.open-subject-btn');

  if (!button) {
    return;
  }

  const session = getSessionById(activeSessionId);

  activeSubjectName = button.dataset.subjectName;

  renderSubjectView(session, activeSubjectName);
}

function handleBackButtons(event) {

 if (event.target.id === 'back-to-overview') {

    activeSubjectName = null;

    const session = getSessionById(activeSessionId);

    renderSessionOverview(session);

    return;
}

  if (event.target.id === 'back-to-session-list') {

    activeSubjectName = null;

    document.getElementById('session-list').style.display = 'grid';
    document.getElementById('session-header').style.display = 'none';
    document.getElementById('session-content').style.display = 'none';

    return;
  }

}

function handleChecklistChange(event) {
  if (!event.target.classList.contains('checklist-item')) {
    return;
  }

  const sessionId = event.target.dataset.sessionId;
  const subjectName = event.target.dataset.subjectName;
  const index = Number(event.target.dataset.index);
  const subject = getSessionById(sessionId)?.subjects.find((entry) => entry.name === subjectName);

  if (!subject) {
    return;
  }

  const subjectState = ensureSubjectState(sessionId, subject, appState);
  subjectState.checklist[index] = event.target.checked;
  subjectState.completed = subjectState.checklist.every(Boolean) && subjectState.quizScore !== null;
  saveState(appState);
  render();
}

function handleQuizStart(event) {
  const button = event.target.closest('.subject-quiz-btn');
  if (!button) {
    return;
  }

  const sessionId = button.dataset.sessionId;
  const subjectName = button.dataset.subjectName;
  const session = getSessionById(sessionId);
  const subject = session?.subjects.find((entry) => entry.name === subjectName);
  const quizQuestions = quizzes[sessionId]?.[subjectName];

  if (!session || !subject || !quizQuestions) {
    return;
 }

  openQuizModal(sessionId, subjectName, subject, quizQuestions, appState, () => {
    render();
  });
}

export async function initPlanner() {
  try {
    const [sessionsResponse, quizzesResponse] = await Promise.all([
      fetch('./data/sessions.json'),
      fetch('./data/quizzes.json'),
    ]);

    if (!sessionsResponse.ok || !quizzesResponse.ok) {
      throw new Error('Planner data could not be loaded.');
    }

    sessions = await sessionsResponse.json();
    quizzes = await quizzesResponse.json();
    const cloudState = await loadCloudState();

    appState = cloudState || loadState();
    render();
  } catch (error) {
    document.getElementById('session-content').innerHTML = '<p>Unable to load planner data. Please refresh and try again.</p>';
    console.error(error);
  }
}

document.addEventListener('click', (event) => {
  handleSessionClick(event);
  handleSubjectClick(event);
  handleBackButtons(event);
  handleQuizStart(event);
});

document.addEventListener('change', (event) => {
  handleChecklistChange(event);
});
