// --- I18N SYSTEM ---
let currentLang = localStorage.getItem('portfolio-lang') || 'en';
let translations = {};
let professionalData = [];
let showcasesData = [];
let distinctionsData = [];

let expShowingAll = false;
let projShowingAll = false;
let certShowingAll = false;
let typeInterval = null;

function t(key) {
    const keys = key.split('.');
    let obj = translations;
    for (const k of keys) {
        if (obj && obj[k]) obj = obj[k];
        else return key;
    }
    return obj && obj[currentLang] ? obj[currentLang] : key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.getElementById('scrollTopBtn').setAttribute('aria-label', t('scrollTop.ariaLabel'));
}

function updateLangBtns() {
    document.getElementById('langEn').classList.toggle('active', currentLang === 'en');
    document.getElementById('langFr').classList.toggle('active', currentLang === 'fr');
}

function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    updateLangBtns();
    applyTranslations();
    renderExperience();
    renderProjects();
    renderCertifications();
    restartTyping();
    gsap.fromTo('main section', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 });
}

// --- LOAD DATA ---
async function loadData() {
    try {
        const [transRes, profRes, showRes, distRes] = await Promise.all([
            fetch('./assets/data/translations.json'),
            fetch('./assets/data/professional.json'),
            fetch('./assets/data/showcases.json'),
            fetch('./assets/data/distinctions.json')
        ]);
        translations = await transRes.json();
        professionalData = await profRes.json();
        showcasesData = await showRes.json();
        distinctionsData = await distRes.json();
    } catch (e) {
        console.error('Failed to load data:', e);
    }
}

// --- RENDER EXPERIENCE ---
function renderExperience() {
    const container = document.getElementById('experienceList');
    const items = expShowingAll ? professionalData : professionalData.slice(0, 3);
    container.innerHTML = items.map(exp => `
        <div class="cyber-panel p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start ${exp.websiteUrl ? 'cursor-pointer' : ''}" ${exp.websiteUrl ? `onclick="window.open('${exp.websiteUrl}', '_blank')"` : ''}>
            <div class="md:col-span-1 flex flex-col gap-2">
                <span class="text-cyber-accent font-bold text-sm">${currentLang === 'en' ? exp.periodEn : exp.periodFr}</span>
                ${exp.logoUrl ? `<img src="${exp.logoUrl}" alt="${exp.organisation}" class="h-25 w-25 object-contain bg-cyber-bg p-1 border border-cyber-border">` : ''}
            </div>
            <div class="md:col-span-3 space-y-2">
                <h3 class="text-xl font-bold text-white">${currentLang === 'en' ? exp.roleEn : exp.roleFr}</h3>
                <p class="text-cyber-danger text-sm">${exp.organisation} <span class="text-cyber-muted">| ${currentLang === 'en' ? exp.locationEn : exp.locationFr}</span></p>
                <p class="text-cyber-muted text-sm leading-relaxed">${currentLang === 'en' ? exp.descriptionEn : exp.descriptionFr}</p>
            </div>
        </div>
    `).join('');
    updateToggleBtn('toggleExpBtn', 'experience.seeMore', 'experience.seeLess', expShowingAll);
}

// --- RENDER PROJECTS ---
function renderProjects() {
    const container = document.getElementById('projectGrid');
    const items = projShowingAll ? showcasesData : showcasesData.slice(0, 4);
    container.innerHTML = items.map(proj => `
        <div class="cyber-panel flex flex-col h-full">
            <div class="relative overflow-hidden group aspect-video bg-black">
                <img src="${proj.imageUrl}" alt="${currentLang === 'en' ? proj.titleEn : proj.titleFr}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                ${proj.websiteUrl ? `
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href="${proj.websiteUrl}" target="_blank" class="px-4 py-2 border border-cyber-accent text-cyber-accent text-xs font-bold uppercase tracking-wider bg-black hover:bg-cyber-accent hover:text-black transition-all">${t('projects.visitSite')}</a>
                </div>` : ''}
            </div>
            <div class="p-6 flex flex-col justify-between flex-grow">
                <div class="space-y-2">
                    <h3 class="text-xl font-bold text-white">${currentLang === 'en' ? proj.titleEn : proj.titleFr}</h3>
                    <p class="text-cyber-accent text-xs">${proj.organisation}</p>
                    <p class="text-cyber-muted text-sm line-clamp-3">${currentLang === 'en' ? proj.descriptionEn : proj.descriptionFr}</p>
                    ${proj.tech && proj.tech.length ? `
                    <div class="flex flex-wrap gap-2 pt-2">
                        ${proj.tech.map(t => `<img src="${t}" alt="tech" class="h-5 w-5 object-contain">`).join('')}
                    </div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    updateToggleBtn('toggleProjBtn', 'projects.seeMore', 'projects.seeLess', projShowingAll);
}

// --- RENDER CERTIFICATIONS ---
function renderCertifications() {
    const container = document.getElementById('certList');
    const items = certShowingAll ? distinctionsData : distinctionsData.slice(0, 2);
    container.innerHTML = items.map(cert => `
        <div class="cyber-panel p-6 space-y-3">
            <div class="flex justify-between items-start">
                <span class="text-xs text-cyber-accent">${cert.provider} (${currentLang === 'en' ? cert.dateEn : cert.dateFr})</span>
                <span class="px-2 py-0.5 border border-cyber-danger text-cyber-danger text-[10px] uppercase">${currentLang === 'en' ? cert.typeEn : cert.typeFr}</span>
            </div>
            <h3 class="text-lg font-bold text-white">${currentLang === 'en' ? cert.titleEn : cert.titleFr}</h3>
            ${(currentLang === 'en' ? cert.subTitleEn : cert.subTitleFr) ? `<p class="text-cyber-accent text-xs">${currentLang === 'en' ? cert.subTitleEn : cert.subTitleFr}</p>` : ''}
            <p class="text-cyber-muted text-xs leading-relaxed">${currentLang === 'en' ? cert.descriptionEn : cert.descriptionFr}</p>
        </div>
    `).join('');
    updateToggleBtn('toggleCertBtn', 'certifications.seeMore', 'certifications.seeLess', certShowingAll);
}

function updateToggleBtn(btnId, showKey, hideKey, isShowingAll) {
    const btn = document.getElementById(btnId);
    btn.textContent = t(isShowingAll ? hideKey : showKey);
}

// --- TOGGLE FUNCTIONS ---
window.toggleExperience = function() {
    expShowingAll = !expShowingAll;
    renderExperience();
    if (expShowingAll) {
        gsap.fromTo('#experienceList > div:not(:nth-child(-n+3))',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
        );
    }
};

window.toggleProjects = function() {
    projShowingAll = !projShowingAll;
    renderProjects();
    if (projShowingAll) {
        gsap.fromTo('#projectGrid > div:nth-child(n+5)',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }
        );
    }
};

window.toggleCertifications = function() {
    certShowingAll = !certShowingAll;
    renderCertifications();
    if (certShowingAll) {
        gsap.fromTo('#certList > div:nth-child(n+3)',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }
        );
    }
};

// --- TYPING EFFECT ---
let phraseIdx = 0;
let charIdx = 0;
let currentPhrase = '';
const targetEl = document.querySelector("#typingEffect span:nth-child(2)");

function getTypingPhrases() {
    return translations.typingPhrases && translations.typingPhrases[currentLang]
        ? translations.typingPhrases[currentLang]
        : ["Innovation is only valuable when it sustainably improves the lives of people and organisations."];
}

function type() {
    const phrases = getTypingPhrases();
    if (charIdx < phrases[phraseIdx].length) {
        currentPhrase += phrases[phraseIdx].charAt(charIdx);
        targetEl.textContent = currentPhrase;
        charIdx++;
        typeInterval = setTimeout(type, 60);
    } else {
        typeInterval = setTimeout(erase, 2500);
    }
}

function erase() {
    if (charIdx > 0) {
        currentPhrase = currentPhrase.substring(0, currentPhrase.length - 1);
        targetEl.textContent = currentPhrase;
        charIdx--;
        typeInterval = setTimeout(erase, 30);
    } else {
        phraseIdx = (phraseIdx + 1) % getTypingPhrases().length;
        typeInterval = setTimeout(type, 500);
    }
}

function restartTyping() {
    if (typeInterval) clearTimeout(typeInterval);
    phraseIdx = 0;
    charIdx = 0;
    currentPhrase = '';
    targetEl.textContent = '';
    setTimeout(type, 500);
}

// --- CANVAS PARTICLES ---
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.min(80, window.innerWidth / 15);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- SCROLL TO TOP ---
const scrollBtn = document.getElementById('scrollTopBtn');
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('show', window.scrollY > header.offsetHeight);
}, { passive: true });

// --- INIT ---
document.getElementById('toggleExpBtn').addEventListener('click', window.toggleExperience);
document.getElementById('toggleProjBtn').addEventListener('click', window.toggleProjects);
document.getElementById('toggleCertBtn').addEventListener('click', window.toggleCertifications);

async function init() {
    await loadData();
    updateLangBtns();
    applyTranslations();
    renderExperience();
    renderProjects();
    renderCertifications();
    setTimeout(type, 1000);

    gsap.registerPlugin(ScrollTrigger);
    const reveal = (selector, triggerId) => {
        gsap.from(selector, {
            scrollTrigger: { trigger: triggerId, start: "top 80%" },
            y: 30,
            duration: 0.6,
            stagger: 0.15,
            clearProps: "transform"
        });
    };
    reveal("#experienceList > .cyber-panel", "#experience");
    reveal("#projectGrid > .cyber-panel", "#projects");
    reveal("#certList > .cyber-panel", "#certifications");
}

init();
