const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const loginStatus = document.querySelector("#loginStatus");
const appShell = document.querySelector("#appShell");
const fileInput = document.querySelector("#fileInput");
const fileName = document.querySelector("#fileName");
const fileMeta = document.querySelector("#fileMeta");
const dropZone = document.querySelector("#dropZone");
const notesText = document.querySelector("#notesText");
const mockMode = document.querySelector("#mockMode");
const generateButton = document.querySelector("#generateButton");
const clearButton = document.querySelector("#clearButton");
const statusLine = document.querySelector("#status");
const cardsEl = document.querySelector("#cards");
const downloadJson = document.querySelector("#downloadJson");
const downloadMarkdown = document.querySelector("#downloadMarkdown");
const currentUser = document.querySelector("#currentUser");
const logoutButton = document.querySelector("#logoutButton");

const SESSION_STORAGE_KEY = "studyBuddySession";
let selectedFile = null;
let latestJson = "";
let latestMarkdown = "";

const savedSession = loadSession();
if (savedSession?.token) {
  showApp(savedSession.username);
} else {
  showLogin();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginStatus("Logging in...");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Login failed.");
    }

    saveSession(data);
    passwordInput.value = "";
    showApp(data.username);
  } catch (error) {
    setLoginStatus(error.message, true);
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  clearResults();
  showLogin();
});

fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files[0] ?? null;
  renderSelectedFile();
});

for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
}

dropZone.addEventListener("drop", (event) => {
  selectedFile = event.dataTransfer.files[0] ?? null;
  fileInput.files = event.dataTransfer.files;
  renderSelectedFile();
});

generateButton.addEventListener("click", async () => {
  setBusy(true);
  setStatus("Generating...");
  clearResults();

  try {
    const payload = await buildPayload();
    const session = loadSession();
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token ?? ""}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        showLogin();
      }
      throw new Error(data.error ?? "Generation failed.");
    }

    latestJson = data.json;
    latestMarkdown = data.markdown;
    renderCards(data.flashcards);
    setStatus(data.warnings?.length ? data.warnings.join(" ") : "Ready");
    downloadJson.disabled = false;
    downloadMarkdown.disabled = false;
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setBusy(false);
  }
});

clearButton.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  notesText.value = "";
  renderSelectedFile();
  clearResults();
  setStatus("");
});

downloadJson.addEventListener("click", () => {
  downloadFile("study-buddy-flashcards.json", latestJson, "application/json");
});

downloadMarkdown.addEventListener("click", () => {
  downloadFile("study-buddy-flashcards.md", latestMarkdown, "text/markdown");
});

function renderSelectedFile() {
  if (!selectedFile) {
    fileName.textContent = "Choose PDF, TXT, or MD";
    fileMeta.textContent = "No file selected";
    return;
  }

  fileName.textContent = selectedFile.name;
  fileMeta.textContent = `${formatBytes(selectedFile.size)} - ${selectedFile.type || "local file"}`;
}

async function buildPayload() {
  const pastedText = notesText.value.trim();

  if (pastedText) {
    return { text: pastedText, mock: mockMode.checked };
  }

  if (!selectedFile) {
    throw new Error("Add notes first.");
  }

  return {
    fileName: selectedFile.name,
    fileType: selectedFile.type,
    fileDataBase64: await fileToBase64(selectedFile),
    mock: mockMode.checked
  };
}

function renderCards(cards) {
  cardsEl.classList.remove("empty-state");
  cardsEl.innerHTML = cards
    .map((card, index) => {
      const meta = [card.topic, card.difficulty]
        .filter(Boolean)
        .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
        .join("");

      return `<button class="flashcard" type="button" aria-pressed="false">
        <span class="card-inner">
          <span class="card-face card-front">
            <span class="card-kicker">Question ${index + 1}</span>
            <span class="card-text">${escapeHtml(card.question)}</span>
            ${meta ? `<span class="meta-row">${meta}</span>` : ""}
          </span>
          <span class="card-face card-back">
            <span class="card-kicker">Answer</span>
            <span class="card-text">${escapeHtml(card.answer)}</span>
          </span>
        </span>
      </button>`;
    })
    .join("");

  for (const card of cardsEl.querySelectorAll(".flashcard")) {
    card.addEventListener("click", () => {
      const isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(isFlipped));
    });
  }
}

function clearResults() {
  latestJson = "";
  latestMarkdown = "";
  downloadJson.disabled = true;
  downloadMarkdown.disabled = true;
  cardsEl.classList.add("empty-state");
  cardsEl.textContent = "No flashcards yet";
}

function setBusy(isBusy) {
  generateButton.disabled = isBusy;
  generateButton.textContent = isBusy ? "Generating" : "Generate";
}

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("error", isError);
}

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function showApp(username) {
  loginScreen.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  currentUser.textContent = username ? `Signed in as ${username}` : "";
  setLoginStatus("");
}

function showLogin() {
  appShell.classList.add("is-hidden");
  loginScreen.classList.remove("is-hidden");
  currentUser.textContent = "";
  usernameInput.focus();
}

function saveSession(session) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      token: session.token,
      username: session.username
    })
  );
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
