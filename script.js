/* TODO:
- idée : choisir le type de quiz ou la catégorie ?
- idée : choisir une question parmi la liste complète ?
- idée : fonction pour remélanger les cartes jouées ?
*/

let quizQuestionsData = [];
let quizRemainingQuestionsData = [];
let questionsChoice = [];
let quizTypesData = [];

async function loadQuizQuestionsData() {
  let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRzwAXTAsK7F2TVSjJeRDJkHbusoton0Cf_2jSjXCATNEsPAwcmNuJIEd_QDSf6hQMS4iUZB-E9EZVq/pub?gid=1373487969&single=true&output=csv";

  let res = await fetch(url);
  let text = await res.text();

  let parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  quizQuestionsData = parsed.data.map(r => ({
    Type: r.Type_de_quiz,
    Category: r.Catégorie,
    Part1: r.Partie_1,
    Part2: r.Partie_2,
    Part3: r.Partie_3,
    Answer: r.Réponse
  }));
}

async function loadQuizTypesData() {
  let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRzwAXTAsK7F2TVSjJeRDJkHbusoton0Cf_2jSjXCATNEsPAwcmNuJIEd_QDSf6hQMS4iUZB-E9EZVq/pub?gid=1271437459&single=true&output=csv";

  let res = await fetch(url);
  let text = await res.text();

  let parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  quizTypesData = parsed.data.map(r => ({
    Type: r.Quiz_Type,
    Rule: r.Quiz_Type_Rule
  }));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function displayChoices() {
  const choiceDiv = document.getElementById("questionChoice");
  const questionDiv = document.getElementById("questionDisplay");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");

  questionDiv.innerHTML = "";
  backButton.style.display = "none";
  nextButton.style.display = "none";

  if (questionsChoice.length == 0) {
    questionsChoice = shuffleArray(quizRemainingQuestionsData).slice(0, 3);
    console.log("quizRemainingQuestionsData: ", quizRemainingQuestionsData);
  }

  choiceDiv.innerHTML = "<h3>Choisis une question :</h3>";
  questionsChoice.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = q.Type + "\n<i>" + q.Category + "</i>";
    btn.onclick = () => displayQuestion(q);
    choiceDiv.appendChild(btn);
  });
}

function displayQuestion(q) {
  const choiceDiv = document.getElementById("questionChoice");
  const questionDiv = document.getElementById("questionDisplay");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");

  choiceDiv.innerHTML = "";
  questionDiv.innerHTML = "";
  backButton.style.display = "block";
  nextButton.style.display = "block";

  backButton.onclick = () => displayChoices();

  // Question type and category
  const wrapperQuestionType = document.createElement("div");
  wrapperQuestionType.id = "wrapperQuestionType";
  questionDiv.appendChild(wrapperQuestionType);

  const qType = document.createElement("div");
  qType.id = "questionType";
  qType.textContent = q.Type;
  wrapperQuestionType.appendChild(qType);

  if (q.Category) {
    const qCat = document.createElement("div");
    qCat.id = "questionCategory";
    qCat.textContent = q.Category;
    wrapperQuestionType.appendChild(qCat);
  }

  // Question type How To
  const typeFound = quizTypesData.find(el => el.Type === q.Type);
  if (typeFound !== undefined) {
    const howToDetails = document.createElement("details");
    howToDetails.id = "QuizTypeHowTo";
    questionDiv.appendChild(howToDetails);
    howToDetails.textContent = typeFound.Rule;

    const howToSummary = document.createElement("summary");
    howToSummary.textContent = "Comment jouer ?";
    howToDetails.appendChild(howToSummary);
  }

  // Question parts
  const steps = [
    { content: q.Part1, label: "1 :", labelNext: "Voir Partie 1" },
    { content: q.Part2, label: "2 :", labelNext: "Voir Partie 2" },
    { content: q.Part3, label: "3 :", labelNext: "Voir Partie 3" },
    { content: q.Answer, label: "R :", labelNext: "Voir Réponse" }
  ];

  // Preload
  steps.forEach((step) => {
    const el = prepareStep(step.label, step.content, questionDiv);
    step.Element = el;
  });

  // Show step by step
  let currentStep = 0;

  nextButton.textContent = steps[currentStep].labelNext;

  nextButton.onclick = () => {
    steps[currentStep].Element.classList.remove("hidden");
    currentStep++;
    if (currentStep < steps.length) {
      nextButton.textContent = steps[currentStep].labelNext;
    } else {
      questionsChoice.length = 0;
      const idx = quizRemainingQuestionsData.indexOf(q);
      if (idx !== -1) {
        quizRemainingQuestionsData.splice(idx, 1);
      }
      else {
        console.log("Couldn't find question to delete: ", q);
      }
      nextButton.style.display = "none";
    }
  };
}

function prepareStep(label, content, container) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("partRow", "hidden");

  const lbl = document.createElement("div");
  lbl.className = "partLabel";
  lbl.textContent = label;

  const body = document.createElement("div");
  body.className = "partContent";

  if (content && content.startsWith("http")) {
    const img = document.createElement("img");
    img.src = content;
    img.alt = "illustration";
    body.appendChild(img);
  } else {
    body.textContent = content;
  }

  wrapper.appendChild(lbl);
  wrapper.appendChild(body);
  container.appendChild(wrapper);
  return wrapper;
}

window.onload = async () => {
  await loadQuizQuestionsData();
  await loadQuizTypesData();
  quizRemainingQuestionsData = [...quizQuestionsData];
  console.log("quizQuestionsData: ", quizQuestionsData);
  console.log("quizTypesData: ", quizTypesData);
  displayChoices();
};