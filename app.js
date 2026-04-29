import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 여기에 당신 config 넣기
const firebaseConfig = {
  apiKey: "AIzaSyBI1azkUClqu8M_kemltMfPQwlFQuG6Yr4",
  authDomain: "bearhouse-gom3.firebaseapp.com",
  projectId: "bearhouse-gom3",
  storageBucket: "bearhouse-gom3.firebasestorage.app",
  messagingSenderId: "656131928299",
  appId: "1:656131928299:web:d1cf4a5476182b8bc94eae"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUser = null;

// 로그인
window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  currentUser = userCredential.user;

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("user").innerText = email;

  loadData();
};

// 데이터 추가
window.addEvent = async () => {
  const text = document.getElementById("text").value;

  await addDoc(collection(db, "calendarEvents"), {
    text: text,
    createdBy: currentUser.uid,
    createdAt: new Date()
  });

  loadData();
};

// 데이터 불러오기
async function loadData() {
  const querySnapshot = await getDocs(collection(db, "calendarEvents"));

  const list = document.getElementById("list");
  list.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.innerText = doc.data().text;
    list.appendChild(li);
  });
}
