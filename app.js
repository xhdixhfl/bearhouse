import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBI1azkUClqu8M_kemltMfPQwlFQuG6Yr4",
  authDomain: "bearhouse-gom3.firebaseapp.com",
  projectId: "bearhouse-gom3",
  storageBucket: "bearhouse-gom3.firebasestorage.app",
  messagingSenderId: "656131928299",
  appId: "1:656131928299:web:d1cf4a5476182b8bc94eae"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

const loginArea = document.getElementById("loginArea");
const appArea = document.getElementById("app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addBtn = document.getElementById("addBtn");
const eventTextInput = document.getElementById("eventText");
const userEmail = document.getElementById("userEmail");
const list = document.getElementById("list");
const message = document.getElementById("message");

function showMessage(text) {
  message.textContent = text;
}

function clearMessage() {
  message.textContent = "";
}

function showLogin() {
  loginArea.style.display = "block";
  appArea.style.display = "none";
}

function showApp(user) {
  loginArea.style.display = "none";
  appArea.style.display = "block";
  userEmail.textContent = user.email;
}

loginBtn.addEventListener("click", async () => {
  try {
    clearMessage();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("로그인 오류:", error);

    showMessage(
      `로그인 실패\n\n오류 코드: ${error.code}\n오류 내용: ${error.message}`
    );
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 오류:", error);
    alert("로그아웃 중 오류가 발생했습니다.");
  }
});

addBtn.addEventListener("click", async () => {
  try {
    const text = eventTextInput.value.trim();

    if (!text) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    await addDoc(collection(db, "calendarEvents"), {
      text: text,
      houseId: "gomdol-house",
      createdBy: currentUser.uid,
      createdByEmail: currentUser.email,
      createdAt: serverTimestamp()
    });

    eventTextInput.value = "";
    await loadEvents();
  } catch (error) {
    console.error("기록 추가 오류:", error);
    alert(`기록 추가 실패\n\n${error.code}\n${error.message}`);
  }
});

async function loadEvents() {
  try {
    list.innerHTML = "불러오는 중...";

    const q = query(
      collection(db, "calendarEvents"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = "<p class='small'>아직 기록이 없습니다.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <div>${data.text || ""}</div>
        <div class="small">${data.createdByEmail || ""}</div>
      `;

      list.appendChild(div);
    });
  } catch (error) {
    console.error("기록 불러오기 오류:", error);
    list.innerHTML = `
      <p class="small">
        기록을 불러오지 못했습니다.<br>
        ${error.code}<br>
        ${error.message}
      </p>
    `;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    showApp(user);
    await loadEvents();
  } else {
    currentUser = null;
    showLogin();
  }
});
