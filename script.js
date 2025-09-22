console.log('Zimby app loaded');

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

const addLinkBtn = document.getElementById('add-link-btn');
const favouritesGrid = document.getElementById('favourites');
const modal = document.getElementById('add-link-modal');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const saveLinkBtn = document.getElementById('save-link');
const cancelLinkBtn = document.getElementById('cancel-link');
const linkError = document.getElementById('link-error');

const CUSTOM_LINKS_KEY = 'customLinks';
let customLinks = JSON.parse(localStorage.getItem(CUSTOM_LINKS_KEY) || '[]');

function saveCustomLinks() {
  localStorage.setItem(CUSTOM_LINKS_KEY, JSON.stringify(customLinks));
}

function renderCustomLinks() {
  document.querySelectorAll('.custom-link').forEach((el) => el.remove());
  customLinks.forEach((link, index) => {
    const a = document.createElement('a');
    a.className = 'link-button custom-link';
    a.href = link.url;
    a.textContent = link.name;
    const del = document.createElement('span');
    del.className = 'delete-link';
    del.textContent = '❌';
    del.addEventListener('click', (e) => {
      e.preventDefault();
      customLinks.splice(index, 1);
      saveCustomLinks();
      renderCustomLinks();
    });
    a.appendChild(del);
    favouritesGrid.appendChild(a);
  });
}

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  linkNameInput.value = '';
  linkUrlInput.value = '';
  linkError.textContent = '';
}

addLinkBtn.addEventListener('click', openModal);
cancelLinkBtn.addEventListener('click', closeModal);

saveLinkBtn.addEventListener('click', () => {
  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();
  if (!name || !url) {
    linkError.textContent = 'Please provide both name and URL';
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    linkError.textContent = 'URL must start with http:// or https://';
    return;
  }
  customLinks.push({ name, url });
  saveCustomLinks();
  renderCustomLinks();
  closeModal();
});

renderCustomLinks();

function performSearch() {
  const query = searchInput.value.trim();
  if (query) {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    window.open(url, '_blank');
  }
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch();
});

const tabs = document.querySelectorAll('.category-tab');
const grids = document.querySelectorAll('.link-grid');

const weatherElement = document.getElementById('weather');
const API_KEY = 'YOUR_API_KEY';

function fetchWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=London,uk&units=metric&appid=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.main && data.weather && data.weather[0]) {
        const temp = Math.round(data.main.temp);
        const city = data.name;
        const icon = data.weather[0].icon;
        const description = data.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
        weatherElement.innerHTML = `${temp}°C | ${city} <img src="${iconUrl}" alt="${description}">`;
      } else {
        weatherElement.textContent = 'Weather unavailable';
      }
    })
    .catch(() => {
      weatherElement.textContent = 'Weather unavailable';
    });
}

fetchWeather();

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    grids.forEach((grid) => grid.classList.remove('active'));
    const target = document.getElementById(tab.dataset.target);
    if (target) {
      target.classList.add('active');
    }
  });
});

const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';
const newsFeed = document.getElementById('news-feed');
const newsFilters = document.querySelectorAll('.news-filter');

function getCategoryLabel(cat, source) {
  if (cat === 'technology') return 'Tech';
  if (cat === 'business') return 'Business';
  if (cat === 'local') return 'Local';
  return source || 'News';
}

function displayNews(articles, category) {
  if (!articles.length) {
    newsFeed.textContent = 'News unavailable.';
    return;
  }
  newsFeed.innerHTML = '';
  articles.forEach((article) => {
    const card = document.createElement('a');
    card.href = article.url;
    card.target = '_blank';
    card.className = 'news-card';

    if (article.urlToImage) {
      const img = document.createElement('img');
      img.src = article.urlToImage;
      img.alt = article.title || '';
      card.appendChild(img);
    }

    const headline = document.createElement('div');
    headline.className = 'headline';
    headline.textContent = article.title || '';
    card.appendChild(headline);

    const tag = document.createElement('div');
    tag.className = 'category-tag';
    tag.textContent = getCategoryLabel(category, article.source && article.source.name);
    card.appendChild(tag);

    newsFeed.appendChild(card);
  });
}

function fetchNews(category = 'all') {
  newsFeed.innerHTML = '<p>Loading news...</p>';
  let url = `https://newsapi.org/v2/top-headlines?country=gb&pageSize=6&apiKey=${NEWS_API_KEY}`;
  if (category === 'technology' || category === 'business') {
    url += `&category=${category}`;
  } else if (category === 'local') {
    url += `&category=general&q=uk`;
  }
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.articles) {
        displayNews(data.articles, category);
      } else {
        newsFeed.textContent = 'News unavailable.';
      }
    })
    .catch(() => {
      newsFeed.textContent = 'News unavailable.';
    });
}

newsFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    newsFilters.forEach((f) => f.classList.remove('active'));
    filter.classList.add('active');
    fetchNews(filter.dataset.category);
  });
});

fetchNews();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service worker registered'))
      .catch((err) => console.log('Service worker registration failed', err));
  });
}
