/* =====================================================
   ELEMENT SELECTION
===================================================== */
const tonearm = document.querySelector(".tonearm");
const vinyl = document.querySelector(".vinyl");
const dragMe = document.querySelector(".drag-me");
const nowPlaying = document.querySelector(".now-playing");

const audio = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause-btn");
const seekBar = document.getElementById("seek-bar");
const currentTimeEl = document.getElementById("current-time");
const durationTimeEl = document.getElementById("duration-time");

const nextBtn = document.getElementById("next-btn");
const birthdayPage = document.getElementById("birthday-page");
const backBtn = document.getElementById("back-btn");
const turntable = document.querySelector(".turntable");

const titleEl = document.getElementById("typewriter-title");
const textEl = document.getElementById("typewriter-text");

/* =====================================================
   DATA UCAPAN ULANG TAHUN
===================================================== */
const SONG_TITLE = "last here all alone - ACT III : The Return";
const ARTIST_NAME = "eleventwelfth";

const birthdayTitle = "HAPPY BIRTHDAY !!!!";
const birthdayText = "selamat ulang tahun yaaaa \n\n semoga di usia mu yang bertambah ini kamu selalu diberikan kebahagiaan, kesehatan, dan kemudahan dalam meraih semua impianmu. makasiiii juga udah mau jadi temen aku hehehehe, semoga kedepannya kita masi bisa temenan baik baik yaaa, and then we can go to gigs together... someday (i can't wait it actually ahahhahaha). ohh iya semangat terus yaa sekolahnya, jangan terlalu di paksain dalam melakukan suatu hal, ntar hasilnya malah berbanding sebaliknya, jaga pola makanmu juga, jangan lupa makannnn, apa lagi yaa aku ga bisa bikin ucapan aihhh (intinya gituu dehh, aku doa yang baik baik buat kamu) ohhh iyaa ingat lirik lagunya fstvlst : maka sudahilah, sedihmu yang belum sudah, segera mulailah, syukurmu yang pasti indah, berbahagialahhhhh, bahagialahh. #wongkalahan ";

const songTitleEl = document.querySelector(".song-title");
const artistNameEl = document.querySelector(".artist-name");

if (songTitleEl) songTitleEl.textContent = SONG_TITLE;
if (artistNameEl) artistNameEl.textContent = ARTIST_NAME;

/* =====================================================
   TONEARM SETTINGS
===================================================== */
const START_ANGLE = 0;
const PLAY_ANGLE = -18; 

let currentAngle = START_ANGLE;
let isDragging = false;
let isPlaying = false;

/* =====================================================
   FORMAT WAKTU
===================================================== */
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/* =====================================================
   AUDIO LISTENERS
===================================================== */
if (audio) {
    audio.addEventListener("loadedmetadata", () => {
        if (seekBar) seekBar.max = audio.duration;
        if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        if (seekBar) seekBar.value = audio.currentTime;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });
}

if (seekBar) {
    seekBar.addEventListener("input", () => {
        if (audio) audio.currentTime = seekBar.value;
    });
}

if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
        if (!audio) return;

        if (audio.paused) {
            audio.play().catch(e => console.log(e));
            playPauseBtn.textContent = "⏸";
            vinyl.style.animationPlayState = "running";
        } else {
            audio.pause();
            playPauseBtn.textContent = "▶";
            vinyl.style.animationPlayState = "paused";
        }
    });
}

/* =====================================================
   SET TONEARM ANGLE & STATE CONTROL
===================================================== */
function setTonearmAngle(angle) {
    angle = Math.max(PLAY_ANGLE, Math.min(START_ANGLE, angle));
    currentAngle = angle;
    tonearm.style.setProperty("--tonearm-angle", `${angle}deg`);

    if (angle <= PLAY_ANGLE) {
        startPlaying();
    } else if (angle > PLAY_ANGLE + 5) {
        stopPlaying();
    }
}

function startPlaying() {
    if (isPlaying) return;
    isPlaying = true;

    vinyl.classList.add("playing");
    vinyl.style.animationPlayState = "running";

    if (dragMe) dragMe.classList.add("hidden");
    if (nowPlaying) nowPlaying.classList.add("active");

    if (nextBtn) {
        nextBtn.classList.remove("hidden");
    }

    if (audio) {
        audio.play().catch(e => console.log("Audio play error:", e));
        if (playPauseBtn) playPauseBtn.textContent = "⏸";
    }
}

function stopPlaying() {
    if (!isPlaying) return;
    isPlaying = false;

    vinyl.classList.remove("playing");

    if (dragMe) dragMe.classList.remove("hidden");
    if (nowPlaying) nowPlaying.classList.remove("active");

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}

/* =====================================================
   DRAG TONEARM EVENT LISTENERS
===================================================== */
tonearm.addEventListener("pointerdown", function(event) {
    isDragging = true;
    tonearm.style.cursor = "grabbing";
    tonearm.setPointerCapture(event.pointerId);
    event.preventDefault();
});

tonearm.addEventListener("pointermove", function(event) {
    if (!isDragging) return;

    const rect = tonearm.getBoundingClientRect();
    const pivotX = rect.left + (340 * rect.width / 390);
    const pivotY = rect.top + (75 * rect.height / 150);

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const dx = mouseX - pivotX;
    const dy = mouseY - pivotY;

    let mouseAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    let angle = mouseAngle - 180;

    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    angle = Math.max(PLAY_ANGLE, Math.min(START_ANGLE, angle));

    setTonearmAngle(angle);
});

tonearm.addEventListener("pointerup", function(event) {
    isDragging = false;
    tonearm.style.cursor = "grab";
    try {
        tonearm.releasePointerCapture(event.pointerId);
    } catch (error) {}
});

tonearm.addEventListener("pointercancel", function() {
    isDragging = false;
    tonearm.style.cursor = "grab";
});

/* =====================================================
   FUNGSI TYPEWRITER (KETIK SATU-SATU)
===================================================== */
let titleIndex = 0;
let textIndex = 0;

function startTypewriter() {
    titleEl.textContent = "";
    textEl.textContent = "";
    titleIndex = 0;
    textIndex = 0;
    
    if (backBtn) backBtn.classList.add("hidden"); // Sembunyikan tombol back awal-awal

    const cursor = document.createElement("span");
    cursor.className = "cursor";

    function typeTitle() {
        if (titleIndex < birthdayTitle.length) {
            titleEl.textContent += birthdayTitle.charAt(titleIndex);
            titleIndex++;
            setTimeout(typeTitle, 80);
        } else {
            textEl.appendChild(cursor);
            setTimeout(typeText, 300);
        }
    }

    function typeText() {
        if (textIndex < birthdayText.length) {
            cursor.remove();
            textEl.textContent += birthdayText.charAt(textIndex);
            textEl.appendChild(cursor);
            textIndex++;
            setTimeout(typeText, 45);
        } else {
            cursor.remove();
            if (backBtn) backBtn.classList.remove("hidden"); // Tampilkan tombol back saat selesai
        }
    }

    typeTitle();
}

/* =====================================================
   TOMOBOL NEXT & BACK EVENT LISTENERS
===================================================== */
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (audio) audio.pause(); // Jeda audio saat berpindah halaman
        if (turntable) turntable.classList.add("hidden");
        if (birthdayPage) birthdayPage.classList.remove("hidden");
        
        startTypewriter(); // Jalankan efek mengetik
    });
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        if (birthdayPage) birthdayPage.classList.add("hidden");
        if (turntable) turntable.classList.remove("hidden");
    });
}