(function () {
'use strict';

function boot(){
    if(!window.Lampa){
        document.addEventListener('lampa', boot);
        return;
    }

    start();
}

// ===== SAFE QUALITY PARSER =====
function check(text){
    text = (text||'').toLowerCase();

    return {
        remux: text.includes('remux'),
        bluray: text.includes('bluray'),
        web: text.includes('web'),
        hdr: text.includes('hdr'),
        dv: text.includes('dolby') || text.includes('dv'),
        q4k: text.includes('4k') || text.includes('2160'),
        bad: text.includes('cam') || text.includes('ts')
    };
}

// ===== SCORE ENGINE =====
function calc(text){
    let m = check(text);

    if(m.bad) return -999;

    let s = 0;

    if(m.remux) s += 120;
    else if(m.bluray) s += 90;
    else if(m.web) s += 60;

    if(m.q4k) s += 50;
    if(m.hdr) s += 25;
    if(m.dv) s += 35;

    return s;
}

// ===== DOM IMPROVER (NO API = NO CRASH) =====
function enhanceUI(){

    const obs = new MutationObserver(()=>{

        document.querySelectorAll('.card').forEach(card=>{

            if(card.dataset.safe) return;
            card.dataset.safe = 1;

            let text = card.innerText || '';
            let score = calc(text);

            if(score > 120){
                card.style.boxShadow = '0 0 15px rgba(0,255,180,0.5)';
            }

            if(text.toLowerCase().includes('4k')){
                let badge = document.createElement('div');
                badge.innerText = '4K';
                badge.style = `
                    position:absolute;
                    top:6px;
                    left:6px;
                    background:#000;
                    color:#fff;
                    font-size:10px;
                    padding:3px 6px;
                    border-radius:6px;
                    z-index:10;
                `;
                card.appendChild(badge);
            }

        });

    });

    obs.observe(document.body,{
        childList:true,
        subtree:true
    });
}

// ===== SIMPLE BUTTON =====
function ui(){

    let btn = document.createElement('div');

    btn.innerHTML = '⚙ FILTER';
    btn.style = `
        position:fixed;
        bottom:20px;
        right:20px;
        background:#000;
        color:#fff;
        padding:10px 14px;
        border-radius:10px;
        z-index:99999;
        cursor:pointer;
        font-family:sans-serif;
    `;

    btn.onclick = ()=>{
        alert('Фильтр активен: 4K / HDR / REMUX приоритет');
    };

    document.body.appendChild(btn);
}

// ===== START =====
function start(){
    enhanceUI();
    ui();

    console.log('Lampa 3.1.8 SAFE PLUGIN RUNNING');
}

boot();

})();
