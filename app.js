const COINS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'ripple', 'usd-coin', 'cardano', 'avalanche-2', 'dogecoin',
  'polkadot', 'chainlink', 'tron', 'shiba-inu', 'litecoin',
  'bitcoin-cash', 'uniswap', 'stellar', 'monero', 'ethereum-classic'
];

const API_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;

let coinData = [];
let prevPrices = {};
let refreshInterval;

function formatPrice(n) {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1)    return '$' + n.toFixed(4);
  return '$' + n.toFixed(6);
}

function formatLarge(n) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString();
}

function changeClass(val) {
  return val >= 0 ? 'up' : 'down';
}

function changeLabel(val) {
  if (val == null) return '—';
  return (val >= 0 ? '+' : '') + val.toFixed(2) + '%';
}

function drawSparkline(canvas, prices, isUp) {
  if (!prices || prices.length === 0) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth || 200;
  const h = canvas.height = 40;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  ctx.clearRect(0, 0, w, h);

  const pts = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * w,
    y: h - ((p - min) / range) * (h - 4) - 2
  }));

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp = { x: (pts[i - 1].x + pts[i].x) / 2, y: pts[i - 1].y };
    ctx.bezierCurveTo(cp.x, cp.y, cp.x, pts[i].y, pts[i].x, pts[i].y);
  }

  const color = isUp ? '#3fb950' : '#f85149';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fill gradient under the line
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.lineTo(pts[0].x, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fill();
}

function buildCard(coin) {
  const change24 = coin.price_change_percentage_24h;
  const isUp = change24 >= 0;
  const prices7d = coin.sparkline_in_7d?.price ?? [];

  return `
    <div class="card" id="card-${coin.id}" data-name="${coin.name.toLowerCase()}" data-symbol="${coin.symbol.toLowerCase()}">
      <div class="card-header">
        <img src="${coin.image}" alt="${coin.name}" loading="lazy" />
        <div>
          <div class="coin-name">${coin.name}</div>
          <div class="coin-symbol">${coin.symbol}</div>
        </div>
        <span class="change ${changeClass(change24)}" style="margin-left:auto">${changeLabel(change24)}</span>
      </div>
      <div class="coin-price">${formatPrice(coin.current_price)}</div>
      <canvas class="sparkline" id="spark-${coin.id}"></canvas>
      <div class="coin-stats">
        <span>MCap: ${formatLarge(coin.market_cap)}</span>
        <span>Vol: ${formatLarge(coin.total_volume)}</span>
      </div>
    </div>`;
}

function renderGrid(data) {
  const grid = document.getElementById('coin-grid');
  grid.innerHTML = data.map(buildCard).join('');

  // Draw sparklines after DOM is painted
  requestAnimationFrame(() => {
    data.forEach(coin => {
      const canvas = document.getElementById(`spark-${coin.id}`);
      if (canvas) drawSparkline(canvas, coin.sparkline_in_7d?.price ?? [], coin.price_change_percentage_7d_in_currency >= 0);
    });
  });
}

function flashCards(data) {
  data.forEach(coin => {
    const prev = prevPrices[coin.id];
    if (prev == null) return;
    const card = document.getElementById(`card-${coin.id}`);
    if (!card) return;
    if (coin.current_price > prev) {
      card.classList.remove('flash-down', 'flash-up');
      void card.offsetWidth; // reflow
      card.classList.add('flash-up');
    } else if (coin.current_price < prev) {
      card.classList.remove('flash-down', 'flash-up');
      void card.offsetWidth;
      card.classList.add('flash-down');
    }
  });
}

function updateTicker(data) {
  const track = document.getElementById('ticker-track');
  const items = data.map(c => {
    const chg = c.price_change_percentage_24h;
    const color = chg >= 0 ? '#3fb950' : '#f85149';
    return `<span class="ticker-item">
      <span class="symbol">${c.symbol}</span>
      <span class="price">${formatPrice(c.current_price)}</span>
      <span style="color:${color}">${changeLabel(chg)}</span>
    </span>`;
  }).join('');
  // Duplicate for seamless loop
  track.innerHTML = items + items;
}

async function fetchPrices() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('loading');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    flashCards(data);
    data.forEach(c => { prevPrices[c.id] = c.current_price; });
    coinData = data;

    renderGrid(data);
    updateTicker(data);

    const now = new Date();
    document.getElementById('last-updated').textContent =
      'Updated ' + now.toLocaleTimeString();
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('coin-grid');
    grid.innerHTML = `<div class="error-msg">Failed to fetch prices. Rate limit may apply — try again shortly.</div>`;
  } finally {
    btn.classList.remove('loading');
  }
}

function filterCoins() {
  const q = document.getElementById('search').value.toLowerCase().trim();
  document.querySelectorAll('.card').forEach(card => {
    const match = card.dataset.name.includes(q) || card.dataset.symbol.includes(q);
    card.style.display = match ? '' : 'none';
  });
}

// Redraw sparklines on window resize
window.addEventListener('resize', () => {
  coinData.forEach(coin => {
    const canvas = document.getElementById(`spark-${coin.id}`);
    if (canvas) drawSparkline(canvas, coin.sparkline_in_7d?.price ?? [], coin.price_change_percentage_7d_in_currency >= 0);
  });
});

// Initial load + auto-refresh every 60s
fetchPrices();
refreshInterval = setInterval(fetchPrices, 60_000);
