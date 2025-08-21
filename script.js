
// Millionaire-style Japan Quiz
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Money ladder amounts (15 steps)
const MONEY_STEPS = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];

let ALL_QUESTIONS = [];
let game = {
  order: [],
  current: 0,
  selectedCount: 15,
  streakCorrect: 0,
  lifelines: { fifty: true, audience: true, phone: true },
  results: [], // {q, choice, correct}
};

async function loadQuestions() {
  const resp = await fetch('data/questions_es.json');
  ALL_QUESTIONS = await resp.json();
}

function buildLadder() {
  const ladder = $("#ladder");
  ladder.innerHTML = "";
  MONEY_STEPS.forEach((amt, idx) => {
    const li = document.createElement('li');
    li.dataset.step = idx;
    const stepNum = (idx+1).toString().padStart(2,'0');
    li.innerHTML = `<span class="step">${stepNum}</span><span class="amount">¥ ${amt.toLocaleString('es-ES')}</span>`;
    ladder.prepend(li); // reverse order (top big prize)
  });
}

function setActiveLadder(step) {
  $$("#ladder li").forEach(li => li.classList.remove('active'));
  const idx = MONEY_STEPS.length - 1 - step; // because list reversed
  const li = $$("#ladder li")[idx];
  if (li) li.classList.add('active');
}

function pickQuestions(selectedCount, mode = 'auto') {
  // mode 'auto': progressive difficulty (1..5)
  // We'll select tiers proportional to steps
  const tiers = {1:[],2:[],3:[],4:[],5:[]};
  ALL_QUESTIONS.forEach((q, i) => tiers[q.difficulty]?.push(i));
  // shuffle helper
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);

  Object.values(tiers).forEach(shuffle);

  // create distribution across 15 steps (if not 15, scale)
  const steps = selectedCount;
  const dist = [];
  for (let i=0;i<steps;i++){
    // map position to difficulty 1..5
    const ratio = i/(steps-1 || 1);
    let d = 1;
    if (ratio > .8) d = 5; else if (ratio > .6) d = 4; else if (ratio > .4) d = 3; else if (ratio > .2) d = 2; else d = 1;
    dist.push(d);
  }
  const order = [];
  const used = new Set();
  dist.forEach(d => {
    const pool = tiers[d];
    let pick = pool.find(idx=>!used.has(idx));
    if (pick===undefined){
      // if we run out, borrow from neighbor tier
      const alt = [1,2,3,4,5].find(dd => tiers[dd].some(id=>!used.has(id)));
      pick = tiers[alt].find(id=>!used.has(id));
    }
    used.add(pick);
    order.push(pick);
  });
  return order;
}

function updateProgress() {
  const cur = game.current + 1;
  $("#prog-text").textContent = `${cur} / ${game.order.length}`;
  $("#prog-bar").style.width = `${(cur/game.order.length)*100}%`;
  setActiveLadder(Math.min(game.current, MONEY_STEPS.length-1));
}

function renderQuestion() {
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  $("#q-text").textContent = q.text;
  $("#q-category").textContent = q.category;
  $("#q-difficulty").textContent = ["• Fácil","• Intermedia","• Intermedia+","• Difícil","• Experta"][q.difficulty-1] || "";
  const labels = $$(".answer .label");
  const btns = $$(".answer");
  btns.forEach(b => { b.classList.remove('correct','wrong'); b.disabled=false; b.style.visibility="visible"; });
  q.options.forEach((opt, i) => labels[i].textContent = opt);

  // reset lifelines UI enabled/disabled state (do not reset used flags)
  $("#lifeline-5050").classList.toggle("used", !game.lifelines.fifty);
  $("#lifeline-audience").classList.toggle("used", !game.lifelines.audience);
  $("#lifeline-phone").classList.toggle("used", !game.lifelines.phone);

  updateProgress();
}

function lockAnswers() {
  $$(".answer").forEach(b => b.disabled = true);
}

function showFeedback(choice) {
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  $$(".answer").forEach((b) => {
    const i = Number(b.dataset.idx);
    if (i === q.answer) b.classList.add('correct');
    if (choice !== null && i === choice && i !== q.answer) b.classList.add('wrong');
  });
}

function nextQuestion() {
  game.current++;
  if (game.current >= game.order.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function answer(i) {
  lockAnswers();
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  const correct = i === q.answer;
  game.results.push({ qIndex: idx, choice: i, correct });
  showFeedback(i);
  setTimeout(nextQuestion, 1400);
}

function lifeline5050() {
  if (!game.lifelines.fifty) return;
  game.lifelines.fifty = false;
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  const wrongs = [0,1,2,3].filter(i=>i!==q.answer);
  // remove two random wrongs
  wrongs.sort(()=>Math.random()-0.5).slice(0,2).forEach(i => {
    const btn = $(`.answer[data-idx="${i}"]`);
    if (btn) btn.style.visibility = "hidden";
  });
  $("#lifeline-5050").classList.add("used");
}

function lifelineAudience() {
  if (!game.lifelines.audience) return;
  game.lifelines.audience = false;
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  const base = [0,0,0,0];
  // Weight correct higher depending on difficulty (harder -> less confident audience)
  const diff = q.difficulty;
  let correctWeight = 60 - (diff-1)*10; // 60,50,40,30,20
  correctWeight = Math.max(15, correctWeight);
  base[q.answer] = correctWeight;
  let remain = 100 - correctWeight;
  const others = [0,1,2,3].filter(i=>i!==q.answer);
  others.forEach((i, k) => {
    const slice = k === others.length-1 ? remain : Math.floor(Math.random()*(remain - (others.length-1-k)));
    base[i] = slice;
    remain -= slice;
  });
  alert("📊 Encuesta del público:\n" + q.options.map((o, i) => ` - ${"ABCD"[i]}. ${o}: ${base[i]}%`).join("\n"));
  $("#lifeline-audience").classList.add("used");
}

function lifelinePhone() {
  if (!game.lifelines.phone) return;
  game.lifelines.phone = false;
  const idx = game.order[game.current];
  const q = ALL_QUESTIONS[idx];
  const hint = q.hint || "Creo que la respuesta correcta es la opción " + "ABCD"[q.answer];
  alert("📞 Amigo: " + hint);
  $("#lifeline-phone").classList.add("used");
}

function showResult() {
  $("#screen-game").classList.remove("active");
  $("#screen-result").classList.add("active");
  const total = game.results.length;
  const ok = game.results.filter(r => r.correct).length;
  const prizeIndex = Math.min(ok, MONEY_STEPS.length)-1;
  const prize = prizeIndex >=0 ? MONEY_STEPS[prizeIndex] : 0;
  $("#result-summary").innerHTML = `Has acertado <strong>${ok}</strong> de <strong>${total}</strong>. Premio: <strong>¥ ${prize.toLocaleString('es-ES')}</strong>`;

  // Build review
  const review = $("#review");
  review.innerHTML = "";
  game.results.forEach((r, i) => {
    const q = ALL_QUESTIONS[r.qIndex];
    const div = document.createElement('div');
    div.className = "item " + (r.correct ? "correct" : "wrong");
    const your = r.choice != null ? `${"ABCD"[r.choice]}. ${q.options[r.choice]}` : "—";
    const corr = `${"ABCD"[q.answer]}. ${q.options[q.answer]}`;
    div.innerHTML = `<div><strong>${i+1}. ${q.text}</strong></div>
                     <div>Tu respuesta: ${your}</div>
                     <div>Correcta: ${corr}</div>
                     <div><small>${q.category} · ${["Fácil","Intermedia","Intermedia+","Difícil","Experta"][q.difficulty-1]}</small></div>`;
    review.appendChild(div);
  });

  // Save best score
  const best = JSON.parse(localStorage.getItem("bestScore") || "0");
  if (ok > best) localStorage.setItem("bestScore", JSON.stringify(ok));
}

function startGame() {
  $("#screen-start").classList.remove("active");
  $("#screen-result").classList.remove("active");
  $("#screen-game").classList.add("active");
  buildLadder();
  const selectCount = Number($("#setting-count").value);
  const mode = $("#setting-difficulty").value;
  game = {
    order: [], current: 0, selectedCount: selectCount, streakCorrect: 0,
    lifelines: { fifty: true, audience: true, phone: true },
    results: []
  };
  game.order = pickQuestions(selectCount, mode);
  renderQuestion();
}

function bindEvents() {
  $("#btn-start").addEventListener("click", startGame);
  $("#btn-restart").addEventListener("click", () => location.reload());
  $("#btn-review").addEventListener("click", () => {
    const el = $("#review");
    el.style.display = (el.style.display === "none" || !el.style.display) ? "block" : "none";
  });
  $$(".answer").forEach(btn => btn.addEventListener("click", e => answer(Number(btn.dataset.idx))));
  $("#lifeline-5050").addEventListener("click", lifeline5050);
  $("#lifeline-audience").addEventListener("click", lifelineAudience);
  $("#lifeline-phone").addEventListener("click", lifelinePhone);
}

(async function init(){
  await loadQuestions();
  bindEvents();
  buildLadder();
})();
