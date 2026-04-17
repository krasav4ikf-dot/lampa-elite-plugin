(function () {
'use strict';

function boot() {
    if (!window.Lampa) {
        document.addEventListener('lampa', boot);
        return;
    }

    init();
}

// ===== SAFE PARSE =====
function parse(text){
    text = (text || '').toLowerCase();

    return {
        remux: text.includes('remux'),
        bluray: text.includes('bluray'),
        webdl: text.includes('web'),
        hdr: text.includes('hdr'),
        dv: text.includes('dolby') || text.includes('dv'),
        q4k: text.includes('4k') || text.includes('2160')
    };
}

// ===== LOCAL SORT ONLY (БЕЗ API ХУКОВ) =====
function improveUI(){

    let observer = new MutationObserver(() => {

        document.querySelectorAll('.card').forEach(card => {

            if(card.dataset.fixed) return;
            card.dataset.fixed = 1;

            let t = card.innerText || '';
            let m = parse(t);

            let score = 0;

            if(m.remux) score += 100;
            else if(m.bluray) score += 70;
            else if(m.webdl) score += 40;

            if(m.q4k) score += 50;
            if(m.hdr) score += 20;
            if(m.dv) score += 30;

            if(score > 120){
                card.style.boxShadow = '0 0 15px rgba(0,255,150,0.5)';
            }

            if(m.q4k){
                let b = document.createElement('div');
                b.innerText = '4K';
                b.style = `
                    position:absolute;
                    top:5px;
                    left:5px;
                    background:black;
                    color:white;
                    font-size:10px;
                    padding:3px 6px;
                    border-radius:6px;
                `;
                card.appendChild(b);
            }

        });

    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ===== SIMPLE MENU =====
function menu(){

    let btn = document.createElement('div');

    btn.innerHTML = '⚙ FILTER';
    btn.style = `
        position:fixed;
        bottom:20px;
        right:20px;
        background:#000;
        color:#fff;
        padding:10px 15px;
        border-radius:10px;
        z-index:99999;
        cursor:pointer;
        font-family:sans-serif;
    `;

    btn.onclick = () => {
        alert('Фильтр активен: REMUX / 4K / HDR приоритет');
    };

    document.body.appendChild(btn);
}

// ===== START =====
function init(){
    improveUI();
    menu();

    console.log('Lampa 3.1.8 SAFE FILTER ACTIVE');
}

boot();

})();
