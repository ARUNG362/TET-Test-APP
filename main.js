// Replace this with your API URL
const API_URL =
  "https://script.google.com/macros/s/AKfycbykaK1b23ZURnx4uOjMgBgSJy-6Sz808mdYWHZLWSD13f6c5TFllsD8OjvQHcIbLntl/exec?sheet=Tests&operation=get-tests";

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}


async function loadTests() {
  try {
    showLoader();
    const response = await fetch(API_URL);
    const result = await response.json();

    if (result.status !== 200) {
      alert("Failed to fetch tests");
      return;
    }

    renderTests(result.data);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

function selectTest(testId){
    console.log(window.location.href)
    sessionStorage.setItem('testId', testId)
    window.location.href = `${window.location.href}test.html`
}

function renderTests(tests) {
  const container = document.getElementById("testList");
  container.innerHTML = "";

  tests.forEach((test) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <div onClick=selectTest("${test['test_id']}")  class="card-header">
          <div class="test-name">${test.test_name}</div>
        </div>
      `;
      /**
       *  // <div class="test-id">Test ID: ${test.test_id}</div>
       *  //   <div class="status ${test.is_active == 1 ? "active" : "inactive"}">
            //     ${test.is_active == 1 ? "Active" : "Inactive"}
            //   </div>
       */

    container.appendChild(card);
  });
}

loadTests();
