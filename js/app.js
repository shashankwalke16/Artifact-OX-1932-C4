/**
 * THE BROKEN CAESAR MACHINE - ARCHIVAL LAB APPLICATION
 * Oxford Institute of Historical Cryptanalysis (Catalog OX-1938-C4)
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Ciphertext Data Payload
  const RAW_CIPHERTEXT = `GSQFSH OFQVWJOZ HFOBGAWGGWCB // SLDSRWHWCB 884-P // 1938-11-04
QZOGGWTWQOHWCB: QCBTWRSBHWOZ AIGSIA FSGHCFOHWCB ZCU
CFWUWB: GSQHCF 4 SLQOJOHWCB GWHS, GMFWO / OBOHCZWO PCFRSF
FSQWDWSBH: RSDH CT OBHWEIWHWSG, CLTCFR FSGSOFQV ZOPCFOHCFM

TWSZR FSQCJSFM RWGDOHQV:
ASQVOBWQOZ FCHCF OGGSAPZM FSGHCFSR HC TIBQHWCBOZ GHOHS CB BCJSAPSF 3FR.
KS VOJS SLHFOQHSR HVS TWBOZ ZCUUSR HFOBGAWGGWCB TFCA HVS WBHSFBOZ FCZZSF RFIA.
DFWAOFM FSQCJSFM TZOU WRSBHWTWSF: TZOU{fchofm_qosgof_qwdvsf_slqojohsr_1938}

FSAOWBWBU RWGDOHQV ROHO:
GIDDZWSG FIBBWBU ZCK OH RIUCIH GSQHCF P. FCHCF USOF 3 GVCKG GWUBG CT KSOF CB GVWTH HCCHV.
TIFHVSF FSGHCFOHWCB FSEIWFSG DFSQWGWCB ASHFWQ QOZWDSFG.`;

  // Standard English Letter Frequencies (%)
  const ENGLISH_FREQ = {
    A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1,
    I: 7.0, J: 0.15, K: 0.8, L: 4.0, M: 2.4, N: 6.7, O: 7.5, P: 1.9,
    Q: 0.1, R: 6.0, S: 6.3, T: 9.1, U: 2.8, V: 1.0, W: 2.4, X: 0.15,
    Y: 2.0, Z: 0.07
  };

  /* --------------------------------------------------------------------------
     1. Line Numbers & Hex Dump Generation
     -------------------------------------------------------------------------- */
  function initTextAndHexViews() {
    const lineNumbersEl = document.getElementById('lineNumbers');
    const hexDisplayEl = document.getElementById('hexDisplayArea');
    
    // Generate Line Numbers
    const lines = RAW_CIPHERTEXT.split('\n');
    let lineNumsHTML = '';
    for (let i = 1; i <= lines.length; i++) {
      lineNumsHTML += `${i.toString().padStart(2, '0')}\n`;
    }
    if (lineNumbersEl) lineNumbersEl.textContent = lineNumsHTML;

    // Generate Hexadecimal View
    let hexOutput = '';
    let offset = 0;
    const bytes = new TextEncoder().encode(RAW_CIPHERTEXT);
    
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hexAddr = offset.toString(16).padStart(8, '0').toUpperCase();
      
      let hexBytes = '';
      let asciiChars = '';
      
      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          hexBytes += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
          asciiChars += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        } else {
          hexBytes += '   ';
        }
        if (j === 7) hexBytes += ' '; // Extra spacing mid-row
      }
      
      hexOutput += `${hexAddr}  ${hexBytes} |${asciiChars}|\n`;
      offset += 16;
    }
    
    if (hexDisplayEl) hexDisplayEl.textContent = hexOutput;
  }

  /* --------------------------------------------------------------------------
     2. Tab View Switcher
     -------------------------------------------------------------------------- */
  function initTabSwitcher() {
    const btnText = document.getElementById('tabTextBtn');
    const btnHex = document.getElementById('tabHexBtn');
    const btnFreq = document.getElementById('tabFreqBtn');

    const paneText = document.getElementById('paneText');
    const paneHex = document.getElementById('paneHex');
    const paneFreq = document.getElementById('paneFreq');

    const tabs = [
      { btn: btnText, pane: paneText },
      { btn: btnHex, pane: paneHex },
      { btn: btnFreq, pane: paneFreq }
    ];

    tabs.forEach(({ btn, pane }) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        tabs.forEach(t => {
          t.btn.classList.remove('active');
          t.pane.classList.remove('active');
        });
        btn.classList.add('active');
        pane.classList.add('active');
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. Frequency Analysis Chart Rendering
     -------------------------------------------------------------------------- */
  function initFrequencyChart() {
    const wrapper = document.getElementById('freqBarsWrapper');
    if (!wrapper) return;

    // Count letters in RAW_CIPHERTEXT
    const counts = {};
    let totalLetters = 0;
    for (let i = 65; i <= 90; i++) counts[String.fromCharCode(i)] = 0;

    for (let char of RAW_CIPHERTEXT.toUpperCase()) {
      if (char >= 'A' && char <= 'Z') {
        counts[char]++;
        totalLetters++;
      }
    }

    // Find max frequency for chart scaling
    let maxPct = 15; // default max percentage cap
    for (let char in counts) {
      const pct = (counts[char] / totalLetters) * 100;
      if (pct > maxPct) maxPct = pct;
    }

    wrapper.innerHTML = '';

    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      const count = counts[letter];
      const cipherPct = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
      const englishPct = ENGLISH_FREQ[letter] || 0;

      const col = document.createElement('div');
      col.className = 'freq-bar-col';
      col.title = `${letter}: Ciphertext ${count} (${cipherPct.toFixed(1)}%) vs English Ref (${englishPct}%)`;

      const cipherHeightPct = (cipherPct / maxPct) * 100;
      const englishHeightPct = (englishPct / maxPct) * 100;

      col.innerHTML = `
        <div class="freq-bar-dual">
          <div class="bar-cipher-fill" style="height: ${cipherHeightPct}%"></div>
          <div class="bar-english-fill" style="height: ${englishHeightPct}%"></div>
        </div>
        <span class="freq-label">${letter}</span>
      `;
      wrapper.appendChild(col);
    }
  }

  /* --------------------------------------------------------------------------
     4. Interactive SVG Rotor Dial Simulator
     -------------------------------------------------------------------------- */
  function initRotorDialSVG() {
    const outerGroup = document.getElementById('outerAlphabetGroup');
    const innerGroup = document.getElementById('innerAlphabetGroup');
    const slider = document.getElementById('shiftSlider');
    const display = document.getElementById('shiftValDisplay');
    const resetBtn = document.getElementById('resetRotorBtn');
    const mappingText = document.getElementById('sampleMappingText');

    if (!outerGroup || !innerGroup || !slider) return;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const centerX = 150;
    const centerY = 150;
    const outerR = 120;
    const innerR = 90;

    // Build Outer Dial Letters (Ciphertext)
    let outerHTML = '';
    let innerHTML = '';

    for (let i = 0; i < 26; i++) {
      const angle = (i * 360 / 26) * (Math.PI / 180) - (Math.PI / 2);
      
      // Outer
      const ox = centerX + outerR * Math.cos(angle);
      const oy = centerY + outerR * Math.sin(angle);
      outerHTML += `<text x="${ox}" y="${oy}" fill="#8c6d3b" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="central">${alphabet[i]}</text>`;

      // Inner
      const ix = centerX + innerR * Math.cos(angle);
      const iy = centerY + innerR * Math.sin(angle);
      innerHTML += `<text x="${ix}" y="${iy}" fill="#1b365d" font-family="JetBrains Mono" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="central">${alphabet[i]}</text>`;
    }

    outerGroup.innerHTML = outerHTML;
    innerGroup.innerHTML = innerHTML;

    function updateRotorShift(shift) {
      const angleStep = 360 / 26;
      const rotAngle = shift * angleStep;
      innerGroup.setAttribute('transform', `rotate(${-rotAngle} ${centerX} ${centerY})`);
      
      if (display) display.textContent = `Shift +${shift}`;

      // Update sample mapping preview
      if (mappingText) {
        const aMapped = alphabet[(0 + shift) % 26];
        const bMapped = alphabet[(1 + shift) % 26];
        const cMapped = alphabet[(2 + shift) % 26];
        mappingText.textContent = `A \u2192 ${aMapped}, B \u2192 ${bMapped}, C \u2192 ${cMapped}`;
      }
    }

    slider.addEventListener('input', (e) => {
      updateRotorShift(parseInt(e.target.value, 10));
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        slider.value = 0;
        updateRotorShift(0);
      });
    }

    updateRotorShift(0);
  }

  /* --------------------------------------------------------------------------
     5. Clipboard Copy & Toast Feedback
     -------------------------------------------------------------------------- */
  function initCopyButton() {
    const copyBtn = document.getElementById('copyCipherBtn');
    const toast = document.getElementById('toast');

    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(RAW_CIPHERTEXT).then(() => {
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. Modal Lightbox Photo Inspector
     -------------------------------------------------------------------------- */
  function initPhotoModal() {
    const zoomBtn = document.getElementById('zoomPhotoBtn');
    const modal = document.getElementById('photoModal');
    const closeBtn = document.getElementById('closeModalBtn');

    if (!zoomBtn || !modal) return;

    zoomBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. Active Nav Highlighting on Scroll
     -------------------------------------------------------------------------- */
  function initNavScrollHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // Execute all initializations
  initTextAndHexViews();
  initTabSwitcher();
  initFrequencyChart();
  initRotorDialSVG();
  initCopyButton();
  initPhotoModal();
  initNavScrollHighlight();

});
