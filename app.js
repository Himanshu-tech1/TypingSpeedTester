// app.js - Full TypingSpeedTester Game State Engine, Virtual Keyboard controller, and Level Progression

class EdClubGame {
  constructor() {
    this.currentView = 'roadmap'; // 'roadmap', 'lesson-arena', 'speedtest'
    this.theme = localStorage.getItem('edclub_theme') || 'edclub-light';
    this.handsVisible = localStorage.getItem('edclub_hands') !== 'false';

    // User Progress
    this.progress = this.loadProgress();

    // Active Lesson State
    this.activeLesson = null;
    this.lessonStatus = 'idle'; // 'idle', 'running', 'finished'
    this.charIndex = 0;
    this.lessonStartTime = null;
    this.lessonEndTime = null;
    this.lessonErrors = 0;
    this.lessonCorrect = 0;
    this.lessonTimer = null;

    // Key Trainer State (Specific Key Practice)
    this.trainerMode = false;
    this.selectedTrainerKeys = ['g', 'h'];

    // Free Speed Test State
    this.speedMode = 'time';
    this.speedSubOption = 30;
    this.speedStatus = 'idle';
    this.speedWords = [];
    this.speedWordIdx = 0;
    this.speedCharIdx = 0;
    this.speedStartTime = null;
    this.speedTimer = null;
    this.speedElapsed = 0;
    this.speedTotalKeys = 0;
    this.speedCorrectKeys = 0;

    // Components
    this.keyboard = new VirtualKeyboard('virtualKeyboard', 'fingerGuideText', 'handsContainer');
    this.confetti = new ConfettiLauncher();

    this.cacheDom();
    this.init();
  }

  cacheDom() {
    this.dom = {
      brandLogo: document.getElementById('brandLogo'),
      tabLessons: document.getElementById('tabLessons'),
      tabKeyTrainer: document.getElementById('tabKeyTrainer'),
      tabSpeedTest: document.getElementById('tabSpeedTest'),
      roadmapView: document.getElementById('roadmapView'),
      lessonArenaView: document.getElementById('lessonArenaView'),
      speedTestView: document.getElementById('speedTestView'),
      totalStarsCount: document.getElementById('totalStarsCount'),
      userXpCount: document.getElementById('userXpCount'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      soundStatusText: document.getElementById('soundStatusText'),
      themeStatusText: document.getElementById('themeStatusText'),
      capsLockWarning: document.getElementById('capsLockWarning'),
      toastMsg: document.getElementById('toastMsg'),

      // Key Trainer Panel
      keyTrainerSelectorPanel: document.getElementById('keyTrainerSelectorPanel'),
      ktPresetsList: document.getElementById('ktPresetsList'),
      ktChipsList: document.getElementById('ktChipsList'),
      ktActiveSummary: document.getElementById('ktActiveSummary'),

      // Roadmap
      resumeLessonHeroBtn: document.getElementById('resumeLessonHeroBtn'),
      resumeLessonText: document.getElementById('resumeLessonText'),
      courseProgressText: document.getElementById('courseProgressText'),
      lessonsGrid: document.getElementById('lessonsGrid'),

      // Lesson Arena & Tile Cards
      btnBackToLessons: document.getElementById('btnBackToLessons'),
      arenaBackBtnText: document.getElementById('arenaBackBtnText'),
      arenaLessonNumber: document.getElementById('arenaLessonNumber'),
      arenaLessonTitle: document.getElementById('arenaLessonTitle'),
      arenaLiveWpm: document.getElementById('arenaLiveWpm'),
      arenaLiveAcc: document.getElementById('arenaLiveAcc'),
      arenaStarsPreview: document.getElementById('arenaStarsPreview'),
      lessonProgressFill: document.getElementById('lessonProgressFill'),
      lessonTypingBox: document.getElementById('lessonTypingBox'),
      lessonHiddenInput: document.getElementById('lessonHiddenInput'),
      tilesViewport: document.getElementById('tilesViewport'),
      lessonTilesTrack: document.getElementById('lessonTilesTrack'),
      lessonFocusOverlay: document.getElementById('lessonFocusOverlay'),
      restartLessonBtn: document.getElementById('restartLessonBtn'),
      toggleHandsBtn: document.getElementById('toggleHandsBtn'),
      handsContainer: document.getElementById('handsContainer'),

      // Target Key Spotlight Callout
      targetKeySpotlightBar: document.getElementById('targetKeySpotlightBar'),
      spotlightKeyCapsule: document.getElementById('spotlightKeyCapsule'),
      spotlightCharDisplay: document.getElementById('spotlightCharDisplay'),
      spotlightFingerIcon: document.getElementById('spotlightFingerIcon'),
      spotlightFingerText: document.getElementById('spotlightFingerText'),

      // Victory Modal
      lessonVictoryModal: document.getElementById('lessonVictoryModal'),
      victoryLessonSubtitle: document.getElementById('victoryLessonSubtitle'),
      starsBurstRow: document.getElementById('starsBurstRow'),
      victoryXpEarned: document.getElementById('victoryXpEarned'),
      victoryWpm: document.getElementById('victoryWpm'),
      victoryTargetWpm: document.getElementById('victoryTargetWpm'),
      victoryAcc: document.getElementById('victoryAcc'),
      victoryErrors: document.getElementById('victoryErrors'),
      victoryTime: document.getElementById('victoryTime'),
      victoryReplayBtn: document.getElementById('victoryReplayBtn'),
      victoryNextLessonBtn: document.getElementById('victoryNextLessonBtn'),

      // Speed Test
      speedConfigBar: document.getElementById('speedConfigBar'),
      speedModeGroup: document.getElementById('speedModeGroup'),
      speedSubOptions: document.getElementById('speedSubOptions'),
      speedTimerLabel: document.getElementById('speedTimerLabel'),
      speedHudTimer: document.getElementById('speedHudTimer'),
      speedHudWpm: document.getElementById('speedHudWpm'),
      speedHudAcc: document.getElementById('speedHudAcc'),
      speedArenaWrapper: document.getElementById('speedArenaWrapper'),
      speedTypingInput: document.getElementById('speedTypingInput'),
      speedWordsViewport: document.getElementById('speedWordsViewport'),
      speedWordsContainer: document.getElementById('speedWordsContainer'),
      speedCaret: document.getElementById('speedCaret'),
      speedFocusOverlay: document.getElementById('speedFocusOverlay'),
      speedRestartBtn: document.getElementById('speedRestartBtn'),
      speedResultModal: document.getElementById('speedResultModal'),
      closeSpeedResultBtn: document.getElementById('closeSpeedResultBtn'),
      speedRankBadge: document.getElementById('speedRankBadge'),
      speedFinalWpm: document.getElementById('speedFinalWpm'),
      speedFinalAcc: document.getElementById('speedFinalAcc'),
      speedFinalRaw: document.getElementById('speedFinalRaw'),
      speedFinalTime: document.getElementById('speedFinalTime'),
      speedNextBtn: document.getElementById('speedNextBtn')
    };
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('edclub_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      unlockedLessonId: 1,
      lessonStats: {}, // { 1: { stars: 5, bestWpm: 24, accuracy: 98 } }
      totalXp: 0
    };
  }

  saveProgress() {
    localStorage.setItem('edclub_progress', JSON.stringify(this.progress));
    this.updateUserStatsDisplay();
  }

  init() {
    this.applyTheme(this.theme);
    this.updateSoundDisplay();
    this.updateUserStatsDisplay();
    this.bindEvents();
    this.renderRoadmap();
    this.initKeyTrainerControls();
    this.renderSpeedSubOptions();
    this.setupSpeedTest();
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('edclub_theme', theme);
    this.dom.themeStatusText.textContent = `Theme: ${theme === 'edclub-dark' ? 'Dark' : 'Light'}`;
  }

  toggleTheme() {
    const next = this.theme === 'edclub-light' ? 'edclub-dark' : 'edclub-light';
    this.applyTheme(next);
  }

  toggleSound() {
    const sounds = ['click', 'thock', 'off'];
    const current = sound.soundType;
    const next = sounds[(sounds.indexOf(current) + 1) % sounds.length];
    sound.setSoundType(next);
    this.updateSoundDisplay();
  }

  updateSoundDisplay() {
    const type = sound.soundType;
    const labels = { click: 'Click (Blue)', thock: 'Thock (Brown)', off: 'Off' };
    this.dom.soundStatusText.textContent = `Sound: ${labels[type] || 'Off'}`;
    this.dom.soundToggleBtn.style.color = type === 'off' ? 'var(--text-subtle)' : 'var(--accent-primary)';
  }

  updateUserStatsDisplay() {
    // Calculate total stars
    let totalStars = 0;
    Object.values(this.progress.lessonStats).forEach(st => {
      totalStars += (st.stars || 0);
    });

    const maxStars = LESSONS.length * 5;
    this.dom.totalStarsCount.textContent = `${totalStars} / ${maxStars}`;
    this.dom.userXpCount.textContent = `${this.progress.totalXp} XP`;

    const completedCount = Object.keys(this.progress.lessonStats).length;
    const pct = Math.round((completedCount / LESSONS.length) * 100);
    this.dom.courseProgressText.textContent = `${pct}% Completed`;

    // Update Resume Hero button
    const nextId = Math.min(LESSONS.length, this.progress.unlockedLessonId);
    this.dom.resumeLessonText.textContent = `Continue Lesson ${nextId}`;
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    if (viewName === 'roadmap') {
      this.trainerMode = false;
      if (this.dom.keyTrainerSelectorPanel) this.dom.keyTrainerSelectorPanel.style.display = 'none';
      this.dom.roadmapView.classList.add('active');
      this.dom.tabLessons.classList.add('active');
      this.renderRoadmap();
    } else if (viewName === 'keytrainer') {
      this.trainerMode = true;
      this.dom.lessonArenaView.classList.add('active');
      this.dom.tabKeyTrainer.classList.add('active');
      if (this.dom.keyTrainerSelectorPanel) this.dom.keyTrainerSelectorPanel.style.display = 'flex';
      this.startKeyTrainer(this.selectedTrainerKeys);
    } else if (viewName === 'lesson-arena') {
      if (!this.trainerMode && this.dom.keyTrainerSelectorPanel) {
        this.dom.keyTrainerSelectorPanel.style.display = 'none';
      }
      this.dom.lessonArenaView.classList.add('active');
      if (this.trainerMode) {
        this.dom.tabKeyTrainer.classList.add('active');
      } else {
        this.dom.tabLessons.classList.add('active');
      }
    } else if (viewName === 'speedtest') {
      this.trainerMode = false;
      if (this.dom.keyTrainerSelectorPanel) this.dom.keyTrainerSelectorPanel.style.display = 'none';
      this.dom.speedTestView.classList.add('active');
      this.dom.tabSpeedTest.classList.add('active');
      this.focusSpeedInput();
    }
  }

  bindEvents() {
    // Navigation
    this.dom.tabLessons.addEventListener('click', () => this.switchView('roadmap'));
    if (this.dom.tabKeyTrainer) {
      this.dom.tabKeyTrainer.addEventListener('click', () => this.switchView('keytrainer'));
    }
    this.dom.tabSpeedTest.addEventListener('click', () => this.switchView('speedtest'));
    this.dom.brandLogo.addEventListener('click', () => this.switchView('roadmap'));
    this.dom.btnBackToLessons.addEventListener('click', () => {
      this.switchView('roadmap');
    });

    // Theme & Sound
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.dom.soundToggleBtn.addEventListener('click', () => this.toggleSound());

    // Resume Lesson
    this.dom.resumeLessonHeroBtn.addEventListener('click', () => {
      const nextId = Math.min(LESSONS.length, this.progress.unlockedLessonId);
      this.startLesson(nextId);
    });

    // Toggle Hands
    this.dom.toggleHandsBtn.addEventListener('click', () => {
      const visible = this.keyboard.toggleHands();
      this.handsVisible = visible;
      localStorage.setItem('edclub_hands', visible.toString());
      this.showToast(visible ? 'Hand guides enabled' : 'Hand guides hidden');
    });

    // Lesson Typing Box Focus & Input
    this.dom.lessonTypingBox.addEventListener('click', () => this.focusLessonInput());
    this.dom.lessonFocusOverlay.addEventListener('click', () => this.focusLessonInput());

    this.dom.lessonHiddenInput.addEventListener('focus', () => {
      this.dom.lessonTypingBox.classList.add('focused');
      this.dom.lessonFocusOverlay.classList.remove('visible');
    });

    this.dom.lessonHiddenInput.addEventListener('blur', () => {
      this.dom.lessonTypingBox.classList.remove('focused');
      if (this.lessonStatus !== 'finished') {
        this.dom.lessonFocusOverlay.classList.add('visible');
      }
    });

    this.dom.lessonHiddenInput.addEventListener('keydown', (e) => this.handleLessonKeyDown(e));

    // Lesson Restart & Victory Modals
    this.dom.restartLessonBtn.addEventListener('click', () => {
      if (this.trainerMode) {
        this.startKeyTrainer(this.selectedTrainerKeys);
      } else if (this.activeLesson) {
        this.startLesson(this.activeLesson.id);
      }
    });

    this.dom.victoryReplayBtn.addEventListener('click', () => {
      this.dom.lessonVictoryModal.classList.remove('active');
      if (this.trainerMode) {
        this.startKeyTrainer(this.selectedTrainerKeys);
      } else if (this.activeLesson) {
        this.startLesson(this.activeLesson.id);
      }
    });

    this.dom.victoryNextLessonBtn.addEventListener('click', () => {
      this.dom.lessonVictoryModal.classList.remove('active');
      if (this.trainerMode) {
        // Advance to next preset key pair
        const currKeysStr = this.selectedTrainerKeys.join('');
        const idx = SPECIFIC_KEY_PRESETS.findIndex(p => p.keys.join('') === currKeysStr);
        const nextPreset = SPECIFIC_KEY_PRESETS[(idx + 1) % SPECIFIC_KEY_PRESETS.length];
        
        if (this.dom.ktPresetsList) {
          this.dom.ktPresetsList.querySelectorAll('.kt-preset-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.presetId === nextPreset.id);
          });
        }
        this.startKeyTrainer(nextPreset.keys);
      } else {
        const nextId = (typeof this.activeLesson.id === 'number' ? this.activeLesson.id : 1) + 1;
        if (nextId <= LESSONS.length) {
          this.startLesson(nextId);
        } else {
          this.switchView('roadmap');
          this.showToast('Congratulations! You completed all lessons!');
        }
      }
    });

    // Click ANY key directly on the virtual keyboard to practice that specific key
    const kbContainer = document.getElementById('virtualKeyboard');
    if (kbContainer) {
      kbContainer.addEventListener('click', (e) => {
        const keyEl = e.target.closest('.kb-key');
        if (!keyEl) return;
        const clickedKey = keyEl.dataset.key;
        if (!clickedKey || clickedKey.length > 1) return;

        this.switchView('keytrainer');
        if (this.dom.ktChipsList) {
          this.dom.ktChipsList.querySelectorAll('.kt-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.key === clickedKey);
          });
        }
        if (this.dom.ktPresetsList) {
          this.dom.ktPresetsList.querySelectorAll('.kt-preset-btn').forEach(b => b.classList.remove('active'));
        }
        this.startKeyTrainer([clickedKey]);
        this.showToast(`Practicing key: ${clickedKey.toUpperCase()}`);
      });
    }

    // Speed Test Events
    this.dom.speedArenaWrapper.addEventListener('click', () => this.focusSpeedInput());
    this.dom.speedFocusOverlay.addEventListener('click', () => this.focusSpeedInput());
    this.dom.speedTypingInput.addEventListener('keydown', (e) => this.handleSpeedKeyDown(e));
    this.dom.speedRestartBtn.addEventListener('click', () => this.setupSpeedTest());
    this.dom.closeSpeedResultBtn.addEventListener('click', () => this.dom.speedResultModal.classList.remove('active'));
    this.dom.speedNextBtn.addEventListener('click', () => {
      this.dom.speedResultModal.classList.remove('active');
      this.setupSpeedTest();
    });

    // Speed test modes
    this.dom.speedModeGroup.querySelectorAll('.config-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.speedMode = btn.dataset.mode;
        this.dom.speedModeGroup.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderSpeedSubOptions();
        this.setupSpeedTest();
      });
    });

    // Global Key Listener
    window.addEventListener('keydown', (e) => {
      const caps = e.getModifierState && e.getModifierState('CapsLock');
      this.dom.capsLockWarning.classList.toggle('visible', !!caps);

      // Quick Tab Restart
      if (e.key === 'Tab') {
        e.preventDefault();
        if (this.currentView === 'lesson-arena') {
          if (this.trainerMode) {
            this.startKeyTrainer(this.selectedTrainerKeys);
          } else if (this.activeLesson) {
            this.startLesson(this.activeLesson.id);
          }
        } else if (this.currentView === 'speedtest') {
          this.setupSpeedTest();
        }
        return;
      }

      // Auto-focus active view
      if (this.currentView === 'lesson-arena' && document.activeElement !== this.dom.lessonHiddenInput) {
        if (!this.dom.lessonVictoryModal.classList.contains('active') && (e.key.length === 1 || e.key === 'Backspace')) {
          this.focusLessonInput();
        }
      }
    });
  }

  // ===============================================
  // ROADMAP VIEW RENDERING
  // ===============================================
  renderRoadmap() {
    const grid = this.dom.lessonsGrid;
    grid.innerHTML = '';

    LESSONS.forEach(lesson => {
      const isUnlocked = lesson.id <= this.progress.unlockedLessonId;
      const stats = this.progress.lessonStats[lesson.id];
      const starsEarned = stats ? stats.stars : 0;

      const card = document.createElement('div');
      card.className = `lesson-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.dataset.lessonId = lesson.id;

      // Stars string
      let starsHtml = '';
      for (let s = 1; s <= 5; s++) {
        starsHtml += `<span class="${s <= starsEarned ? 'star-filled' : 'star-empty'}">⭐</span>`;
      }

      // Keys badges
      let keysHtml = '';
      lesson.keys.forEach(k => {
        keysHtml += `<span class="key-badge">${k.toUpperCase()}</span>`;
      });

      card.innerHTML = `
        <div>
          <div class="lesson-card-header">
            <span class="lesson-num-badge">Lesson ${lesson.id}</span>
            <span style="font-size: 0.9rem;">${isUnlocked ? (starsEarned > 0 ? '✓' : '●') : '🔒'}</span>
          </div>
          <h4 class="lesson-card-title">${lesson.title}</h4>
          <p class="lesson-card-desc">${lesson.desc}</p>
          <div class="lesson-card-keys">${keysHtml}</div>
        </div>
        <div class="lesson-card-footer">
          <div class="stars-row">${starsHtml}</div>
          <span class="btn-card-action">
            ${isUnlocked ? (starsEarned > 0 ? 'Play Again →' : 'Start →') : 'Locked'}
          </span>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.startLesson(lesson.id);
        });
      }

      grid.appendChild(card);
    });
  }

  // ===============================================
  // KEY TRAINER CONTROLS & SPECIFIC DRILL ENGINE
  // ===============================================
  initKeyTrainerControls() {
    const presetsList = this.dom.ktPresetsList;
    if (presetsList && typeof SPECIFIC_KEY_PRESETS !== 'undefined') {
      presetsList.innerHTML = '';
      SPECIFIC_KEY_PRESETS.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'kt-preset-btn';
        if (preset.id === 'gh') btn.classList.add('active');
        btn.textContent = preset.label;
        btn.dataset.presetId = preset.id;
        btn.title = preset.fingerDesc;

        btn.addEventListener('click', () => {
          presetsList.querySelectorAll('.kt-preset-btn').forEach(b => b.classList.remove('active'));
          if (this.dom.ktChipsList) this.dom.ktChipsList.querySelectorAll('.kt-chip').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          this.startKeyTrainer(preset.keys);
        });

        presetsList.appendChild(btn);
      });
    }

    const chipsList = this.dom.ktChipsList;
    if (chipsList) {
      chipsList.innerHTML = '';
      const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      letters.forEach(letter => {
        const chip = document.createElement('button');
        chip.className = 'kt-chip';
        chip.textContent = letter.toUpperCase();
        chip.dataset.key = letter;
        chip.title = `Practice key '${letter.toUpperCase()}' only`;

        chip.addEventListener('click', () => {
          if (presetsList) presetsList.querySelectorAll('.kt-preset-btn').forEach(b => b.classList.remove('active'));
          chipsList.querySelectorAll('.kt-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.startKeyTrainer([letter]);
        });

        chipsList.appendChild(chip);
      });
    }
  }

  startKeyTrainer(keys) {
    this.trainerMode = true;
    this.selectedTrainerKeys = keys || this.selectedTrainerKeys || ['g', 'h'];

    const keysLabel = this.selectedTrainerKeys.map(k => k.toUpperCase()).join(' & ');
    const drillText = generateSpecificKeyDrill(this.selectedTrainerKeys);

    const syntheticLesson = {
      id: 'kt-' + this.selectedTrainerKeys.join(''),
      title: `Specific Key Drill: ${keysLabel}`,
      desc: `Targeted muscle memory practice for keys: ${keysLabel}. (No random words!)`,
      keys: this.selectedTrainerKeys,
      targetWpm: 25,
      text: drillText,
      isKeyTrainer: true
    };

    if (this.dom.keyTrainerSelectorPanel) this.dom.keyTrainerSelectorPanel.style.display = 'flex';
    if (this.dom.ktActiveSummary) this.dom.ktActiveSummary.innerHTML = `Current Drill: <strong>${keysLabel}</strong> (No random words)`;
    if (this.dom.arenaBackBtnText) this.dom.arenaBackBtnText.textContent = 'Curriculum';
    if (this.dom.arenaLessonNumber) this.dom.arenaLessonNumber.textContent = 'Key Trainer';

    this.runLessonArena(syntheticLesson);
  }

  // ===============================================
  // LESSON ENGINE & TILE CARDS ARENA
  // ===============================================
  startLesson(lessonId) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    this.trainerMode = false;
    if (this.dom.keyTrainerSelectorPanel) this.dom.keyTrainerSelectorPanel.style.display = 'none';
    if (this.dom.arenaBackBtnText) this.dom.arenaBackBtnText.textContent = 'All Lessons';
    if (this.dom.arenaLessonNumber) this.dom.arenaLessonNumber.textContent = `Lesson ${lesson.id}`;

    this.runLessonArena(lesson);
  }

  runLessonArena(lesson) {
    this.activeLesson = lesson;
    this.lessonStatus = 'idle';
    this.charIndex = 0;
    this.lessonErrors = 0;
    this.lessonCorrect = 0;
    this.lessonStartTime = null;
    this.lessonEndTime = null;
    clearInterval(this.lessonTimer);

    // Switch view to arena
    this.switchView('lesson-arena');

    // Populate Top Bar
    this.dom.arenaLessonTitle.textContent = lesson.title;
    this.dom.arenaLiveWpm.textContent = '0 WPM';
    this.dom.arenaLiveAcc.textContent = '100%';
    this.dom.arenaStarsPreview.innerHTML = '<span>⭐⭐⭐⭐⭐</span>';
    this.dom.lessonProgressFill.style.width = '0%';

    // Build EdClub Character Tile Cards
    const track = this.dom.lessonTilesTrack;
    track.innerHTML = '';
    track.style.transform = 'translate3d(0, 0, 0)';

    for (let i = 0; i < lesson.text.length; i++) {
      const char = lesson.text[i];
      const tile = document.createElement('div');
      tile.className = 'char-tile';
      if (char === ' ') tile.classList.add('space-tile');
      if (i === 0) tile.classList.add('active');

      tile.innerHTML = `
        <span class="tile-target-arrow">▼</span>
        <span class="tile-check">✓</span>
        <span class="tile-char">${char === ' ' ? '<span class="space-card-label">␣ SPACE</span>' : char.toUpperCase()}</span>
        <div class="tile-cursor"></div>
      `;

      track.appendChild(tile);
    }

    // Highlight initial target key & overlaid hand finger
    const firstChar = lesson.text[0];
    this.updateTargetKeySpotlight(firstChar);
    this.keyboard.highlightTargetKey(firstChar);

    // Center initial tile immediately
    requestAnimationFrame(() => this.scrollTilesTrack(0));

    this.focusLessonInput();
  }

  updateTargetKeySpotlight(char) {
    if (!this.dom.spotlightCharDisplay) return;
    if (!char) {
      this.dom.spotlightCharDisplay.textContent = '-';
      return;
    }

    const lowerChar = char.toLowerCase();
    const isSpace = char === ' ';
    const fingerId = FINGER_MAP[lowerChar] || (isSpace ? 'thumbs' : null);
    const fingerName = FINGER_NAMES[fingerId] || 'Correct Finger';

    this.dom.spotlightCharDisplay.textContent = isSpace ? '␣ SPACE' : char.toUpperCase();
    if (this.dom.spotlightKeyCapsule) {
      this.dom.spotlightKeyCapsule.classList.toggle('space-capsule', isSpace);
    }

    let icon = '🎯';
    if (fingerId && fingerId.startsWith('left')) icon = '👈';
    else if (fingerId && fingerId.startsWith('right')) icon = '👉';
    else if (fingerId === 'thumbs') icon = '👍';

    if (this.dom.spotlightFingerIcon) this.dom.spotlightFingerIcon.textContent = icon;
    if (this.dom.spotlightFingerText) {
      this.dom.spotlightFingerText.innerHTML = `Press with <strong>${fingerName}</strong>`;
    }
  }

  scrollTilesTrack(activeIndex) {
    const track = this.dom.lessonTilesTrack;
    const viewport = this.dom.tilesViewport;
    if (!track || !viewport) return;

    const tiles = track.children;
    if (activeIndex < 0 || activeIndex >= tiles.length) return;

    const currentTile = tiles[activeIndex];
    const viewportCenter = viewport.offsetWidth / 2;
    const tileCenter = currentTile.offsetLeft + (currentTile.offsetWidth / 2);
    const targetX = viewportCenter - tileCenter;

    track.style.transform = `translate3d(${targetX}px, 0, 0)`;
  }

  focusLessonInput() {
    this.dom.lessonHiddenInput.focus();
    this.dom.lessonFocusOverlay.classList.remove('visible');
  }

  handleLessonKeyDown(e) {
    if (!this.activeLesson || this.lessonStatus === 'finished') return;

    // Ignore modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].includes(e.key)) {
      return;
    }

    // Stop event bubbling to prevent any duplicate handlers
    e.stopPropagation();

    // Prevent OS key-repeat from spamming multiple characters on a single held press
    if (e.repeat) {
      e.preventDefault();
      return;
    }

    // Safety guard against duplicate events fired within 30ms for the exact same key
    const now = performance.now();
    if (this._lastLessonKeyTime && (now - this._lastLessonKeyTime < 30) && this._lastLessonKeyChar === e.key) {
      e.preventDefault();
      return;
    }
    this._lastLessonKeyTime = now;
    this._lastLessonKeyChar = e.key;

    // Start timer on first keystroke
    if (this.lessonStatus === 'idle') {
      this.lessonStatus = 'running';
      this.lessonStartTime = Date.now();
      this.lessonTimer = setInterval(() => this.updateLessonHUD(), 500);
    }

    const text = this.activeLesson.text;
    const targetChar = text[this.charIndex];
    const tiles = this.dom.lessonTilesTrack.children;
    const currentTile = tiles[this.charIndex];

    // BACKSPACE
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.charIndex > 0) {
        if (currentTile) currentTile.classList.remove('active', 'wrong', 'completed');
        this.charIndex--;
        const prevTile = tiles[this.charIndex];
        if (prevTile) {
          prevTile.classList.remove('completed', 'wrong');
          prevTile.classList.add('active');
        }
        this.scrollTilesTrack(this.charIndex);
        this.updateTargetKeySpotlight(text[this.charIndex]);
        this.keyboard.highlightTargetKey(text[this.charIndex]);
        this.updateLessonHUD();
      }
      return;
    }

    // CHARACTER INPUT
    if (e.key.length === 1) {
      e.preventDefault();

      if (e.key === targetChar) {
        currentTile.classList.remove('active', 'wrong');
        currentTile.classList.add('completed');
        this.lessonCorrect++;
        sound.playKeySound(false, targetChar === ' ');
        this.charIndex++;
      } else {
        currentTile.classList.remove('active');
        currentTile.classList.add('wrong');
        this.lessonErrors++;
        sound.playKeySound(true, false);
        this.charIndex++;
      }

      // Check if drill / lesson finished
      if (this.charIndex >= text.length) {
        this.dom.lessonProgressFill.style.width = '100%';
        this.finishLesson();
        return;
      }

      // Move target to next character tile
      const nextTile = tiles[this.charIndex];
      if (nextTile) {
        nextTile.classList.add('active');
      }

      this.scrollTilesTrack(this.charIndex);
      this.updateTargetKeySpotlight(text[this.charIndex]);
      this.keyboard.highlightTargetKey(text[this.charIndex]);

      // Progress bar fill
      const pct = Math.round((this.charIndex / text.length) * 100);
      this.dom.lessonProgressFill.style.width = `${pct}%`;

      this.updateLessonHUD();
    }
  }

  updateLessonHUD() {
    if (!this.lessonStartTime) return;
    const elapsedSec = Math.max(1, Math.round((Date.now() - this.lessonStartTime) / 1000));
    const totalTyped = this.lessonCorrect + this.lessonErrors;
    const wpm = Math.round((this.lessonCorrect / 5) / (elapsedSec / 60));
    const acc = totalTyped > 0 ? Math.round((this.lessonCorrect / totalTyped) * 100) : 100;

    this.dom.arenaLiveWpm.textContent = `${wpm} WPM`;
    this.dom.arenaLiveAcc.textContent = `${acc}%`;

    // Dynamic Star preview
    const stars = calculateStars(acc, wpm, this.activeLesson.targetWpm || 20);
    let preview = '';
    for (let s = 1; s <= 5; s++) {
      preview += s <= stars ? '⭐' : '☆';
    }
    this.dom.arenaStarsPreview.textContent = preview;
  }

  finishLesson() {
    clearInterval(this.lessonTimer);
    this.lessonStatus = 'finished';
    this.lessonEndTime = Date.now();

    const elapsedSec = Math.max(1, Math.round((this.lessonEndTime - this.lessonStartTime) / 1000));
    const totalTyped = this.lessonCorrect + this.lessonErrors;
    const finalWpm = Math.round((this.lessonCorrect / 5) / (elapsedSec / 60));
    const finalAcc = totalTyped > 0 ? Math.round((this.lessonCorrect / totalTyped) * 100) : 100;
    const starsEarned = calculateStars(finalAcc, finalWpm, this.activeLesson.targetWpm || 20);

    // If it's a curriculum lesson, save progress
    if (!this.activeLesson.isKeyTrainer && typeof this.activeLesson.id === 'number') {
      const existingStats = this.progress.lessonStats[this.activeLesson.id];
      const prevBestStars = existingStats ? existingStats.stars : 0;

      const gainedXp = 100 + (starsEarned * 20);
      this.progress.totalXp += gainedXp;

      this.progress.lessonStats[this.activeLesson.id] = {
        stars: Math.max(prevBestStars, starsEarned),
        bestWpm: Math.max(existingStats ? existingStats.bestWpm : 0, finalWpm),
        accuracy: Math.max(existingStats ? existingStats.accuracy : 0, finalAcc)
      };

      if (this.activeLesson.id === this.progress.unlockedLessonId && this.activeLesson.id < LESSONS.length) {
        this.progress.unlockedLessonId++;
      }

      this.saveProgress();
    }

    // Fire Confetti!
    this.confetti.fire(3000);
    sound.playCompletionChime();

    // Show Victory Modal
    this.showVictoryModal({
      lesson: this.activeLesson,
      wpm: finalWpm,
      acc: finalAcc,
      stars: starsEarned,
      errors: this.lessonErrors,
      time: elapsedSec,
      xpGained: gainedXp
    });
  }

  showVictoryModal(data) {
    this.dom.victoryLessonSubtitle.textContent = `Lesson ${data.lesson.id}: ${data.lesson.title}`;
    this.dom.victoryWpm.textContent = `${data.wpm} WPM`;
    this.dom.victoryTargetWpm.textContent = `Target: ${data.lesson.targetWpm} WPM`;
    this.dom.victoryAcc.textContent = `${data.acc}%`;
    this.dom.victoryErrors.textContent = `${data.errors} mistake${data.errors === 1 ? '' : 's'}`;
    this.dom.victoryTime.textContent = `${data.time}s`;
    this.dom.victoryXpEarned.textContent = `+${data.xpGained} XP`;

    // Animate 5 Stars sequentially
    const starEls = [
      document.getElementById('star1'),
      document.getElementById('star2'),
      document.getElementById('star3'),
      document.getElementById('star4'),
      document.getElementById('star5')
    ];

    starEls.forEach(el => {
      el.className = 'star-pop';
    });

    this.dom.lessonVictoryModal.classList.add('active');

    starEls.forEach((el, idx) => {
      setTimeout(() => {
        if (idx < data.stars) {
          el.className = 'star-pop earned';
        } else {
          el.className = 'star-pop star-empty';
        }
      }, 200 + (idx * 220));
    });
  }

  // ===============================================
  // SPEED TEST (FREE PRACTICE)
  // ===============================================
  renderSpeedSubOptions() {
    const group = this.dom.speedSubOptions;
    group.innerHTML = '';

    if (this.speedMode === 'time') {
      [15, 30, 60].forEach(sec => {
        const btn = document.createElement('button');
        btn.className = `config-btn ${this.speedSubOption === sec ? 'active' : ''}`;
        btn.textContent = sec;
        btn.onclick = () => {
          this.speedSubOption = sec;
          this.renderSpeedSubOptions();
          this.setupSpeedTest();
        };
        group.appendChild(btn);
      });
    } else if (this.speedMode === 'words') {
      [10, 25, 50].forEach(cnt => {
        const btn = document.createElement('button');
        btn.className = `config-btn ${this.speedSubOption === cnt ? 'active' : ''}`;
        btn.textContent = cnt;
        btn.onclick = () => {
          this.speedSubOption = cnt;
          this.renderSpeedSubOptions();
          this.setupSpeedTest();
        };
        group.appendChild(btn);
      });
    } else if (this.speedMode === 'quote') {
      ['short', 'medium'].forEach(len => {
        const btn = document.createElement('button');
        btn.className = `config-btn ${this.speedSubOption === len ? 'active' : ''}`;
        btn.textContent = len;
        btn.onclick = () => {
          this.speedSubOption = len;
          this.renderSpeedSubOptions();
          this.setupSpeedTest();
        };
        group.appendChild(btn);
      });
    }
  }

  setupSpeedTest() {
    clearInterval(this.speedTimer);
    this.speedStatus = 'idle';
    this.speedWordIdx = 0;
    this.speedCharIdx = 0;
    this.speedStartTime = null;
    this.speedElapsed = 0;
    this.speedTotalKeys = 0;
    this.speedCorrectKeys = 0;

    this.dom.speedTypingInput.value = '';
    this.dom.speedHudWpm.textContent = '0';
    this.dom.speedHudAcc.textContent = '100%';
    this.dom.speedHudTimer.textContent = this.speedMode === 'time' ? this.speedSubOption : (this.speedMode === 'words' ? this.speedSubOption : '0s');

    this.speedWords = getRandomWords({
      mode: this.speedMode,
      count: this.speedMode === 'words' ? this.speedSubOption : 40,
      quoteLength: this.speedSubOption
    });

    const container = this.dom.speedWordsContainer;
    container.innerHTML = '';
    container.style.transform = 'translate3d(0, 0px, 0)';
    this.speedWords.forEach((wStr, wIdx) => {
      const wDiv = document.createElement('div');
      wDiv.className = 'word';
      for (let c = 0; c < wStr.length; c++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = wStr[c];
        wDiv.appendChild(span);
      }
      container.appendChild(wDiv);
    });

    this.updateSpeedCaret();
    this.focusSpeedInput();
  }

  focusSpeedInput() {
    this.dom.speedTypingInput.focus();
    this.dom.speedFocusOverlay.classList.remove('visible');
  }

  handleSpeedKeyDown(e) {
    if (this.speedStatus === 'finished') return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].includes(e.key)) return;

    if (this.speedStatus === 'idle') {
      this.speedStatus = 'running';
      this.speedStartTime = Date.now();
      this.speedTimer = setInterval(() => {
        this.speedElapsed++;
        if (this.speedMode === 'time') {
          const rem = this.speedSubOption - this.speedElapsed;
          this.dom.speedHudTimer.textContent = Math.max(0, rem);
          if (rem <= 0) this.finishSpeedTest();
        } else {
          this.dom.speedHudTimer.textContent = `${this.speedElapsed}s`;
        }
        this.updateSpeedHUD();
      }, 1000);
    }

    const currentWordEl = this.dom.speedWordsContainer.children[this.speedWordIdx];
    if (!currentWordEl) return;
    const targetWord = this.speedWords[this.speedWordIdx];

    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.speedCharIdx > 0) {
        this.speedCharIdx--;
        const chars = currentWordEl.querySelectorAll('.char');
        if (chars[this.speedCharIdx]) {
          chars[this.speedCharIdx].classList.remove('correct', 'incorrect');
        }
        this.updateSpeedCaret();
      }
      return;
    }

    // Space
    if (e.key === ' ') {
      e.preventDefault();
      if (this.speedCharIdx === 0) return;

      this.speedWordIdx++;
      this.speedCharIdx = 0;
      sound.playKeySound(false, true);

      if (this.speedWordIdx >= this.speedWords.length) {
        this.finishSpeedTest();
        return;
      }

      this.updateSpeedCaret();
      this.updateSpeedHUD();
      return;
    }

    // Regular char
    if (e.key.length === 1) {
      e.preventDefault();
      this.speedTotalKeys++;

      const chars = currentWordEl.querySelectorAll('.char');
      if (this.speedCharIdx < targetWord.length) {
        const charEl = chars[this.speedCharIdx];
        if (e.key === targetWord[this.speedCharIdx]) {
          charEl.classList.add('correct');
          this.speedCorrectKeys++;
          sound.playKeySound(false, false);
        } else {
          charEl.classList.add('incorrect');
          sound.playKeySound(true, false);
        }
        this.speedCharIdx++;
      }

      if (this.speedWordIdx === this.speedWords.length - 1 && this.speedCharIdx === targetWord.length) {
        this.finishSpeedTest();
        return;
      }

      this.updateSpeedCaret();
      this.updateSpeedHUD();
    }
  }

  updateSpeedCaret() {
    const currentWordEl = this.dom.speedWordsContainer.children[this.speedWordIdx];
    if (!currentWordEl) return;
    const chars = currentWordEl.querySelectorAll('.char');
    let x = currentWordEl.offsetLeft;
    let y = currentWordEl.offsetTop;

    if (this.speedCharIdx < chars.length) {
      x = chars[this.speedCharIdx].offsetLeft;
    } else if (chars.length > 0) {
      const last = chars[chars.length - 1];
      x = last.offsetLeft + last.offsetWidth;
    }

    // Smooth MonkeyType-style multi-line scrolling:
    // When the active word wraps beyond line 1, smoothly shift the container up
    const firstWordEl = this.dom.speedWordsContainer.firstElementChild;
    const baseTop = firstWordEl ? firstWordEl.offsetTop : 0;
    const lineOffset = currentWordEl.offsetTop - baseTop;
    const scrollY = lineOffset > 42 ? lineOffset - 40 : 0;

    this.dom.speedWordsContainer.style.transform = `translate3d(0, -${scrollY}px, 0)`;
    this.dom.speedCaret.style.transform = `translate3d(${x}px, ${y - scrollY + 4}px, 0)`;

    // Keep caret solid and pause blink while typing
    this.dom.speedCaret.classList.add('typing');
    clearTimeout(this.caretTypingTimeout);
    this.caretTypingTimeout = setTimeout(() => {
      this.dom.speedCaret.classList.remove('typing');
    }, 450);
  }

  updateSpeedHUD() {
    const min = Math.max(1, this.speedElapsed) / 60;
    const wpm = Math.round((this.speedCorrectKeys / 5) / min);
    const acc = this.speedTotalKeys > 0 ? Math.round((this.speedCorrectKeys / this.speedTotalKeys) * 100) : 100;
    this.dom.speedHudWpm.textContent = wpm;
    this.dom.speedHudAcc.textContent = `${acc}%`;
  }

  finishSpeedTest() {
    clearInterval(this.speedTimer);
    this.speedStatus = 'finished';

    const min = Math.max(1, this.speedElapsed) / 60;
    const finalWpm = Math.round((this.speedCorrectKeys / 5) / min);
    const finalAcc = this.speedTotalKeys > 0 ? Math.round((this.speedCorrectKeys / this.speedTotalKeys) * 100) : 100;
    const rawWpm = Math.round((this.speedTotalKeys / 5) / min);

    this.dom.speedFinalWpm.textContent = finalWpm;
    this.dom.speedFinalAcc.textContent = `${finalAcc}%`;
    this.dom.speedFinalRaw.textContent = rawWpm;
    this.dom.speedFinalTime.textContent = `${this.speedElapsed}s`;

    let rank = 'Typing Novice';
    if (finalWpm >= 85) rank = 'Speed Demon';
    else if (finalWpm >= 65) rank = 'Pro Typist';
    else if (finalWpm >= 45) rank = 'Swift Typist';
    else if (finalWpm >= 25) rank = 'Apprentice';
    this.dom.speedRankBadge.textContent = rank;

    sound.playCompletionChime();
    this.dom.speedResultModal.classList.add('active');
  }

  showToast(msg) {
    const t = this.dom.toastMsg;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EdClubGame();
});
