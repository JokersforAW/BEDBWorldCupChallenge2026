/* ==========================================================================
   FIFA WORLD CUP PREDICTION CHALLENGE — script.js
   Pure vanilla JS. No frameworks, no backend.
   All "live" data below is fake demo data for internal office fun.
   ========================================================================== */

(function(){
  "use strict";

  /* ---------------------------------------------------------------------
     CONFIG — edit these to run your own office prediction game
     --------------------------------------------------------------------- */
  const CONFIG = {
    // Deadline for predictions (edit to your office's cutoff date/time)
    deadline: new Date("2026-07-15T18:00:00"),
    storageKey: "wcpc_prediction_v1",
  };

  // Quarter finalist teams — flag emoji, name, and a short badge/code
  const TEAMS = [
    { id:"fra", name:"France",      flag:"🇫🇷", code:"FRA" },
    { id:"esp", name:"Spain",       flag:"🇪🇸", code:"ESP" },
    { id:"bel", name:"Belgium",     flag:"🇧🇪", code:"BEL" },
    { id:"eng", name:"England",     flag:"🏴", code:"ENG" },
    { id:"nor", name:"Norway",      flag:"🇳🇴", code:"NOR" },
    { id:"mar", name:"Morocco",     flag:"🇲🇦", code:"MAR" },
    { id:"arg", name:"Argentina",   flag:"🇦🇷", code:"ARG" },
    { id:"sui", name:"Switzerland", flag:"🇨🇭", code:"SUI" },
  ];

  // Fake "live popular picks" demo data (percentages need not sum to 100)
  const POPULAR_PICKS = [
    { id:"esp", votes:21 },
    { id:"arg", votes:18 },
    { id:"fra", votes:12 },
    { id:"eng", votes:8 },
    { id:"bel", votes:6 },
    { id:"nor", votes:4 },
    { id:"mar", votes:3 },
    { id:"sui", votes:2 },
  ];

  /* ---------------------------------------------------------------------
     STATE
     --------------------------------------------------------------------- */
  let state = {
    selectedId: null,
    submitted: false,
    submittedTeamId: null,
    submittedTime: null,
  };

  try{
    const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "null");
    if(saved && saved.submitted){
      state = saved;
    }
  }catch(e){ /* ignore corrupted storage */ }

  function persist(){
    try{ localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
    catch(e){ /* storage unavailable, fine — session-only */ }
  }

  /* ---------------------------------------------------------------------
     SOUND (tiny WebAudio beeps — no external files needed)
     --------------------------------------------------------------------- */
  let soundOn = false;
  let audioCtx = null;
  function playTone(freq, duration, type){
    if(!soundOn) return;
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }catch(e){ /* audio not available */ }
  }
  const sfx = {
    click: () => playTone(520, 0.12, "triangle"),
    select: () => playTone(720, 0.15, "sine"),
    submit: () => { playTone(660, 0.15, "sine"); setTimeout(()=>playTone(880,0.2,"sine"), 120); },
  };

  const soundToggleBtn = document.getElementById("sound-toggle");
  soundToggleBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggleBtn.setAttribute("aria-pressed", String(soundOn));
    if(soundOn) playTone(600, 0.1, "sine");
  });

  /* ---------------------------------------------------------------------
     LOADING SCREEN
     --------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("loading-screen").classList.add("hidden");
    }, 700);
  });

  /* ---------------------------------------------------------------------
     FLOATING BACKGROUND BALLS
     --------------------------------------------------------------------- */
  (function spawnFloatingBalls(){
    const wrap = document.getElementById("floating-balls");
    const count = window.innerWidth < 640 ? 6 : 12;
    for(let i=0;i<count;i++){
      const el = document.createElement("span");
      el.className = "fb";
      el.textContent = "⚽";
      el.style.left = Math.random()*100 + "%";
      el.style.animationDuration = (14 + Math.random()*14) + "s";
      el.style.animationDelay = (Math.random()*14) + "s";
      el.style.fontSize = (0.9 + Math.random()*1.3) + "rem";
      wrap.appendChild(el);
    }
  })();

  /* ---------------------------------------------------------------------
     SMOOTH START
     --------------------------------------------------------------------- */
  document.getElementById("start-btn").addEventListener("click", () => {
    sfx.click();
    document.getElementById("quarter-finalists").scrollIntoView({ behavior:"smooth" });
  });

  /* ---------------------------------------------------------------------
     SCOREBOARD COUNTDOWN (flip-digit style)
     --------------------------------------------------------------------- */
  const digitTargets = {
    days: document.getElementById("days-digits"),
    hours: document.getElementById("hours-digits"),
    minutes: document.getElementById("minutes-digits"),
    seconds: document.getElementById("seconds-digits"),
  };
  const lastValues = { days:null, hours:null, minutes:null, seconds:null };

  function renderDigits(container, value, prevValue){
    const str = String(value).padStart(2, "0");
    container.innerHTML = "";
    for(let i=0;i<str.length;i++){
      const box = document.createElement("div");
      box.className = "flip-digit";
      if(prevValue !== null && String(prevValue).padStart(2,"0")[i] !== str[i]){
        box.classList.add("flipping");
      }
      const span = document.createElement("span");
      span.textContent = str[i];
      box.appendChild(span);
      container.appendChild(box);
    }
  }

  function updateCountdown(){
    const now = new Date();
    const diff = CONFIG.deadline - now;
    const scoreboard = document.getElementById("scoreboard");
    const closedMsg = document.getElementById("countdown-closed-msg");

    if(diff <= 0){
      scoreboard.style.display = "none";
      closedMsg.hidden = false;
      return;
    }

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    renderDigits(digitTargets.days, days, lastValues.days);
    renderDigits(digitTargets.hours, hours, lastValues.hours);
    renderDigits(digitTargets.minutes, minutes, lastValues.minutes);
    renderDigits(digitTargets.seconds, seconds, lastValues.seconds);

    lastValues.days = days; lastValues.hours = hours;
    lastValues.minutes = minutes; lastValues.seconds = seconds;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------------------
     TEAM GRIDS — Quarter Finalists (display) + Choose Winner (selectable)
     --------------------------------------------------------------------- */
  function buildTeamCard(team, selectable){
    const card = document.createElement("div");
    card.className = "team-card" + (selectable ? " selectable" : "");
    card.dataset.teamId = team.id;
    card.setAttribute("role", selectable ? "button" : "group");
    if(selectable){
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-pressed", "false");
    }
    card.innerHTML = `
      <div class="team-check" aria-hidden="true">✓</div>
      <div class="team-flag" aria-hidden="true">${team.flag}</div>
      <div class="team-name">${team.name}</div>
      <div class="team-badge">${team.code} · QUARTERFINALIST</div>
    `;
    return card;
  }

  const qfGrid = document.getElementById("qf-grid");
  const pickGrid = document.getElementById("pick-grid");

  TEAMS.forEach(team => {
    qfGrid.appendChild(buildTeamCard(team, false));
    pickGrid.appendChild(buildTeamCard(team, true));
  });

  function syncSelectedUI(){
    document.querySelectorAll("#pick-grid .team-card").forEach(card => {
      const isSelected = card.dataset.teamId === state.selectedId;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    });
  }

  pickGrid.addEventListener("click", (e) => {
    if(state.submitted) return;
    const card = e.target.closest(".team-card");
    if(!card) return;
    state.selectedId = card.dataset.teamId;
    sfx.select();
    syncSelectedUI();
    updateBetSlip();
  });

  pickGrid.addEventListener("keydown", (e) => {
    if(state.submitted) return;
    if(e.key === "Enter" || e.key === " "){
      const card = e.target.closest(".team-card");
      if(!card) return;
      e.preventDefault();
      state.selectedId = card.dataset.teamId;
      sfx.select();
      syncSelectedUI();
      updateBetSlip();
    }
  });

  /* ---------------------------------------------------------------------
     BET SLIP PANEL
     --------------------------------------------------------------------- */
  const betSlip = document.getElementById("bet-slip");
  const betSlipToggle = document.getElementById("bet-slip-toggle");
  const betSlipEmpty = document.getElementById("bet-slip-empty");
  const betSlipFilled = document.getElementById("bet-slip-filled");
  const slipFlag = document.getElementById("slip-flag");
  const slipName = document.getElementById("slip-name");
  const slipTime = document.getElementById("slip-time");
  const slipStatus = document.getElementById("slip-status");
  const placeBtn = document.getElementById("place-prediction-btn");

  betSlipToggle.addEventListener("click", () => {
    betSlip.classList.toggle("collapsed");
  });

  function findTeam(id){ return TEAMS.find(t => t.id === id); }

  function formatTime(date){
    return date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  }

  function updateBetSlip(){
    const team = findTeam(state.selectedId);
    if(!team){
      betSlipEmpty.hidden = false;
      betSlipFilled.hidden = true;
      return;
    }
    betSlipEmpty.hidden = true;
    betSlipFilled.hidden = false;
    slipFlag.textContent = team.flag;
    slipName.textContent = team.name;
    slipTime.textContent = formatTime(new Date());
    if(state.submitted){
      slipStatus.textContent = "Submitted";
      slipStatus.classList.add("submitted");
      placeBtn.disabled = true;
      placeBtn.querySelector("span").textContent = "Prediction Locked In";
    } else {
      slipStatus.textContent = "Not submitted";
      slipStatus.classList.remove("submitted");
      placeBtn.disabled = false;
    }
  }

  placeBtn.addEventListener("click", () => {
    if(!state.selectedId || state.submitted) return;
    state.submitted = true;
    state.submittedTeamId = state.selectedId;
    state.submittedTime = new Date().toISOString();
    persist();
    sfx.submit();
    lockPredictionUI();
    showConfirmation();
  });

  function lockPredictionUI(){
    document.querySelectorAll("#pick-grid .team-card").forEach(card => {
      card.classList.remove("selectable");
      card.style.pointerEvents = "none";
    });
    updateBetSlip();
  }

  /* ---------------------------------------------------------------------
     CONFIRMATION MODAL + CONFETTI
     --------------------------------------------------------------------- */
  const modal = document.getElementById("confirmation-modal");
  const confirmPick = document.getElementById("confirm-pick");
  const confirmTime = document.getElementById("confirm-time");

  function showConfirmation(){
    const team = findTeam(state.submittedTeamId);
    if(team) confirmPick.textContent = `${team.flag} ${team.name}`;
    confirmTime.textContent = formatTime(new Date(state.submittedTime));
    modal.hidden = false;
    runConfetti();
  }

  document.getElementById("close-confirm-btn").addEventListener("click", () => {
    modal.hidden = true;
  });
  document.getElementById("print-btn").addEventListener("click", () => {
    window.print();
  });

  function runConfetti(){
    const canvas = document.getElementById("confetti-canvas");
    const card = document.getElementById("confirmation-card");
    const rect = card.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    const colors = ["#FFD54F", "#0D6EFD", "#00C853", "#FFFFFF", "#FF5252"];
    const particles = Array.from({length: 90}, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random()*colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    let frame = 0;
    const maxFrames = 160;
    function tick(){
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      });
      if(frame < maxFrames){
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------------
     LIVE POPULAR PICKS (fake demo data, animated bars)
     --------------------------------------------------------------------- */
  const barsWrap = document.getElementById("bars-wrap");
  const sortedPicks = [...POPULAR_PICKS].sort((a,b) => b.votes - a.votes);
  const maxVotes = Math.max(...sortedPicks.map(p => p.votes));

  sortedPicks.forEach(pick => {
    const team = findTeam(pick.id);
    const row = document.createElement("div");
    row.className = "bar-row reveal";
    row.innerHTML = `
      <div class="bar-team"><span>${team.flag}</span><span>${team.name}</span></div>
      <div class="bar-track"><div class="bar-fill" data-target="${(pick.votes/maxVotes*100).toFixed(0)}"></div></div>
      <div class="bar-pct">${pick.votes}</div>
    `;
    barsWrap.appendChild(row);
  });

  /* ---------------------------------------------------------------------
     LEADERBOARD (podium + list), derived from the same demo data
     --------------------------------------------------------------------- */
  const podium = document.getElementById("podium");
  const leaderboardList = document.getElementById("leaderboard-list");
  const top3 = sortedPicks.slice(0, 3);
  const rest = sortedPicks.slice(3);
  const medalClass = ["gold", "silver", "bronze"];
  const medalIcon = ["🥇", "🥈", "🥉"];

  top3.forEach((pick, i) => {
    const team = findTeam(pick.id);
    const place = document.createElement("div");
    place.className = `podium-place ${medalClass[i]} reveal`;
    place.innerHTML = `
      <div class="medal">${medalIcon[i]}</div>
      <div class="podium-flag">${team.flag}</div>
      <div class="podium-name">${team.name}</div>
      <div class="podium-count" data-count="${pick.votes}">0</div>
    `;
    podium.appendChild(place);
  });

  rest.forEach((pick, i) => {
    const team = findTeam(pick.id);
    const row = document.createElement("div");
    row.className = "lb-row reveal";
    row.innerHTML = `
      <div class="lb-rank">#${i+4}</div>
      <div class="lb-team"><span>${team.flag}</span><span>${team.name}</span></div>
      <div class="lb-count" data-count="${pick.votes}">0</div>
    `;
    leaderboardList.appendChild(row);
  });

  function animateCount(el){
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      current += step;
      if(current >= target){
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 30);
  }

  /* ---------------------------------------------------------------------
     REVEAL-ON-SCROLL (bars fill + counters animate + fade-ins)
     --------------------------------------------------------------------- */
  document.querySelectorAll(".how-card, .team-card, .bar-row, .podium-place, .lb-row").forEach(el => {
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        const fill = entry.target.querySelector(".bar-fill");
        if(fill && !fill.dataset.done){
          fill.style.width = fill.dataset.target + "%";
          fill.dataset.done = "1";
        }
        const counter = entry.target.querySelector("[data-count]");
        if(counter && !counter.dataset.done){
          counter.dataset.done = "1";
          animateCount(counter);
        }
        if(entry.target.dataset.count && !entry.target.dataset.done){
          entry.target.dataset.done = "1";
          animateCount(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  /* ---------------------------------------------------------------------
     INITIAL SYNC (restores a previously submitted prediction, if any)
     --------------------------------------------------------------------- */
  if(state.submitted && state.submittedTeamId){
    state.selectedId = state.submittedTeamId;
    syncSelectedUI();
    lockPredictionUI();
  }
  updateBetSlip();

})();
