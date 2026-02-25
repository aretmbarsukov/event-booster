let currentPage = 0;
let maxAvailablePage = 0;

async function loadEvents(page = 0) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=Q8bHL81HES4CjxatVZAVSQWYyAffYhbQ&page=${page}`;

  const response = await fetch(url);
  const data = await response.json();

  const events = data._embedded?.events || [];
  const list = document.querySelector('.events-list');

  if (!list) return;

  // Якщо сервер повернув події — оновлюємо maxAvailablePage
  if (events.length > 0) {
    maxAvailablePage = page;
  }

  // Якщо подій немає — не оновлюємо currentPage
  if (events.length === 0) {
    return;
  }

  currentPage = page;

  const markup = events
    .map(ev => {
      const img = ev.images?.[0]?.url || '';
      const name = ev.name || '';
      const date = ev.dates?.start?.localDate || '';
      const place = ev._embedded?.venues?.[0]?.name || '';

      return `
        <li class="event-card">
          <img class="event-img" src="${img}" alt="${name}">
          <h3 class="event-title">${name}</h3>
          <p class="event-date">${date}</p>
          <p class="event-place">${place}</p>
        </li>
      `;
    })
    .join('');

  list.innerHTML = markup;

  updatePagination();
}

function updatePagination() {
  const info = document.getElementById('page-info');
  info.textContent = `Page ${currentPage + 1}`;
}

document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 0) {
    loadEvents(currentPage - 1);
  }
});

document.getElementById('next').addEventListener('click', () => {
  loadEvents(currentPage + 1);
});

loadEvents();
