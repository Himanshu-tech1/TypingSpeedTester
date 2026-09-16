// keyboard.js - Interactive Virtual Keyboard, On-Key Finger Recommendations, and Visual Hand Guides

const KEYBOARD_ROWS = [
  [
    { key: '`', shift: '~', finger: 'left-pinky', width: '1' },
    { key: '1', shift: '!', finger: 'left-pinky', width: '1' },
    { key: '2', shift: '@', finger: 'left-ring', width: '1' },
    { key: '3', shift: '#', finger: 'left-middle', width: '1' },
    { key: '4', shift: '$', finger: 'left-index', width: '1' },
    { key: '5', shift: '%', finger: 'left-index', width: '1' },
    { key: '6', shift: '^', finger: 'right-index', width: '1' },
    { key: '7', shift: '&', finger: 'right-index', width: '1' },
    { key: '8', shift: '*', finger: 'right-middle', width: '1' },
    { key: '9', shift: '(', finger: 'right-ring', width: '1' },
    { key: '0', shift: ')', finger: 'right-pinky', width: '1' },
    { key: '-', shift: '_', finger: 'right-pinky', width: '1' },
    { key: '=', shift: '+', finger: 'right-pinky', width: '1' },
    { key: 'Backspace', label: 'delete', finger: 'right-pinky', width: '1.6' }
  ],
  [
    { key: 'Tab', label: 'tab', finger: 'left-pinky', width: '1.4' },
    { key: 'q', finger: 'left-pinky', width: '1' },
    { key: 'w', finger: 'left-ring', width: '1' },
    { key: 'e', finger: 'left-middle', width: '1' },
    { key: 'r', finger: 'left-index', width: '1' },
    { key: 't', finger: 'left-index', width: '1' },
    { key: 'y', finger: 'right-index', width: '1' },
    { key: 'u', finger: 'right-index', width: '1' },
    { key: 'i', finger: 'right-middle', width: '1' },
    { key: 'o', finger: 'right-ring', width: '1' },
    { key: 'p', finger: 'right-pinky', width: '1' },
    { key: '[', shift: '{', finger: 'right-pinky', width: '1' },
    { key: ']', shift: '}', finger: 'right-pinky', width: '1' },
    { key: '\\', shift: '|', finger: 'right-pinky', width: '1.2' }
  ],
  [
    { key: 'CapsLock', label: 'caps', finger: 'left-pinky', width: '1.7' },
    { key: 'a', finger: 'left-pinky', width: '1', home: true, restingFinger: 'L. Pinky' },
    { key: 's', finger: 'left-ring', width: '1', home: true, restingFinger: 'L. Ring' },
    { key: 'd', finger: 'left-middle', width: '1', home: true, restingFinger: 'L. Middle' },
    { key: 'f', finger: 'left-index', width: '1', home: true, restingFinger: 'L. Index' },
    { key: 'g', finger: 'left-index', width: '1' },
    { key: 'h', finger: 'right-index', width: '1' },
    { key: 'j', finger: 'right-index', width: '1', home: true, restingFinger: 'R. Index' },
    { key: 'k', finger: 'right-middle', width: '1', home: true, restingFinger: 'R. Middle' },
    { key: 'l', finger: 'right-ring', width: '1', home: true, restingFinger: 'R. Ring' },
    { key: ';', shift: ':', finger: 'right-pinky', width: '1', home: true, restingFinger: 'R. Pinky' },
    { key: '\'', shift: '"', finger: 'right-pinky', width: '1' },
    { key: 'Enter', label: 'return', finger: 'right-pinky', width: '1.9' }
  ],
  [
    { key: 'ShiftLeft', label: 'shift', finger: 'left-pinky', width: '2.2' },
    { key: 'z', finger: 'left-pinky', width: '1' },
    { key: 'x', finger: 'left-ring', width: '1' },
    { key: 'c', finger: 'left-middle', width: '1' },
    { key: 'v', finger: 'left-index', width: '1' },
    { key: 'b', finger: 'left-index', width: '1' },
    { key: 'n', finger: 'right-index', width: '1' },
    { key: 'm', finger: 'right-index', width: '1' },
    { key: ',', shift: '<', finger: 'right-middle', width: '1' },
    { key: '.', shift: '>', finger: 'right-ring', width: '1' },
    { key: '/', shift: '?', finger: 'right-pinky', width: '1' },
    { key: 'ShiftRight', label: 'shift', finger: 'right-pinky', width: '2.4' }
  ],
  [
    { key: 'ControlLeft', label: 'ctrl', finger: 'left-pinky', width: '1.4' },
    { key: 'AltLeft', label: 'alt', finger: 'thumbs', width: '1.3' },
    { key: ' ', label: 'space', finger: 'thumbs', width: '6.4', home: true, restingFinger: 'Both Thumbs' },
    { key: 'AltRight', label: 'alt', finger: 'thumbs', width: '1.3' },
    { key: 'ControlRight', label: 'ctrl', finger: 'right-pinky', width: '1.4' }
  ]
];

class VirtualKeyboard {
  constructor(containerId, fingerGuideId, handsContainerId) {
    this.container = document.getElementById(containerId);
    this.fingerGuideText = document.getElementById(fingerGuideId);
    this.handsContainer = document.getElementById(handsContainerId);
    this.keyElements = new Map();
    this.keyDataMap = new Map();
    this.overlaySvg = null;
    this.handsVisible = true;
    this.currentTargetChar = null;
    this.activeKeyEl = null;
    this.activeFingerEls = [];
    this.cachedKeyCoords = new Map();
    this.pressedKeyElements = new Set();

    this.init();
  }

  init() {
    this.renderKeyboard();
    this.renderOverlaidHands();
    this.bindPhysicalKeys();
    this.updateCachedKeyCoords();

    // Re-cache and re-draw reach line on resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateCachedKeyCoords();
        if (this.currentTargetChar) {
          this.highlightTargetKey(this.currentTargetChar);
        }
      }, 100);
    });
  }

  updateCachedKeyCoords() {
    if (!this.container) return;
    const kbRect = this.container.getBoundingClientRect();
    if (kbRect.width === 0 || kbRect.height === 0) return;

    this.cachedKeyCoords.clear();
    this.keyElements.forEach((keyEl) => {
      if (!this.cachedKeyCoords.has(keyEl)) {
        const keyRect = keyEl.getBoundingClientRect();
        const svgTargetX = ((keyRect.left - kbRect.left + keyRect.width / 2) / kbRect.width) * 1000;
        const svgTargetY = ((keyRect.top - kbRect.top + keyRect.height / 2) / kbRect.height) * 480;
        this.cachedKeyCoords.set(keyEl, { svgTargetX, svgTargetY });
      }
    });
  }

  renderKeyboard() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const keysWrap = document.createElement('div');
    keysWrap.className = 'kb-keys-matrix';

    KEYBOARD_ROWS.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kb-row';

      row.forEach(keyData => {
        const keyEl = document.createElement('div');
        keyEl.className = `kb-key finger-${keyData.finger}`;
        keyEl.dataset.key = keyData.key.toLowerCase();
        keyEl.style.flex = keyData.width;

        if (keyData.home) {
          keyEl.classList.add('home-key');
        }

        const label = keyData.label || keyData.key.toUpperCase();
        let innerHtml = `<span class="key-label">${label}</span>`;

        // Tactile bumps on F and J
        if (keyData.home && (keyData.key === 'f' || keyData.key === 'j')) {
          innerHtml += `<span class="home-bump"></span>`;
        }

        keyEl.innerHTML = innerHtml;
        rowDiv.appendChild(keyEl);

        const lower = keyData.key.toLowerCase();
        this.keyElements.set(lower, keyEl);
        this.keyDataMap.set(lower, keyData);

        if (keyData.shift) {
          const lowerShift = keyData.shift.toLowerCase();
          this.keyElements.set(lowerShift, keyEl);
          this.keyDataMap.set(lowerShift, keyData);
        }
      });

      keysWrap.appendChild(rowDiv);
    });

    this.container.appendChild(keysWrap);
  }

  renderOverlaidHands() {
    if (!this.container) return;

    // Create SVG overlay spanning over the keyboard
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.setAttribute('class', 'kb-hands-svg-overlay');
    overlay.setAttribute('id', 'kbHandsOverlaySvg');
    overlay.setAttribute('viewBox', '0 0 1000 480');
    overlay.setAttribute('preserveAspectRatio', 'none');

    overlay.innerHTML = `
      <defs>
        <filter id="reachGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="reachBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0.95" />
        </linearGradient>
      </defs>

      <!-- Left Hand Group -->
      <g id="svgLeftHand" class="hand-lineart left-hand-lineart">
        <!-- Palm & Wrist -->
        <path class="hand-contour palm-contour" d="
          M 160,480 
          C 165,390 190,320 230,270 
          C 265,230 330,225 365,250 
          C 385,270 380,330 365,370 
          C 340,430 320,480 320,480 Z
        " />

        <!-- Fingers resting at home row positions (A, S, D, F, Space) -->
        <path id="fingerPath-left-pinky" class="finger-contour" d="
          M 215,310 C 205,270 190,240 195,200 C 198,185 220,185 223,200 C 226,235 235,275 240,310 Z
        " />
        <path id="fingerPath-left-ring" class="finger-contour" d="
          M 245,295 C 248,255 250,225 255,185 C 258,170 280,170 283,185 C 285,225 285,260 280,295 Z
        " />
        <path id="fingerPath-left-middle" class="finger-contour" d="
          M 285,285 C 295,245 305,215 315,175 C 318,160 342,160 345,175 C 345,215 335,255 325,285 Z
        " />
        <path id="fingerPath-left-index" class="finger-contour" d="
          M 330,280 C 345,240 365,210 380,185 C 388,170 410,175 412,190 C 405,225 385,260 370,290 Z
        " />
        <path id="fingerPath-left-thumb" class="finger-contour" d="
          M 345,340 C 375,320 405,305 430,295 C 445,290 455,308 440,320 C 415,338 385,365 355,380 Z
        " />
      </g>

      <!-- Right Hand Group -->
      <g id="svgRightHand" class="hand-lineart right-hand-lineart">
        <!-- Palm & Wrist -->
        <path class="hand-contour palm-contour" d="
          M 840,480 
          C 835,390 810,320 770,270 
          C 735,230 670,225 635,250 
          C 615,270 620,330 635,370 
          C 660,430 680,480 680,480 Z
        " />

        <path id="fingerPath-right-thumb" class="finger-contour" d="
          M 655,340 C 625,320 595,305 570,295 C 555,290 545,308 560,320 C 585,338 615,365 645,380 Z
        " />
        <path id="fingerPath-right-index" class="finger-contour" d="
          M 670,280 C 655,240 635,210 620,185 C 612,170 590,175 588,190 C 595,225 615,260 630,290 Z
        " />
        <path id="fingerPath-right-middle" class="finger-contour" d="
          M 715,285 C 705,245 695,215 685,175 C 682,160 658,160 655,175 C 655,215 665,255 675,285 Z
        " />
        <path id="fingerPath-right-ring" class="finger-contour" d="
          M 755,295 C 752,255 750,225 745,185 C 742,170 720,170 717,185 C 715,225 715,260 720,295 Z
        " />
        <path id="fingerPath-right-pinky" class="finger-contour" d="
          M 785,310 C 795,270 810,240 805,200 C 802,185 780,185 777,200 C 774,235 765,275 760,310 Z
        " />
      </g>

      <!-- Dynamic Reaching Finger Indicator Layer -->
      <g id="dynamicReachGroup" class="dynamic-reach-layer">
        <path id="reachDynamicPath" class="reach-path" d="" filter="url(#reachGlow)" />
        <circle id="reachTargetDot" class="reach-target-dot" cx="-999" cy="-999" r="14" filter="url(#reachGlow)" />
        <circle id="reachTargetPulse" class="reach-target-pulse" cx="-999" cy="-999" r="18" />
      </g>
    `;

    this.container.appendChild(overlay);
    this.overlaySvg = overlay;
  }

  bindPhysicalKeys() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const el = this.keyElements.get(key) || this.keyElements.get(e.code.toLowerCase());
      if (el) {
        el.classList.add('key-pressed');
        this.pressedKeyElements.add(el);
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      const el = this.keyElements.get(key) || this.keyElements.get(e.code.toLowerCase());
      if (el) {
        el.classList.remove('key-pressed');
        this.pressedKeyElements.delete(el);
      }
    });

    // Safety clear on blur or tab switch so keys never stay stuck
    window.addEventListener('blur', () => {
      this.pressedKeyElements.forEach(el => el.classList.remove('key-pressed'));
      this.pressedKeyElements.clear();
    });
  }

  highlightTargetKey(char) {
    this.currentTargetChar = char;

    // 1. Direct O(1) Clear previous target key and finger styling (no querySelectorAll)
    if (this.activeKeyEl) {
      this.activeKeyEl.classList.remove('target-key');
      this.activeKeyEl = null;
    }

    if (this.activeFingerEls.length > 0) {
      this.activeFingerEls.forEach(el => el.classList.remove('active-finger'));
      this.activeFingerEls = [];
    }

    const reachPath = document.getElementById('reachDynamicPath');
    const reachDot = document.getElementById('reachTargetDot');
    const reachPulse = document.getElementById('reachTargetPulse');
    if (reachPath) reachPath.setAttribute('d', '');
    if (reachDot) { reachDot.setAttribute('cx', '-999'); reachDot.setAttribute('cy', '-999'); }
    if (reachPulse) { reachPulse.setAttribute('cx', '-999'); reachPulse.setAttribute('cy', '-999'); }

    if (!char) {
      if (this.fingerGuideText) this.fingerGuideText.textContent = '';
      return;
    }

    const lowerChar = char.toLowerCase();
    const keyEl = this.keyElements.get(lowerChar);
    const fingerId = FINGER_MAP[lowerChar] || (char === ' ' ? 'thumbs' : null);
    const fingerName = FINGER_NAMES[fingerId] || 'Correct Finger';
    const charDisplay = char === ' ' ? 'Space Bar' : `'${char.toUpperCase()}'`;

    // 2. Highlight Keyboard Keycap
    if (keyEl) {
      keyEl.classList.add('target-key');
      this.activeKeyEl = keyEl;
    }

    // 3. Highlight Finger Contour on Hand
    if (fingerId) {
      if (fingerId === 'thumbs') {
        const leftThumb = document.getElementById('fingerPath-left-thumb');
        const rightThumb = document.getElementById('fingerPath-right-thumb');
        if (leftThumb) { leftThumb.classList.add('active-finger'); this.activeFingerEls.push(leftThumb); }
        if (rightThumb) { rightThumb.classList.add('active-finger'); this.activeFingerEls.push(rightThumb); }
      } else {
        const fingerPath = document.getElementById(`fingerPath-${fingerId}`);
        if (fingerPath) { fingerPath.classList.add('active-finger'); this.activeFingerEls.push(fingerPath); }
      }
    }

    // 4. Update Finger Guide Pill
    if (this.fingerGuideText) {
      let icon = '🎯';
      if (fingerId && fingerId.startsWith('left')) icon = '👈';
      else if (fingerId && fingerId.startsWith('right')) icon = '👉';
      else if (fingerId === 'thumbs') icon = '👍';

      this.fingerGuideText.innerHTML = `${icon} Press <strong class="guide-key-name">${charDisplay}</strong> with your <strong class="guide-finger-name">${fingerName}</strong>`;
    }

    // 5. Draw Dynamic SVG Reach to Key using Cached Coordinates (ZERO forced reflow!)
    if (keyEl && this.overlaySvg) {
      let coords = this.cachedKeyCoords.get(keyEl);
      if (!coords && this.container) {
        const kbRect = this.container.getBoundingClientRect();
        const keyRect = keyEl.getBoundingClientRect();
        if (kbRect.width > 0 && kbRect.height > 0) {
          coords = {
            svgTargetX: ((keyRect.left - kbRect.left + keyRect.width / 2) / kbRect.width) * 1000,
            svgTargetY: ((keyRect.top - kbRect.top + keyRect.height / 2) / kbRect.height) * 480
          };
          this.cachedKeyCoords.set(keyEl, coords);
        }
      }

      if (coords) {
        const { svgTargetX, svgTargetY } = coords;

        let anchorX = 370;
        let anchorY = 280;

        if (fingerId === 'left-pinky') { anchorX = 220; anchorY = 310; }
        else if (fingerId === 'left-ring') { anchorX = 265; anchorY = 295; }
        else if (fingerId === 'left-middle') { anchorX = 320; anchorY = 285; }
        else if (fingerId === 'left-index') { anchorX = 365; anchorY = 280; }
        else if (fingerId === 'thumbs') { anchorX = 440; anchorY = 330; }
        else if (fingerId === 'right-index') { anchorX = 635; anchorY = 280; }
        else if (fingerId === 'right-middle') { anchorX = 680; anchorY = 285; }
        else if (fingerId === 'right-ring') { anchorX = 735; anchorY = 295; }
        else if (fingerId === 'right-pinky') { anchorX = 780; anchorY = 310; }

        const midX = (anchorX + svgTargetX) / 2;
        const midY = (anchorY + svgTargetY) / 2 - 15;
        const pathData = `M ${anchorX},${anchorY} Q ${midX},${midY} ${svgTargetX},${svgTargetY}`;

        if (reachPath) reachPath.setAttribute('d', pathData);
        if (reachDot) {
          reachDot.setAttribute('cx', svgTargetX);
          reachDot.setAttribute('cy', svgTargetY);
        }
        if (reachPulse) {
          reachPulse.setAttribute('cx', svgTargetX);
          reachPulse.setAttribute('cy', svgTargetY);
        }
      }
    }
  }

  toggleHands(visible) {
    if (visible !== undefined) {
      this.handsVisible = visible;
    } else {
      this.handsVisible = !this.handsVisible;
    }

    if (this.overlaySvg) {
      this.overlaySvg.style.display = this.handsVisible ? 'block' : 'none';
    }
    return this.handsVisible;
  }
}
