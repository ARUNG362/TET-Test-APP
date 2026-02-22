const API_URL =
  "    https://script.google.com/macros/s/AKfycbykaK1b23ZURnx4uOjMgBgSJy-6Sz808mdYWHZLWSD13f6c5TFllsD8OjvQHcIbLntl/exec";

const loader = document.getElementById("loader");

let questions = [];
let currentIndex = 0;
let userAnswers = [];

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

async function loadQuestions() {
  try {
    const testId = sessionStorage.getItem("testId");
    showLoader();
    const response = await fetch(
      `${API_URL}?sheet=Test%20Data&operation=get-test-data&testId=${testId}`,
    );
    const result = await response.json();

    if (result.status === 200 && result.data.length > 0) {
      questions = result.data;
      userAnswers = new Array(questions.length).fill(null);
      renderQuestion();
    } else {
      alert("No questions found.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load questions.");
  } finally {
    hideLoader();
  }
}

function renderQuestion() {
  const data = questions[currentIndex];

  document.getElementById("progressText").innerText =
    `Question ${currentIndex + 1} of ${questions.length}`;

  document.getElementById("questionText").innerText =
    `Q${currentIndex + 1}. ${data.question}`;

  const container = document.getElementById("optionsContainer");
  container.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = data["option_" + i];

    if (userAnswers[currentIndex] === i) {
      btn.classList.add("selected");
    }

    btn.onclick = () => selectAnswer(i);
    container.appendChild(btn);
  }

  updateNavigationButtons();
}

function selectAnswer(optionNumber) {
  userAnswers[currentIndex] = optionNumber;
  renderQuestion();
}

function nextQuestion() {
  console.log(userAnswers);
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function updateNavigationButtons() {
  document.getElementById("prevBtn").disabled = currentIndex === 0;

  if (currentIndex === questions.length - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-block";
  } else {
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
  }
}

function submitTest() {
  let score = 0;

  console.log(userAnswers)
  let anwersSubmitted = userAnswers.filter(ans => ans !== null);
  
  if(questions.length !== anwersSubmitted.length){
        showSnackbar(
            `Answer All The Questions`,
            false,
        );
        return;
  }


  questions.forEach((q, index) => {
    if (userAnswers[index] === q.answer) {
      score++;
    }
  });

  const total = questions.length;
  const percentage = (score / total) * 100;
  const resultStatus = percentage >= 80 ? "PASS" : "FAIL";

  const resultData = {
    test_id: sessionStorage.getItem("testId"),
    marks_scored: score,
    total_marks: total,
    result: resultStatus,
  };

  console.log(resultData); // Ready to send to your API

  showSnackbar(
    `Test Completed! Score: ${score}/${total} — ${resultStatus}`,
    resultStatus === "PASS",
  );

  fetch(
    `${API_URL}?sheet=Test%20DResults&operation=add-result`,
    {
        method: 'POST',
        body: JSON.stringify(resultData)
    }
  )
}

function showSnackbar(message, isPass) {
  const snackbar = document.getElementById("snackbar");

  snackbar.className = "";
  snackbar.classList.add("show");
  snackbar.classList.add(isPass ? "pass" : "fail");

  snackbar.innerText = message;

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}

loadQuestions();
