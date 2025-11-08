
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".faq-question");
  if (!btn) return;

  const item = btn.closest(".faq-item");
  if (!item) return;

  const answer = item.querySelector(".faq-answer");
  const isActive = item.classList.toggle("active");

  if (answer) {
    if (isActive) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = null;
    }
  }
});
