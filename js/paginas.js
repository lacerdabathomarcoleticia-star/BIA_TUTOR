/* Interações das páginas de Curso (curso.html) e Atividade (atividade.html) */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Acordeão dos módulos (curso.html) */
  document.querySelectorAll('[data-modules] .pg-module_btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.pg-module');
      const open = item.classList.toggle('-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* 2. Atividade de 15 questões (atividade.html) */
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz || !window.BIA) return;

  const questions = window.BIA.getActivityQuestions();
  if (!questions || !questions.length) return;

  const counterEl = quiz.querySelector('[data-quiz-counter]');
  const topicEl = quiz.querySelector('[data-quiz-topic]');
  const barEl = quiz.querySelector('[data-quiz-progress-bar]');
  const questionEl = quiz.querySelector('[data-quiz-question]');
  const optionsEl = quiz.querySelector('[data-quiz-options]');
  const feedbackEl = quiz.querySelector('[data-quiz-feedback]');
  const prevBtn = quiz.querySelector('[data-quiz-prev]');
  const nextBtn = quiz.querySelector('[data-quiz-next]');
  const scoreEl = quiz.querySelector('[data-quiz-score]');
  const nextLessonBtn = document.querySelector('[data-next]');
  const courseBar = document.querySelector('[data-progress]');
  const courseLabel = document.querySelector('[data-progress-label]');
  const courseDetail = document.querySelector('[data-progress-detail]');

  const state = {
    currentIndex: 0,
    answers: {}, // { [questionId]: { selected: number, isCorrect: boolean } }
    frozen: false,
  };

  window.BIA.setActivityLockHandler((locked) => {
    state.frozen = Boolean(locked);
    quiz.classList.toggle('-frozen', state.frozen);
    quiz.toggleAttribute('inert', state.frozen);
  });

  function renderQuestion() {
    const q = questions[state.currentIndex];
    const saved = state.answers[q.id];
    const total = questions.length;
    const answeredCount = Object.keys(state.answers).length;
    const correctCount = Object.values(state.answers).filter((a) => a.isCorrect).length;

    counterEl.textContent = `Questão ${state.currentIndex + 1} de ${total}`;
    topicEl.textContent = `Assunto: ${q.topicTag}`;
    barEl.style.width = `${((state.currentIndex + 1) / total) * 100}%`;
    questionEl.textContent = q.question;
    scoreEl.textContent = answeredCount > 0 ? `Respondidas: ${answeredCount}/${total} · Acertos: ${correctCount}` : '';

    optionsEl.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pg-quiz_opt';
      btn.textContent = optText;

      if (saved) {
        btn.disabled = true;
        if (idx === q.correct) btn.classList.add('-right');
        else if (idx === saved.selected && !saved.isCorrect) btn.classList.add('-wrong');
      } else {
        btn.addEventListener('click', () => handleAnswer(q, idx));
      }

      li.appendChild(btn);
      optionsEl.appendChild(li);
    });

    if (saved) {
      feedbackEl.hidden = false;
      feedbackEl.className = `pg-quiz_feedback ${saved.isCorrect ? '-right' : '-wrong'}`;
      feedbackEl.innerHTML = `<p><strong>${saved.isCorrect ? 'Correto!' : 'Incorreto.'}</strong> ${saved.isCorrect ? q.feedbackRight : q.feedbackWrong}</p>`;
    } else {
      feedbackEl.hidden = true;
      feedbackEl.innerHTML = '';
    }

    prevBtn.disabled = state.currentIndex === 0;
    const isLast = state.currentIndex === total - 1;
    nextBtn.textContent = isLast ? 'Concluir atividade' : 'Próxima questão ›';
    nextBtn.disabled = !saved;

    const dynamicCoursePct = 30 + Math.round((answeredCount / total) * 15);
    if (courseBar) courseBar.style.width = `${dynamicCoursePct}%`;
    if (courseLabel) courseLabel.textContent = `${dynamicCoursePct}%`;
    if (courseDetail) courseDetail.textContent = `${answeredCount}/${total} na atividade`;

    if (answeredCount === total && nextLessonBtn) {
      nextLessonBtn.classList.remove('-disabled');
      nextLessonBtn.removeAttribute('aria-disabled');
    }
  }

  function handleAnswer(q, selectedIdx) {
    if (state.frozen || state.answers[q.id]) return;
    const isCorrect = selectedIdx === q.correct;
    state.answers[q.id] = { selected: selectedIdx, isCorrect };
    renderQuestion();

    window.BIA.recordActivityAnswer({
      questionId: q.id,
      topicTag: q.topicTag,
      isCorrect,
    });
  }

  prevBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.currentIndex < questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
    } else {
      const correctCount = Object.values(state.answers).filter((a) => a.isCorrect).length;
      feedbackEl.hidden = false;
      feedbackEl.className = 'pg-quiz_feedback -right';
      feedbackEl.innerHTML = `<p><strong>Atividade concluída!</strong> Você acertou <strong>${correctCount} de ${questions.length}</strong> questões. A próxima aula foi liberada.</p>`;
    }
  });

  renderQuestion();
});
