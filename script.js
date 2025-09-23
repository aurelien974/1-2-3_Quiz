/* TODO:
- responsive for mobile
- remove played question from deck
*/

async function loadData() {
  let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRzwAXTAsK7F2TVSjJeRDJkHbusoton0Cf_2jSjXCATNEsPAwcmNuJIEd_QDSf6hQMS4iUZB-E9EZVq/pub?gid=1373487969&single=true&output=csv";

  let res = await fetch(url);
  let text = await res.text();

  let parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  let data = parsed.data.map(r => ({

    Type: r.Type_de_quiz,
    Category: r.Catégorie,
    Part1: r.Partie_1,
    Part2: r.Partie_2,
    Part3: r.Partie_3,
    Answer: r.Réponse
  }));

  return data;
}

function shuffleArray(array) {
  return array.sort(() => 0.5 - Math.random());
  // return array;
}

function displayChoices(data) {
  const choiceDiv = document.getElementById("questionChoice");
  const questionDiv = document.getElementById("questionDisplay");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");

  questionDiv.innerHTML = "";
  backButton.style.display = "none";
  nextButton.style.display = "none";

  let sample = shuffleArray(data).slice(0, 3);

  choiceDiv.innerHTML = "<h3>Choisis une question :</h3>";
  sample.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = q.Type + "\n<i>" + q.Category + "</i>";
    btn.onclick = () => displayQuestion(q, data);
    choiceDiv.appendChild(btn);
  });
}

function displayQuestion(q, data) {
  const choiceDiv = document.getElementById("questionChoice");
  const questionDiv = document.getElementById("questionDisplay");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");

  choiceDiv.innerHTML = "";
  questionDiv.innerHTML = "";
  backButton.style.display = "none";
  nextButton.style.display = "inline-block";

  backButton.onclick = () => displayChoices(data);

  // Question type and category
  const wrapperQuestionType = document.createElement("div");
  wrapperQuestionType.id = "wrapperQuestionType";
  questionDiv.appendChild(wrapperQuestionType);

  const qType = document.createElement("div");
  qType.id = "questionType";
  qType.textContent =  q.Type;
  wrapperQuestionType.appendChild(qType);

  if(q.Category)
  {
    const qCat = document.createElement("div");
    qCat.id = "questionCategory";
    qCat.textContent =  q.Category;
    wrapperQuestionType.appendChild(qCat);
  }

  // Question parts
  const steps = [
    { content: q.Part1, label: "1 :", labelNext: "Voir Partie 1" },
    { content: q.Part2, label: "2 :", labelNext: "Voir Partie 2" },
    { content: q.Part3, label: "3 :", labelNext: "Voir Partie 3" },
    { content: q.Answer, label: "R :", labelNext: "Voir Réponse" }
  ];

  let currentStep = 0;

  nextButton.textContent = steps[currentStep].labelNext;

  nextButton.onclick = () => {
    showStep(steps[currentStep].label, steps[currentStep].content, questionDiv);

    currentStep++;
    if (currentStep < steps.length) {
      nextButton.textContent = steps[currentStep].labelNext;
    } else {
      nextButton.style.display = "none";
      backButton.style.display = "inline-block";
    }
  };
}

function showStep(label, content, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "partRow";

  const lbl = document.createElement("span");
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
}

window.onload = async () => {
  const data = await loadData();
  console.log("data: ", data);
  displayChoices(data);
};