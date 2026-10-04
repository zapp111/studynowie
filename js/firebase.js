import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

  apiKey: "AIzaSyAJjn-hJk7DN60OVnqhhE8CPbDEcSQ-IqI",

  authDomain: "study-planner-f8428.firebaseapp.com",

  projectId: "study-planner-f8428",

  storageBucket: "study-planner-f8428.firebasestorage.app",

  messagingSenderId: "429126591654",

  appId: "1:429126591654:web:3f64c68a5fe4c864078067"

};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
