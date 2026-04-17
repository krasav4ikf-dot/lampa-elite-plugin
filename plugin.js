(function () {
'use strict';

function boot(){
    if(!window.Lampa){
        document.addEventListener('lampa', boot);
        return;
    }

    start();
}

// ===== SAFE CHECK =====
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

// ===== SCORE =====
function score(text){
    let m = check(text);

    if(m.bad) return -999;

    let s = 0;
    if(m.remux) s += 120;
    else if(m.bluray) s += 90;
    else if(m.web) s += 60;

    if(m.q4k) s += 50;
    if(m.hdr) s += 25;
    if(m.dv) s += 30;

    return s;
}

// ===== DOM ONLY (NO API) =====
function run(){

    const obs = new MutationObserver(()=>{

        document.querySelectorAll('.card').forEach(card=>{

            if(card.dataset.fix) return;
            card.dataset.fix = 1;

            let text = card.innerText || '';
            let s = score(text);

            if(s > 120){
                card.style.boxShadow = '0 0 15px rgba(0,255,180,0.5)';
            }

            if(text.toLowerCase().includes('4k')){
                let b = document.createElement('div');
                b.innerText = '4K';
                b.style = `
                    position:absolute;
                    top:5px;
                    left:5px;
                    background:#000;
                    color:#fff;
                    font-size:10px;
                    padding:3px 6px;
                    border-radius:6px;
                `;
                card.appendChild(b);
            }

        });

    });

    obs.observe(document.body,{
        childList:true,
        subtree:true
    });

    console.log('Lampa SAFE FILTER RUNNING');
}

// ===== START =====
function start(){
    run();
}

boot();

})();
