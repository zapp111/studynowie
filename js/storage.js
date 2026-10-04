import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


function getStorageKey() {

  const user = localStorage.getItem("currentUser");

  return user
    ? `study-planner-${user}`
    : "study-planner-guest";

}


export function loadState() {

  try {

    const stored = localStorage.getItem(getStorageKey());

    return stored ? JSON.parse(stored) : {};

  } catch (error) {

    console.warn("Unable to read planner state.", error);

    return {};

  }

}


export async function loadCloudState() {

  const username = localStorage.getItem("currentUser");

  if (!username) {
    return null;
  }

  try {

    const snapshot = await getDoc(
      doc(db, "users", username)
    );

    if (!snapshot.exists()) {
      return null;
    }

    const cloudState = snapshot.data().progress || {};

    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(cloudState)
    );

    return cloudState;

  } catch (error) {

    console.error("Failed to load cloud progress", error);

    return null;

  }

}

export async function saveState(state) {

  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(state)
  );

  const username = localStorage.getItem("currentUser");

  if (!username) return;

  try {

    await setDoc(

      doc(db, "users", username),

      {
        progress: state
      },

      {
        merge: true
      }

    );

  } catch (error) {

    console.error("Failed to save to Firebase", error);

  }

}


export function ensureSubjectState(sessionId, subject, state) {

  if (!state[sessionId]) {

    state[sessionId] = {

      subjects: {}

    };

  }

  if (!state[sessionId].subjects[subject.name]) {

    state[sessionId].subjects[subject.name] = {

      checklist: Array(subject.checklist.length).fill(false),

      quizScore: null,

      completed: false

    };

  }

  return state[sessionId].subjects[subject.name];

}


export function isSessionCompleted(session, state) {

  if (!state[session.id]) {

    return false;

  }

  const subjectStates = Object.values(
    state[session.id].subjects || {}
  );

  if (!subjectStates.length) {

    return false;

  }

  return subjectStates.every(
    subjectState => subjectState.completed
  );

}


export function getOverallProgress(sessions, state) {

  let completed = 0;

  let total = 0;

  sessions.forEach(session => {

    session.subjects.forEach(subject => {

      total++;

      const subjectState =
        state[session.id]?.subjects?.[subject.name];

      if (subjectState?.completed) {

        completed++;

      }

    });

  });

  return {

    completed,

    total,

    percentage: total
      ? Math.round(completed / total * 100)
      : 0

  };

}
