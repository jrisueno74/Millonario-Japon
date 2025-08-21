
function setFeedback(text = "", ok = null){
  const el = document.querySelector("#feedback");
  if(!el) return;
  el.textContent = text;
  el.className = "feedback" + (ok === null ? "" : (ok ? " ok" : " bad"));
}

// ejemplo de showFeedback para mostrar correcto/incorrecto
function showFeedback(choice, q) {
  document.querySelectorAll(".answer").forEach((b) => {
    const i = Number(b.dataset.idx);
    if (i === q.answer) b.classList.add('correct');
    if (choice !== null && i === choice && i !== q.answer) b.classList.add('wrong');
  });
  if (choice === q.answer) {
    setFeedback("¡Correcto!", true);
  } else {
    const correctText = `${"ABCD"[q.answer]}. ${q.options[q.answer]}`;
    setFeedback(`Incorrecto. La respuesta correcta era: ${correctText}`, false);
  }
}
