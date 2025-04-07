function renderInitialCryptos(cryptos) {
    const cryptoGrid = document.getElementById('crypto-grid');
    if (!cryptos?.length) {
      cryptoGrid.innerHTML = '<p class="error">No cryptocurrencies found</p>';
      return;
    }

    cryptoGrid.innerHTML = `
      <div class="initial-view">
        <h3>Popular Cryptocurrencies</h3>
        <div class="crypto-row">
          ${cryptos.map(crypto => `
            <div class="crypto-item" data-id="${crypto.id}">
              <img src="${crypto.image}" alt="${crypto.name}" onerror="this.src='https://via.placeholder.com/40'">
              <span>${crypto.name}</span>
            </div>
          `).join('')}
        </div>
        <p class="search-prompt">Search or click any cryptocurrency to see details</p>
      </div>
    `;

    document.querySelectorAll('.crypto-item').forEach(item => {
      item.addEventListener('click', () => {
        const cryptoId = item.getAttribute('data-id');
        document.getElementById('crypto-search').value = cryptoId;
        loadCryptoDetails(cryptoId);
      });
    });
}

function renderCryptoDetails(crypto) {
    const cryptoGrid = document.getElementById('crypto-grid');
    if (!crypto) {
      cryptoGrid.innerHTML = '<p class="error">Cryptocurrency not found</p>';
      return;
    }

    cryptoGrid.innerHTML = `
      <div class="crypto-card">
        <img src="${crypto.image}" alt="${crypto.name}" onerror="this.src='https://via.placeholder.com/60'">
        <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
        <p>Price: $${crypto.current_price?.toLocaleString() || 'N/A'}</p>
        <p>Market Cap: $${crypto.market_cap?.toLocaleString() || 'N/A'}</p>
        <p>24h Volume: $${crypto.total_volume?.toLocaleString() || 'N/A'}</p>
        <p class="${(crypto.price_change_percentage_24h || 0) >= 0 ? 'positive' : 'negative'}">
          24h Change: ${(crypto.price_change_percentage_24h?.toFixed(2) || '0')}%
        </p>
      </div>
    `;
}

function renderNews(news) {
    const newsGrid = document.getElementById('news-grid');
    if (!news?.length) {
      newsGrid.innerHTML = '<p class="error">No news available</p>';
      return;
    }

    newsGrid.innerHTML = news.map(article => {
      return `
        <div class="news-card">
          <h3><a href="${article.url || '#'}" target="_blank">${article.title || 'No title'}</a></h3>
          <p>${article.description || ''}</p>
        </div>
      `;
    }).join('');
}

async function fetchTopCryptos() {
    try {
      const response = await fetch('/api/cryptos');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch top cryptos:', error);
      return [];
    }
}

async function fetchCryptoDetails(cryptoId) {
    try {
      const response = await fetch(`/api/cryptos/${cryptoId}`);
      if (!response.ok) throw new Error('Cryptocurrency not found');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch crypto details:', error);
      return null;
    }
}

async function fetchNews() {
    try {
      const cryptos = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple'];
      const randomCrypto = cryptos[Math.floor(Math.random() * cryptos.length)];
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(`/api/news?query=${randomCrypto}&page=${randomPage}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
}

async function loadInitialData() {
    const [cryptos, news] = await Promise.all([
        fetchTopCryptos(),
        fetchNews()
    ]);
    renderInitialCryptos(cryptos);
    renderNews(news);
}

async function loadCryptoDetails(cryptoId) {
    const [crypto, news] = await Promise.all([
        fetchCryptoDetails(cryptoId),
        fetchNews()
    ]);
    renderCryptoDetails(crypto);
    renderNews(news);
}

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    
    document.getElementById('search-btn').addEventListener('click', () => {
        const searchInput = document.getElementById('crypto-search').value.trim().toLowerCase();
        if (searchInput) loadCryptoDetails(searchInput);
    });
    
    document.getElementById('crypto-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchInput = document.getElementById('crypto-search').value.trim().toLowerCase();
            if (searchInput) loadCryptoDetails(searchInput);
        }
    });
});