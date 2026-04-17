(function () {
'use strict';

function boot() {
    if (!window.Lampa) {
        document.addEventListener('lampa', boot);
        return;
    }

    try {
        init();
    } catch (e) {
        console.log('ZERO ERROR PLUGIN SAFE FAIL:', e);
    }
}

let STATE = {
    bestOnly: false,
    ultra: false
};

// ===== SAFE PARSER =====
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
        bad: t.includes('cam') || t.includes('ts')
    };
}

// ===== SAFE SCORE =====
function score(item) {
    try {
        let t = (item.title || '') + ' ' + (item.quality || '');
        let m = parse(t);

        if (m.bad) return -999;

        let s = 0;

        if (m.remux) s += 100;
        else if (m.bluray) s += 80;
        else if (m.webdl) s += 60;

        if (m.q4k) s += 50;
        else if (m.q1080) s += 30;

        if (m.hdr) s += 20;
        if (m.dv) s += 30;

        return s;
    } catch (e) {
        return 0;
    }
}

// ===== SAFE FILTER =====
function filter(items) {
    if (!Array.isArray(items)) return items;

    let arr = items.map(i => {
        return {
            ...i,
            _score: score(i)
        };
    });

    arr = arr.filter(i => i._score > -900);

    arr.sort((a, b) => b._score - a._score);

    if (STATE.ultra && arr.length) {
        arr = arr.filter(i => {
            let t = (i.title || '').toLowerCase();
            return t.includes('4k') && (t.includes('hdr') || t.includes('dolby'));
        });
    }

    if (STATE.bestOnly && arr.length) {
        return [arr[0]];
    }

    return arr;
}

// ===== UI SAFE =====
function openUI() {
    let el = document.createElement('div');

    el.style = `
        position:fixed;
        top:10%;
        left:50%;
        transform:translateX(-50%);
        width:500px;
        background:rgba(0,0,0,0.95);
        color:#fff;
        padding:20px;
        border-radius:18px;
        z-index:99999;
        font-family:sans-serif;
    `;

    el.innerHTML = `
        <h3>🛡 ZERO ERROR FILTER</h3>

        <button id="best">🔥 BEST ONLY</button>
        <button id="ultra">💎 ULTRA 4K HDR</button>
        <button id="close">✖ CLOSE</button>
    `;

    document.body.appendChild(el);

    el.querySelector('#best').onclick = () => {
        STATE.bestOnly = true;
        el.remove();
        safeReload();
    };

    el.querySelector('#ultra').onclick = () => {
        STATE.ultra = true;
        el.remove();
        safeReload();
    };

    el.querySelector('#close').onclick = () => el.remove();
}

// ===== SAFE RELOAD =====
function safeReload() {
    try {
        if (Lampa.Activity && Lampa.Activity.reload) {
            Lampa.Activity.reload();
        }
    } catch (e) {}
}

// ===== SAFE HOOK (НЕ ЛОМАЕТ LAMPA) =====
function hook() {
    try {
        if (!Lampa.Api || !Lampa.Api.sources) return;

        const orig = Lampa.Api.sources;

        Lampa.Api.sources = function (params, success, error) {
            return orig(params, function (data) {
                try {
                    if (data && data.results) {
                        data.results = filter(data.results);
                    }
                } catch (e) {}

                success(data);
            }, error);
        };
    } catch (e) {}
}

// ===== BADGES SAFE =====
function badges() {
    try {
        Lampa.Listener.follow('full', e => {
            if (e.type !== 'complite') return;

            document.querySelectorAll('.card').forEach(c => {
                if (!c.dataset.safe) {
                    c.dataset.safe = 1;
                    let t = c.innerText.toLowerCase();

                    if (t.includes('4k')) {
                        c.style.boxShadow = '0 0 10px rgba(0,255,150,0.4)';
                    }
                }
            });
        });
    } catch (e) {}
}

// ===== START =====
function init() {
    hook();
    badges();

    try {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') {
                Lampa.Controller.collectionSet('menu', [{
                    title: '🛡 FILTER SAFE',
                    icon: 'filter_list',
                    onClick: openUI
                }]);
            }
        });
    } catch (e) {}

    console.log('🛡 ZERO ERROR LOADED');
}

boot();

})();

