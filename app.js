/* ============================================================
   GoRide — AI Bus Ticket Booking · Main Application
   ============================================================ */

// ---- DATA ----
const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Nagpur',
    'Indore', 'Bhopal', 'Chandigarh', 'Goa', 'Kochi', 'Vizag'
];

const BUS_OPERATORS = [
    { name: 'Volvo Express', type: 'AC Sleeper', rating: 4.7, amenities: ['WiFi', 'AC', 'Charging', 'Blanket'] },
    { name: 'Royal Travels', type: 'AC Seater', rating: 4.5, amenities: ['AC', 'Water', 'Snacks'] },
    { name: 'Greenline Deluxe', type: 'Non-AC Seater', rating: 4.2, amenities: ['Water', 'Fan'] },
    { name: 'Star Cruiser', type: 'AC Sleeper', rating: 4.8, amenities: ['WiFi', 'AC', 'TV', 'Charging', 'Blanket'] },
    { name: 'City Connect', type: 'AC Seater', rating: 4.3, amenities: ['AC', 'Charging', 'Water'] },
    { name: 'Supreme Travels', type: 'AC Sleeper', rating: 4.6, amenities: ['WiFi', 'AC', 'Charging', 'Snacks', 'Blanket'] },
    { name: 'Eagle Express', type: 'Non-AC Seater', rating: 4.0, amenities: ['Fan', 'Water'] },
    { name: 'Paradise Lines', type: 'AC Seater', rating: 4.4, amenities: ['AC', 'WiFi', 'Charging'] }
];

const POPULAR_ROUTES = [
    { from: 'Mumbai', to: 'Pune', duration: '3h 30m', price: 450, buses: 28, rating: 4.6 },
    { from: 'Delhi', to: 'Jaipur', duration: '5h 15m', price: 650, buses: 35, rating: 4.5 },
    { from: 'Bangalore', to: 'Chennai', duration: '6h 00m', price: 750, buses: 42, rating: 4.7 },
    { from: 'Hyderabad', to: 'Vizag', duration: '8h 30m', price: 950, buses: 18, rating: 4.4 },
    { from: 'Pune', to: 'Goa', duration: '9h 00m', price: 1100, buses: 22, rating: 4.8 },
    { from: 'Kolkata', to: 'Bhopal', duration: '18h 00m', price: 1800, buses: 8, rating: 4.3 }
];

const CHATBOT_RESPONSES = {
    greeting: "👋 Hi there! I'm GoRide AI. How can I help you today? I can help with routes, booking, pricing, or cancellations.",
    routes: "🗺️ We operate 500+ routes across 120+ cities in India! Some popular ones: Mumbai↔Pune, Delhi↔Jaipur, Bangalore↔Chennai. Use the search bar above to find buses on your route!",
    booking: "🎫 Booking is easy!\n1. Enter your From & To cities + travel date\n2. Click 'Search Buses'\n3. Pick a bus from the results\n4. Choose your seats\n5. Fill in your details & confirm!\nIt takes less than 30 seconds!",
    cancel: "❌ Cancellations are hassle-free! You can cancel up to 2 hours before departure for a full refund. Just go to 'My Bookings' and click cancel. Refunds are processed within 24 hours.",
    prices: "💰 Our prices start from just ₹250 for short routes! AC Sleeper buses range from ₹600-₹2000 depending on distance. We also offer AI-powered price alerts for the best deals!",
    payment: "💳 We accept all payment methods: UPI, Cards, Net Banking, and Wallets. All payments are 100% secure with bank-grade encryption.",
    amenities: "🛋️ Our premium buses offer: WiFi, AC, Charging Ports, Blankets, TV Screens, Water & Snacks. Filter by amenities when searching!",
    safety: "🛡️ Your safety is our priority! All buses have GPS tracking, verified drivers, emergency contacts, and 24/7 monitoring.",
    default: "🤔 I'm not sure about that, but I'll learn! You can ask me about routes, booking, prices, cancellations, amenities, safety, or payment methods."
};

// ---- STATE ----
let currentBus = null;
let selectedSeats = [];
let searchFrom = '';
let searchTo = '';
let searchDate = '';
let searchPassengers = 1;

// ---- DOM READY ----
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    populateCities();
    renderPopularRoutes();
    animateCounters();
    initNavbar();
    initSearch();
    initChat();
    initModals();
});

// ---- INIT ----
function initDate() {
    const dateInput = document.getElementById('travelDate');
    const today = new Date();
    dateInput.valueAsDate = today;
    dateInput.min = today.toISOString().split('T')[0];
}

function populateCities() {
    const dl = document.getElementById('citiesList');
    CITIES.forEach(c => { const o = document.createElement('option'); o.value = c; dl.appendChild(o); });
}

function renderPopularRoutes() {
    const grid = document.getElementById('routesGrid');
    grid.innerHTML = POPULAR_ROUTES.map(r => `
        <div class="route-card" data-from="${r.from}" data-to="${r.to}">
            <div class="route-cities">
                <span class="city">${r.from}</span>
                <span class="arrow"><i class="fas fa-arrow-right"></i></span>
                <span class="city">${r.to}</span>
            </div>
            <div class="route-meta">
                <span><i class="fas fa-clock"></i> ${r.duration}</span>
                <span><i class="fas fa-bus"></i> ${r.buses} buses</span>
            </div>
            <div class="route-card-footer">
                <span class="route-price">₹${r.price}</span>
                <span class="route-rating"><i class="fas fa-star"></i> ${r.rating}</span>
            </div>
        </div>
    `).join('');
    grid.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', () => {
            document.getElementById('fromCity').value = card.dataset.from;
            document.getElementById('toCity').value = card.dataset.to;
            document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function animateCounters() {
    const nums = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = +el.dataset.target;
                let current = 0;
                const step = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = current.toLocaleString();
                }, 25);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    nums.forEach(n => observer.observe(n));
}

// ---- NAVBAR ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('active')));
    document.getElementById('swapBtn').addEventListener('click', () => {
        const f = document.getElementById('fromCity'), t = document.getElementById('toCity');
        [f.value, t.value] = [t.value, f.value];
    });
}

// ---- SEARCH ----
function initSearch() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
}

function handleSearch() {
    const from = document.getElementById('fromCity').value.trim();
    const to = document.getElementById('toCity').value.trim();
    const date = document.getElementById('travelDate').value;
    const pax = +document.getElementById('passengers').value;
    if (!from || !to) return alert('Please enter both From and To cities.');
    if (!date) return alert('Please select a travel date.');
    if (from.toLowerCase() === to.toLowerCase()) return alert('From and To cities cannot be the same.');

    searchFrom = from; searchTo = to; searchDate = date; searchPassengers = pax;

    // Show loading
    const loader = document.getElementById('loadingOverlay');
    loader.classList.add('active');

    setTimeout(() => {
        loader.classList.remove('active');
        showResults(from, to, date, pax);
    }, 1500);
}

function showResults(from, to, date, pax) {
    const modal = document.getElementById('resultsModal');
    const body = document.getElementById('resultsBody');
    const info = document.getElementById('routeInfo');
    const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    info.textContent = `${from} → ${to} · ${formattedDate} · ${pax} pax`;

    // Generate random buses
    const buses = generateBuses(from, to);
    body.innerHTML = buses.map((b, i) => `
        <div class="bus-card">
            <div>
                <div class="bus-name">${b.name}</div>
                <div class="bus-type"><i class="fas fa-bus"></i> ${b.type}</div>
                <div class="bus-timing">
                    <span class="time">${b.departure}</span>
                    <span>→</span>
                    <span class="time">${b.arrival}</span>
                    <span class="duration">${b.duration}</span>
                </div>
            </div>
            <div class="bus-amenities">
                ${b.amenities.map(a => `<span>${a}</span>`).join('')}
            </div>
            <div class="bus-price-section">
                <div class="bus-price">₹${b.price}</div>
                <div class="bus-seats-left">${b.seatsLeft} seats left</div>
                <div class="bus-rating"><i class="fas fa-star"></i> ${b.rating}</div>
                <button class="btn btn-primary select-bus-btn" data-index="${i}">Select <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
    `).join('');

    body.querySelectorAll('.select-bus-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bus = buses[+btn.dataset.index];
            modal.classList.remove('active');
            openSeatSelection(bus);
        });
    });

    modal.classList.add('active');
}

function generateBuses(from, to) {
    const count = 4 + Math.floor(Math.random() * 4);
    const buses = [];
    for (let i = 0; i < count; i++) {
        const op = BUS_OPERATORS[Math.floor(Math.random() * BUS_OPERATORS.length)];
        const depH = 5 + Math.floor(Math.random() * 18);
        const depM = Math.floor(Math.random() * 4) * 15;
        const durH = 3 + Math.floor(Math.random() * 12);
        const durM = Math.floor(Math.random() * 4) * 15;
        const arrH = (depH + durH) % 24;
        const arrM = (depM + durM) % 60;
        const basePrice = 300 + durH * 80 + Math.floor(Math.random() * 200);
        buses.push({
            name: op.name,
            type: op.type,
            rating: op.rating,
            amenities: op.amenities,
            departure: `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`,
            arrival: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
            duration: `${durH}h ${durM > 0 ? durM + 'm' : '00m'}`,
            price: Math.round(basePrice / 10) * 10,
            seatsLeft: 5 + Math.floor(Math.random() * 30),
            from, to
        });
    }
    return buses.sort((a, b) => a.price - b.price);
}

// ---- SEAT SELECTION ----
function openSeatSelection(bus) {
    currentBus = bus;
    selectedSeats = [];
    const modal = document.getElementById('seatModal');
    document.getElementById('selectedBusInfo').textContent = `${bus.name} · ${bus.type}`;
    document.getElementById('summaryBus').textContent = bus.name;
    document.getElementById('summaryRoute').textContent = `${bus.from} → ${bus.to}`;
    const formattedDate = new Date(searchDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    document.getElementById('summaryDate').textContent = formattedDate;
    document.getElementById('summarySeats').textContent = '—';
    document.getElementById('summaryPassengers').textContent = searchPassengers;
    document.getElementById('summaryTotal').textContent = '₹0';
    document.getElementById('bookNowBtn').disabled = true;

    // Clear input fields
    document.getElementById('paxName').value = '';
    document.getElementById('paxEmail').value = '';
    document.getElementById('paxPhone').value = '';

    renderSeats();
    modal.classList.add('active');
}

function renderSeats() {
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = '';
    // 8 rows x 5 cols (2 + gap + 3)
    const totalRows = 8;
    const bookedSet = new Set();
    const bookedCount = 6 + Math.floor(Math.random() * 10);
    while (bookedSet.size < bookedCount) {
        const r = Math.floor(Math.random() * totalRows);
        const c = Math.floor(Math.random() * 5);
        if (c !== 2) bookedSet.add(`${r}-${c}`);
    }

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < 5; c++) {
            const seat = document.createElement('button');
            const seatId = `${String.fromCharCode(65 + r)}${c < 2 ? c + 1 : c}`;
            if (c === 2) {
                seat.className = 'seat gap';
                seat.disabled = true;
            } else if (bookedSet.has(`${r}-${c}`)) {
                seat.className = 'seat booked';
                seat.textContent = seatId;
                seat.disabled = true;
            } else {
                seat.className = 'seat';
                seat.textContent = seatId;
                seat.addEventListener('click', () => toggleSeat(seat, seatId));
            }
            grid.appendChild(seat);
        }
    }
}

function toggleSeat(el, seatId) {
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
        if (selectedSeats.length >= searchPassengers) {
            alert(`You can only select ${searchPassengers} seat(s).`);
            return;
        }
        el.classList.add('selected');
        selectedSeats.push(seatId);
    }
    updateSummary();
}

function updateSummary() {
    document.getElementById('summarySeats').textContent = selectedSeats.length ? selectedSeats.join(', ') : '—';
    const total = selectedSeats.length * currentBus.price;
    document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('bookNowBtn').disabled = selectedSeats.length === 0;
}

// ---- BOOKING ----
function initModals() {
    document.getElementById('closeResults').addEventListener('click', () => document.getElementById('resultsModal').classList.remove('active'));
    document.getElementById('closeSeat').addEventListener('click', () => document.getElementById('seatModal').classList.remove('active'));
    document.getElementById('closeConfirm').addEventListener('click', () => document.getElementById('confirmModal').classList.remove('active'));
    document.getElementById('printTicketBtn').addEventListener('click', () => window.print());

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    });

    document.getElementById('bookNowBtn').addEventListener('click', handleBooking);
}

function handleBooking() {
    const name = document.getElementById('paxName').value.trim();
    const email = document.getElementById('paxEmail').value.trim();
    const phone = document.getElementById('paxPhone').value.trim();
    if (!name) return alert('Please enter your name.');
    if (!email) return alert('Please enter your email.');
    if (!phone) return alert('Please enter your phone number.');

    // Close seat modal
    document.getElementById('seatModal').classList.remove('active');

    // Show loading
    const loader = document.getElementById('loadingOverlay');
    loader.classList.add('active');

    setTimeout(() => {
        loader.classList.remove('active');
        showConfirmation({ name, email, phone });
    }, 1800);
}

function showConfirmation({ name, email, phone }) {
    const ticketNum = 'GORIDE-' + String(100000 + Math.floor(Math.random() * 900000));
    const total = selectedSeats.length * currentBus.price;
    const formattedDate = new Date(searchDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById('ticketId').textContent = `Ticket: #${ticketNum}`;
    document.getElementById('tktFrom').textContent = currentBus.from;
    document.getElementById('tktTo').textContent = currentBus.to;
    document.getElementById('tktDep').textContent = `Dep: ${currentBus.departure}`;
    document.getElementById('tktArr').textContent = `Arr: ${currentBus.arrival}`;
    document.getElementById('tktName').textContent = name;
    document.getElementById('tktDate').textContent = formattedDate;
    document.getElementById('tktBus').textContent = currentBus.name;
    document.getElementById('tktSeats').textContent = selectedSeats.join(', ');
    document.getElementById('tktDuration').textContent = currentBus.duration;
    document.getElementById('tktType').textContent = currentBus.type;
    document.getElementById('tktEmail').textContent = email;
    document.getElementById('tktPhone').textContent = phone;
    document.getElementById('tktTotal').textContent = `₹${total.toLocaleString()}`;

    document.getElementById('confirmModal').classList.add('active');
}

// ---- AI CHATBOT ----
function initChat() {
    const toggle = document.getElementById('chatToggle');
    const panel = document.getElementById('chatPanel');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    const msgs = document.getElementById('chatMessages');

    // Welcome message
    addBotMessage(CHATBOT_RESPONSES.greeting);

    toggle.addEventListener('click', () => panel.classList.toggle('active'));
    close.addEventListener('click', () => panel.classList.remove('active'));

    send.addEventListener('click', () => sendChat());
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.q;
            sendChat();
        });
    });
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    showTyping();
    setTimeout(() => {
        hideTyping();
        const reply = getAIResponse(text);
        addBotMessage(reply);
    }, 800 + Math.random() * 600);
}

function addBotMessage(text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = `${text.replace(/\n/g, '<br>')}<span class="msg-time">${getTime()}</span>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `${text}<span class="msg-time">${getTime()}</span>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot typing-msg';
    div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}
function hideTyping() {
    const el = document.querySelector('.typing-msg');
    if (el) el.remove();
}

function getAIResponse(text) {
    const t = text.toLowerCase();
    if (/hello|hi|hey|greet/.test(t)) return CHATBOT_RESPONSES.greeting;
    if (/route|city|cities|destination|where/.test(t)) return CHATBOT_RESPONSES.routes;
    if (/book|how.*book|ticket|steps/.test(t)) return CHATBOT_RESPONSES.booking;
    if (/cancel|refund/.test(t)) return CHATBOT_RESPONSES.cancel;
    if (/price|cost|fare|cheap|expensive/.test(t)) return CHATBOT_RESPONSES.prices;
    if (/pay|payment|upi|card/.test(t)) return CHATBOT_RESPONSES.payment;
    if (/amenity|amenities|wifi|ac|sleeper|charge/.test(t)) return CHATBOT_RESPONSES.amenities;
    if (/safe|safety|security|gps|driver/.test(t)) return CHATBOT_RESPONSES.safety;
    return CHATBOT_RESPONSES.default;
}

function getTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
