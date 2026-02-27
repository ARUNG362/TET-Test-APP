// Replace this with your API URL
const API_URL =
  "https://script.google.com/macros/s/AKfycbykaK1b23ZURnx4uOjMgBgSJy-6Sz808mdYWHZLWSD13f6c5TFllsD8OjvQHcIbLntl/exec";

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

let allTests = [];

async function loadTests() {
  try {
    showLoader();
    const response = await fetch(`${API_URL}?sheet=Tests&operation=get-tests`);
    const result = await response.json();

    if (result.status !== 200) {
      alert("Failed to fetch tests");
      return;
    }

    const scoreResponse = await fetch(`${API_URL}?sheet=Test Results&operation=get-tests`);
    const scores = await scoreResponse.json();

    renderTests(result.data, scores.data);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

function selectTest(testId){
    let testData = allTests.find(test => test.test_id == testId)
    sessionStorage.setItem('testId', testId);
    sessionStorage.setItem('testData', JSON.stringify(testData));
    window.location.href = `${window.location.href}test.html`
}

function renderTests(tests, scores) {
  const container = document.getElementById("testList");
  container.innerHTML = "";
  allTests = tests;

  tests.forEach((test) => {
    const card = document.createElement("div");
    card.className = "card";

    let scoreArr = scores.filter(
      score => score['test_id'] == test['test_id']
    );

    let score = scoreArr[scoreArr.length - 1];

    let scoreHTML = "";

    if (score) {

      const isPass = score.result == 'PASS';

      scoreHTML = `
        <div class="score-badge ${isPass ? "pass" : "fail"}">
          ${isPass ? "PASS" : "FAIL"} 
          (${score.marks_scored}/${score.total_marks})
        </div>
      `;
    }

    card.innerHTML = `
      <div onclick="selectTest(${test.test_id})" class="card-header test-header">
        <div class="test-name">${test.test_name}</div>
        ${scoreHTML}
      </div>
    `;

    container.appendChild(card);
  });
}

loadTests();
