import { loadState, getOverallProgress } from './storage.js';

let sessions = [];
let appState = loadState();

function getChecklistProgress(subject, state) {
  if (!state?.checklist?.length) {
    return 0;
  }

  const completedTasks = state.checklist.filter(Boolean).length;
  return Math.round((completedTasks / state.checklist.length) * 100);
}

function renderProgressBar(percentage) {
  return `
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: ${percentage}%"></div>
    </div>
    <small>${percentage}% complete</small>
  `;
}

function renderProgress() {
  const overallElement = document.getElementById('overall-progress');
  const sessionElement = document.getElementById('session-progress-list');
  const quizElement = document.getElementById('quiz-progress-list');

  const progress = getOverallProgress(sessions, appState);

  overallElement.innerHTML = `
    <details class="progress-dropdown">

      <summary>
        <span>📊 Overall Progress</span>
        <span>${progress.percentage}%</span>
      </summary>

      <div class="dropdown-content">

        <h2>${progress.percentage}%</h2>

        ${renderProgressBar(progress.percentage)}

        <p>${progress.completed}/${progress.total} subjects completed</p>

      </div>

    </details>
  `;


  sessionElement.innerHTML = `
    <details class="progress-dropdown">

      <summary>
        <span>📚 Study Sessions</span>
        <span>${sessions.length} Sessions</span>
      </summary>


      <div class="dropdown-content">

        ${sessions.map((session) => {

          const subjects = session.subjects.map((subject) => {

            const state = appState[session.id]?.subjects?.[subject.name];

            const subjectProgress = getChecklistProgress(subject, state);
            const score = state?.quizScore;


            return `
              <details class="progress-dropdown subject-dropdown">

                <summary>
                  <span>${subject.name}</span>
                  <span>${subjectProgress}%</span>
                </summary>


                <div class="dropdown-content">

                  <p>
                    <strong>Chapter:</strong>
                    ${subject.chapterName}
                  </p>


                  <p>
                    <strong>Focus:</strong>
                    ${subject.focusTopic}
                  </p>


                  ${renderProgressBar(subjectProgress)}


                  <p>
                    ${
                      state?.completed
                      ? "✅ Completed"
                      : subjectProgress > 0
                      ? "⏳ In Progress"
                      : "⚪ Not Started"
                    }
                  </p>


                  <p>
                    <strong>Quiz Score:</strong>

                    ${
                      score !== null && score !== undefined
                      ? `${score}%`
                      : "Not attempted"
                    }

                  </p>


                  <p>
                    <strong>Tasks:</strong>
                    ${
                      state?.checklist
                      ? `${state.checklist.filter(Boolean).length}/${state.checklist.length} completed`
                      : "0/0"
                    }
                  </p>


                </div>

              </details>
            `;

          }).join("");


          return `
            <details class="progress-dropdown">

              <summary>
                <span>Session ${session.sessionNumber}</span>
                <span>${session.date}</span>
              </summary>


              <div class="dropdown-content">

                ${subjects}

              </div>


            </details>
          `;


        }).join("")}

      </div>

    </details>
  `;


  quizElement.innerHTML = "";
}


export async function initProgress() {
  try {
    const response = await fetch('./data/sessions.json');

    if (!response.ok) {
      throw new Error("Could not load sessions");
    }

    sessions = await response.json();
    appState = loadState();

    renderProgress();

  } catch(error) {
    console.error(error);
  }
}