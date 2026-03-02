// const dropdown = document.querySelector('.country-dropdown');
// const selected = document.querySelector('.country-selected');
// const menu = document.querySelector('.country-menu');

// if (dropdown && selected && menu) {
//   selected.addEventListener('click', () => {
//     dropdown.classList.toggle('open');
//   });

//   menu.querySelectorAll('div').forEach(item => {
//     item.addEventListener('click', () => {
//       selectedCountry = item.dataset.country;
//       selected.textContent = selectedCountry;
//       dropdown.classList.remove('open');
//       loadEvents(0);
//     });
//   });

//   document.addEventListener('click', e => {
//     if (!dropdown.contains(e.target)) {
//       dropdown.classList.remove('open');
//     }
//   });
// }
