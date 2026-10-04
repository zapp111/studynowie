import "./firebase.js";

import { initPlanner } from './session.js';
import { attachQuizEvents } from './quiz.js';
import { initNavigation } from './navigation.js';
import { initProgress } from './progress.js';
import { initAuth } from './auth.js';
import { initAdmin } from "./admin.js";


window.addEventListener("DOMContentLoaded", () => {

  attachQuizEvents();

  initNavigation();

  initAuth();

  initAdmin();

});
