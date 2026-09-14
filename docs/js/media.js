// Nagrania lektora i filmy.
// Specyfikacja: pakiet_wykonawczy_v1/04_AUDIO.md. Brak pliku = brak przycisku; tekst zawsze pozostaje.
(function () {
  'use strict';
  var manifest = window.GOZ_AUDIO_MANIFEST || { clips: [] };
  var films = window.GOZ_FILMS_MANIFEST || {};
  var config = window.GOZ_MEDIA_CONFIG || { audio: {}, films: {} };

  // Jeden współdzielony odtwarzacz nagrań.
  var player = new Audio();
  player.preload = 'none';
  var current = null; // { id, ui }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }

  function clipSource(id) {
    if (config.audio && typeof config.audio[id] === 'string' && config.audio[id]) return config.audio[id];
    var clip = manifest.clips.filter(function (c) { return c.id === id; })[0];
    return clip && clip.src ? clip.src : null;
  }

  function setUi(ui, stateName) {
    ui.state = stateName;
    var labels = { ready: 'Posłuchaj', loading: 'Ładowanie nagrania', playing: 'Wstrzymaj', paused: 'Wznów', ended: 'Posłuchaj', error: 'Spróbuj ponownie' };
    ui.button.textContent = labels[stateName];
    ui.button.setAttribute('aria-pressed', stateName === 'playing' ? 'true' : 'false');
    ui.restart.hidden = !(stateName === 'playing' || stateName === 'paused');
    ui.status.textContent = stateName === 'error' ? 'Nagranie jest niedostępne. Przeczytaj tekst lub spróbuj ponownie.' : '';
    ui.host.classList.toggle('is-playing', stateName === 'playing');
  }

  function stopCurrent() {
    if (!current) return;
    player.pause();
    if (current.ui.state === 'playing' || current.ui.state === 'loading') setUi(current.ui, 'paused');
  }

  function play(id, ui, fromStart) {
    pauseVideos();
    if (!current || current.id !== id) {
      stopCurrent();
      current = { id: id, ui: ui };
      player.src = clipSource(id);
      fromStart = true;
    }
    if (fromStart) { try { player.currentTime = 0; } catch (e) { /* plik jeszcze nie wczytany */ } }
    setUi(ui, 'loading');
    var attempt = player.play();
    if (attempt && attempt.then) {
      attempt.then(function () { setUi(ui, 'playing'); }).catch(function () { setUi(ui, 'error'); });
    }
  }

  player.addEventListener('playing', function () { if (current) setUi(current.ui, 'playing'); });
  player.addEventListener('ended', function () { if (current) setUi(current.ui, 'ended'); });
  player.addEventListener('error', function () { if (current) setUi(current.ui, 'error'); });

  function mountAudio(root) {
    var hosts = (root || document).querySelectorAll('[id^="audio-"]');
    Array.prototype.forEach.call(hosts, function (host) {
      var id = host.id.slice('audio-'.length);
      var existing = host.querySelector(':scope > .audio-controls');
      if (existing) existing.remove();
      var src = clipSource(id);
      if (!src) return; // brak pliku: żadnej pozornej kontrolki
      var box = el('div', { class: 'audio-controls' });
      var button = el('button', { type: 'button', class: 'audio-button' });
      var restart = el('button', { type: 'button', class: 'audio-restart' }, 'Od początku');
      var status = el('p', { class: 'audio-status', role: 'status' });
      box.appendChild(button); box.appendChild(restart); box.appendChild(status);
      host.insertBefore(box, host.firstChild);
      var ui = { host: host, button: button, restart: restart, status: status, state: 'ready' };
      setUi(ui, 'ready');
      button.addEventListener('click', function () {
        if (current && current.id === id && ui.state === 'playing') { player.pause(); setUi(ui, 'paused'); return; }
        if (current && current.id === id && ui.state === 'paused') { play(id, ui, false); return; }
        play(id, ui, true);
      });
      restart.addEventListener('click', function () { play(id, ui, true); });
    });
  }

  // --- Filmy ---------------------------------------------------------------

  var videos = [];
  var filmVideos = {};
  function pauseVideos(except) { videos.forEach(function (v) { if (v !== except && !v.paused) v.pause(); }); }
  // Teksty finału z kartami (finale_texts.json) dla F02: brak pliku i błąd odtwarzania.
  function cardsText(key) { return window.GOZ_FINALE_CARDS && window.GOZ_FINALE_CARDS.texts[key]; }

  function transcript(filmId, open) {
    var details = el('details', { class: 'transcript' });
    if (open) details.open = true;
    details.appendChild(el('summary', {}, 'Tekst wiadomości (transkrypcja)'));
    var film = films[filmId];
    if (film && film.status && film.status.indexOf('draft') !== -1) {
      details.appendChild(el('p', { class: 'draft-note' }, 'Wersja robocza: szkic narracji ze scenariusza. Ostateczna transkrypcja powstanie po montażu filmu.'));
    }
    String(film ? film.narration : '').split('\n').forEach(function (para) {
      if (para.trim()) details.appendChild(el('p', {}, para));
    });
    return details;
  }

  function fallback(container, filmId, reason) {
    container.innerHTML = '';
    delete filmVideos[filmId];
    var box = el('div', { class: 'film-placeholder', role: 'note' });
    if (filmId === 'f02' && cardsText('missingFilm')) {
      // F02: komunikaty z finale_texts.json; przy błędzie pliku możliwość ponowienia (12 §4).
      box.appendChild(el('p', { class: 'film-placeholder-title' }, reason === 'error' ? cardsText('filmError') : cardsText('missingFilm')));
      if (reason === 'error') {
        var retry = el('button', { type: 'button', class: 'button film-retry' }, 'Spróbuj ponownie');
        retry.addEventListener('click', function () { mountFilm(container); var v = filmVideos[filmId]; if (v) attemptPlay(filmId); });
        box.appendChild(retry);
      }
    } else {
      box.appendChild(el('p', { class: 'film-placeholder-title' }, reason === 'error' ? 'Nie udało się odtworzyć filmu.' : 'Film w przygotowaniu'));
      box.appendChild(el('p', {}, reason === 'error'
        ? 'Poniżej znajdziesz tekst wiadomości. Możesz przejść dalej.'
        : 'Wersja robocza: film dostarczy autor. Poniżej przeczytasz tekst wiadomości. Możesz przejść dalej bez oglądania.'));
    }
    container.appendChild(box);
    container.appendChild(transcript(filmId, true));
  }

  // Jedna próba play() (bez ponawiania i bez wyciszonego obejścia). Wynik: 'missing' | 'playing' | 'blocked' | 'error'.
  function attemptPlay(filmId) {
    var video = filmVideos[filmId];
    if (!video) return Promise.resolve('missing');
    stopCurrent();
    pauseVideos(video);
    var result;
    try { result = video.play(); } catch (e) { return Promise.resolve('error'); }
    if (!result || !result.then) return Promise.resolve('playing');
    return result.then(function () { return 'playing'; }, function (err) { return err && err.name === 'NotAllowedError' ? 'blocked' : 'error'; });
  }

  function mountFilm(container) {
    var filmId = container.getAttribute('data-film');
    var cfg = (config.films && config.films[filmId]) || {};
    if (!cfg.video) { fallback(container, filmId, 'missing'); return; }
    container.innerHTML = '';
    var frame = el('div', { class: 'film-frame' });
    var video = el('video', { controls: '', preload: cfg.preload || 'metadata', playsinline: '' });
    filmVideos[filmId] = video;
    if (cfg.poster) video.setAttribute('poster', cfg.poster);
    var source = el('source', { src: cfg.video, type: cfg.type || 'video/mp4' });
    video.appendChild(source);
    if (cfg.captionsPl) video.appendChild(el('track', { kind: 'captions', srclang: 'pl', label: 'Polski', src: cfg.captionsPl, default: '' }));
    source.addEventListener('error', function () { fallback(container, filmId, 'error'); });
    video.addEventListener('error', function () { fallback(container, filmId, 'error'); });
    video.addEventListener('play', function () { stopCurrent(); pauseVideos(video); });
    videos.push(video);
    frame.appendChild(video);
    container.appendChild(frame);
    container.appendChild(transcript(filmId, false));
  }

  window.GOZMedia = {
    init: function () {
      mountAudio(document);
      Array.prototype.forEach.call(document.querySelectorAll('[data-film]'), mountFilm);
      document.addEventListener('visibilitychange', function () { if (document.hidden) { stopCurrent(); pauseVideos(); } });
    },
    refreshAudio: function (root) { mountAudio(root || document); },
    // Zmiana rozdziału przyciskiem lub mapą wstrzymuje narrację.
    pauseAll: function () { stopCurrent(); pauseVideos(); },
    // Zmiana dynamicznie widocznego opisu wstrzymuje nagranie tego opisu.
    pauseInside: function (node) { if (current && node.contains(current.ui.host)) stopCurrent(); },
    // Finał z kartami: próba odtworzenia F02 wywoływana wyłącznie w obsłudze świadomej aktywacji (12 §4).
    hasFilm: function (filmId) { return !!filmVideos[filmId]; },
    playFilm: function (filmId) { return attemptPlay(filmId); },
    remountFilm: function (filmId) { var c = document.querySelector('[data-film="' + filmId + '"]'); if (c) mountFilm(c); },
    clipText: function (id) { var c = manifest.clips.filter(function (x) { return x.id === id; })[0]; return c ? c.text : null; }
  };
})();
