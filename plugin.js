(function () {
'use strict';

function boot() {
    if (!window.Lampa) {
        document.addEventListener('lampa', boot);
        return;
    }

    try {
        start();
    } catch (e) {
        console.log('PLUGIN ERROR:', e);
    }
}

let STATE = {
    bestOnly: false,
    ultra: false
};

// ===== PARSER =====
function parse(t) {
    t = (t || '').toLowerCase();

    return {
        remux: t.includes('remux'),
        bluray: t.includes('bluray'),
        webdl: t.includes('web-dl'),
        hdr: t.includes('hdr'),
        dv: t.includes('dolby') || t.includes('dv'),
        q4k: t.includes('4k') || t.includes('2160'),
        q1080: t.includes('1080'),
        cam: t.includes('cam') || t.includes('ts')
    };
}

// ===== SCORE =====
function score(item) {
    let t = (item.title || '') + ' ' + (item.quality || '');
    let m = parse(t);

    if (m.cam) return -999;

    let s = 0;

    if (m.remux) s += 120;
    else if (m.bluray) s += 90;
    else if (m.webdl) s += 60;

    if (m.q4k) s += 60;
    else if (m.q1080) s += 30;

    if (m.hdr) s += 30;
    if (m.dv) s += 40;

    return s;
}

// ===== SAFE FILTER (НЕ ЛОМАЕТ API) =====
function filterItems(items) {
    if (!Array.isArray(items)) return items;

    let arr = items
        .map(i => ({ ...i, _score: score(i) }))
        .filter(i => i._score > -900);

    arr.sort((a, b) => b._score - a._score);

    if (STATE.ultra) {
        arr = arr.filter(i => {
            let m = parse((i.title || '') + (i.quality || ''));
            return m.q4k && (m.hdr || m.dv);
        });
    }

    if (STATE.bestOnly && arr.length) {
        return [arr[0]];
    }

    return arr;
}

// ===== UI =====
function openPanel() {
    let el = document.createElement('div');

    el.style = `
        position:fixed;
        top:10%;
        left:50%;
        transform:translateX(-50%);
        width:520px;
        background:rgba(0,0,0,0.95);
        backdrop-filter:blur(20px);
        border-radius:20px;
        padding:20px;
        z-index:99999;
        color:#fff;
        font-family:sans-serif;
    `;

    el.innerHTML = `
        <h2>⚙️ LAMPA FIX FILTER</h2>

        <button id="best">🔥 BEST ONLY</button>
        <button id="ultra">💎 ULTRA 4K HDR</button>
        <button id="close">✖ CLOSE</button>
    `;

    document.body.appendChild(el);

    el.querySelector('#best').onclick = () => {
        STATE.bestOnly = true;
        el.remove();
        reload();
    };

    el.querySelector('#ultra').onclick = () => {
        STATE.ultra = true;
        el.remove();
        reload();
    };

    el.querySelector('#close').onclick = () => el.remove();
}

// ===== SAFE RELOAD =====
function reload() {
    try {
        if (Lampa.Activity && Lampa.Activity.reload) {
            Lampa.Activity.reload();
        }
    } catch (e) {}
}

// ===== SAFE HOOK (НЕ ЛОМАЕТ LAMPA) =====
function hook() {
    if (!Lampa.Api || !Lampa.Api.sources) return;

    const original = Lampa.Api.sources;

    Lampa.Api.sources = function (params, success, error) {
        return original(params, function (data) {
            try {
                if (data && data.results) {
                    data.results = filterItems(data.results);
                }
            } catch (e) {
                console.log('filter error:', e);
            }

            success(data);
        }, error);
    };
}

// ===== BADGES (БЕЗ КРАША) =====
function badges() {
    Lampa.Listener.follow('full', e => {
        if (e.type !== 'complite') return;

        document.querySelectorAll('.card').forEach(c => {
            let t = c.innerText.toLowerCase();

            if (!c.dataset.fix) {
                c.dataset.fix = 1;

                if (t.includes('4k')) {
                    c.style.boxShadow = '0 0 15px rgba(0,255,150,0.6)';
                }
            }
        });
    });
}

// ===== START =====
function start() {
    hook();
    badges();

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            try {
                Lampa.Controller.collectionSet('menu', [{
                    title: '⚙️ FIX FILTER',
                    icon: 'filter_list',
                    onClick: openPanel
                }]);
            } catch (e) {}
        }
    });

    console.log('FIX FILTER LOADED');
}

boot();

})();

