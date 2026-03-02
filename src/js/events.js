let currentPage = 0;
let selectedCountry = null;
let searchQuery = '';
let allEvents = [];

// Завантажуємо всі события з API
async function fetchAllEvents() {
  try {
    // Показуємо що йде завантаження
    const eventsList = document.querySelector('.events-list');
    if (eventsList) {
      eventsList.innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; min-height: 400px; font-size: 24px; font-weight: bold; color: #666;">Loading all pages<span style="display: inline-block; margin-left: 10px; animation: spin 1s linear infinite;"></span></div>';
    }

    let events = [];
    const TOTAL_PAGES = 51;
    const BATCH_SIZE = 3; // По 3 сторінки одночасно

    console.log(`Завантажую ${TOTAL_PAGES} сторінок...`);

    // Завантажуємо батчами по 3 сторінки
    for (let start = 0; start < TOTAL_PAGES; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, TOTAL_PAGES);
      const batchPromises = [];

      // Створюємо запити для цього батчу
      for (let page = start; page < end; page++) {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=Q8bHL81HES4CjxatVZAVSQWYyAffYhbQ&page=${page}`;
        batchPromises.push(
          fetch(url, { signal: AbortSignal.timeout(10000) })
            .then(res => res.json())
            .then(data => {
              const pageEvents = data._embedded?.events || [];
              console.log(`✓ Сторінка ${page + 1}/${TOTAL_PAGES} - ${pageEvents.length} подій`);
              return pageEvents;
            })
            .catch(err => {
              console.log(`⚠ Сторінка ${page + 1}: ${err.message}`);
              return [];
            })
        );
      }

      // Чекаємо поки цей батч завантажиться
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(pageEvents => {
        events = events.concat(pageEvents);
      });

      // Невелика затримка між батчами
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(
      `✅ Готово! Завантажено ${events.length} подій з ${TOTAL_PAGES} сторінок`
    );

    return events;
  } catch (error) {
    console.log('Критична помилка:', error);
    return [];
  }
}

// Отримуємо відфільтровані события
function getFilteredEvents() {
  let filtered = allEvents;

  // Фільтруємо по країні
  if (selectedCountry) {
    filtered = filtered.filter(event => {
      const country = event._embedded?.venues?.[0]?.country?.name;
      return country === selectedCountry;
    });
  }

  // Фільтруємо по пошуку
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(event => {
      const name = (event.name || '').toLowerCase();
      const place = (event._embedded?.venues?.[0]?.name || '').toLowerCase();
      const date = event.dates?.start?.localDate || '';

      return (
        name.includes(query) || place.includes(query) || date.includes(query)
      );
    });
  }

  return filtered;
}

// Показуємо события на сторінці
function displayEvents(pageNum = 0) {
  const eventsList = document.querySelector('.events-list');
  const pageInfo = document.getElementById('page-info');

  if (!eventsList) return;

  const filteredEvents = getFilteredEvents();
  const eventsPerPage = 20;
  const startIndex = pageNum * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const pageEvents = filteredEvents.slice(startIndex, endIndex);

  // Створюємо HTML для событий
  let html = '';
  pageEvents.forEach(event => {
    const image = event.images?.[0]?.url || '';
    const name = event.name || 'Без названия';
    const date = event.dates?.start?.localDate || 'Дата невідома';
    const place = event._embedded?.venues?.[0]?.name || 'Місце невідоме';
    const country = event._embedded?.venues?.[0]?.country?.name || 'Unknown';

    html += `
      <li class="event-card" data-country="${country}">
        <img class="event-img" src="${image}" alt="${name}">
        <h3 class="event-title">${name}</h3>
        <p class="event-date">${date}</p>
        <p class="event-place">${place}</p>
      </li>
    `;
  });

  eventsList.innerHTML = html;

  // Оновлюємо інформацію про сторінку
  if (pageInfo) {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    pageInfo.textContent = `Page ${pageNum + 1} of ${totalPages}`;
  }

  currentPage = pageNum;
}

// Ініціалізація при загрузці сторінки
document.addEventListener('DOMContentLoaded', async () => {
  // Завантажуємо events
  allEvents = await fetchAllEvents();
  displayEvents(0);

  // Обробник пошуку
  const searchInput = document.querySelector('.header__input');
  if (searchInput) {
    searchInput.addEventListener('input', event => {
      searchQuery = event.target.value;
      displayEvents(0);
    });
  }

  // Обробник кнопки "Попередня"
  const prevButton = document.getElementById('prev');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 0) {
        displayEvents(currentPage - 1);
      }
    });
  }

  // Обробник кнопки "Наступна"
  const nextButton = document.getElementById('next');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const filteredEvents = getFilteredEvents();
      const eventsPerPage = 20;
      const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

      if (currentPage < totalPages - 1) {
        displayEvents(currentPage + 1);
      }
    });
  }

  // Обробник dropdown для вибору країни
  const dropdown = document.querySelector('.country-dropdown');
  const countryButton = document.querySelector('.country-selected');
  const countryMenu = document.querySelector('.country-menu');

  if (dropdown && countryButton && countryMenu) {
    // Відкриваємо/закриваємо menu при кліку
    countryButton.addEventListener('click', () => {
      dropdown.classList.toggle('open');
    });

    // Обробник вибору країни
    const countryItems = countryMenu.querySelectorAll('div');
    countryItems.forEach(item => {
      item.addEventListener('click', () => {
        const country = item.dataset.country;

        if (country === '') {
          selectedCountry = null;
          countryButton.textContent = 'Choose country';
        } else {
          selectedCountry = country;
          countryButton.textContent = country;
        }

        dropdown.classList.remove('open');
        displayEvents(0);
      });
    });

    // Закриваємо menu при кліку поза ним
    document.addEventListener('click', event => {
      if (!dropdown.contains(event.target)) {
      }
    });
  }
});
