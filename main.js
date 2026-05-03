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
let scoresData = [];
let answersMode = false;
let subjectTestsGlobal = [];

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
    allTests = result.data;
    scoresData = scores.data;
    renderSubjects(result.data);
    // renderTests(result.data, scores.data);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

function onGoBack(){
  // console.log("Hello");
  renderSubjects(allTests);
}

function showAnswers(){
  answersMode = !answersMode;
  // console.log(subjectTestsGlobal);
  renderTests(subjectTestsGlobal, scoresData);
}

function renderSubjects(testsData){
  answersMode = false;
  const subjectsCategory = Array.from(new Set(
    testsData.filter(test => test['is_active'])
    .map(test => test['subject_category'])));
  // console.log(subjectsCategory);
  const container = document.getElementById("testList");
  container.innerHTML = "";
  subjectsCategory.forEach((subject) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div onclick="onSubjectSelect('${subject}')" class="card-header test-header">
        <div class="test-name">${subject}</div>
      </div>
    `;

    container.appendChild(card);
  });

}

function onSubjectSelect(subject){
  // console.log(subject);
  const subjectTests = allTests.filter(test => test['subject_category'] == subject && test['is_active']);
  // console.log(subjectTests);
  subjectTestsGlobal = subjectTests;
  renderTests(subjectTests, scoresData);
}

function selectTest(testId){
    let testData = allTests.find(test => test.test_id == testId)
    testData.answersMode = answersMode;
    sessionStorage.setItem('testId', testId);
    sessionStorage.setItem('testData', JSON.stringify(testData));
    window.location.href = `${window.location.href}test.html`
}

function renderTests(tests, scores) {
  const container = document.getElementById("testList");
  container.innerHTML = `
    <div class="top-bar">
      <div onclick="onGoBack()" class="go-back-btn">
        <span style="font-size:18px;">&#8592;</span>
        <span>Go Back</span>
      </div>

      <label class="switch small">
        <input type="checkbox" id="toggleSwitch" onchange="showAnswers()">
        <span class="slider"></span>
      </label>
    </div>
  `;
  document.getElementById("toggleSwitch").checked = answersMode;

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

      if(!answersMode){
      scoreHTML = `
          <div class="score-badge ${isPass ? "pass" : "fail"}">
            ${isPass ? "PASS" : "FAIL"} 
            (${score.marks_scored}/${score.total_marks})
          </div>
        `;
      } else{
        scoreHTML = `
          <div class="score-badge pass">
            Answers Key
          </div>
        `;
      }
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
