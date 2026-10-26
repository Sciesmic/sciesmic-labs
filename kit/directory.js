// Progressive enhancement: every lab link remains usable without this script.
const form = document.querySelector('#filters');
const cards = [...document.querySelectorAll('article.card')];
const search = document.querySelector('#search');
const subject = document.querySelector('#subject');
const grade = document.querySelector('#grade');
const normalize = text => text.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const entries = cards.map(card => ({ card, text: normalize(card.textContent) }));
function filter() {
  const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  let count = 0;
  for (const {card, text} of entries) {
    const show = words.every(word => text.includes(word)) && (!subject.value || card.dataset.subject === subject.value) && (!grade.value || card.dataset.grades.split(',').includes(grade.value));
    card.hidden = !show;
    if (show) count++;
  }
  document.querySelector('#results').textContent = `${count} of ${cards.length} simulations`;
  document.querySelector('#empty').hidden = count !== 0;
}
form.hidden = false;
form.addEventListener('input', filter);
form.addEventListener('change', filter);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => requestAnimationFrame(filter));
