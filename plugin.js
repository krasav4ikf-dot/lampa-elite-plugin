(function () {
'use strict';

let ELITE = {
    bestOnly: false,
    ultraClean: false,
    autoPlay: true
};

// ===== PARSER =====
function parse(t){
    t = (t || '').toLowerCase();

    return {
        remux: t.includes('remux'),
        bluray: t.includes('bluray'),
        webdl: t.includes('web-dl'),
        webrip: t.includes('webrip'),
        cam: t.includes('cam') || t.includes('ts'),

        hdr: t.includes('hdr'),
        dv: t.includes('dolby') || t.includes('dv'),

        q4k: t.includes('2160') || t.includes('4k'),
        q1080: t.includes('1080')
    };
}

// ===== SCORE ENGINE (CORE LOGIC) =====
function score(item){
    let t = (item.title||'') + ' ' + (item.quality||'');
    let m = parse(t);

    let s = 0;

    // ❌ мусор
    if(m.cam) return -999;

    // 📀 источник качества
    if(m.remux) s += 160;
    else if(m.bluray) s += 120;
    else if(m.webdl) s += 80;
    else if(m.webrip) s += 50;

    // 🎥 качество
    if(m.q4k) s += 70;
    else if(m.q1080) s += 40;

    // 🌈 HDR / DV
    if(m.hdr) s += 40;
    if(m.dv) s += 50;

    return s;
}

// ===== FILTER ENGINE =====
function filter(items){

    let arr = items
        .map(i => ({...i, _score: score(i)}))
        .filter(i => i._score > -900);

    arr.sort((a,b)=>b._score - a._score);

    // ELITE MODE: только идеальные релизы
    if(ELITE.ultraClean){
        arr = arr.filter(i=>{
            let m = parse((i.title||'')+(i.quality||''));
            return m.q4k && (m.hdr || m.dv) && (m.remux || m.bluray);
        });
    }

    // BEST ONLY MODE
    if(ELITE.bestOnly && arr.length){
        return [arr[0]];
    }

    return arr;
}

// ===== UI STYLE =====
function css(){
    let s=document.createElement('style');
    s.innerHTML=`
    .elite-card{
        transition:.2s;
    }

    .elite-card:hover{
        transform:scale(1.08);
        z-index:10;
    }

    .elite-top{
        box-shadow:0 0 30px rgba(0,255,180,0.9);
        border-radius:12px;
    }

    .elite-badge{
        position:absolute;
        top:6px;
        left:6px;
        background:#000;
        color:#fff;
        font-size:11px;
        padding:4px 8px;
        border-radius:8px;
    }

    .elite-panel{
        position:fixed;
        top:8%;
        left:50%;
        transform:translateX(-50%);
        width:560px;
        background:rgba(10,10,10,0.97);
        backdrop-filter:blur(30px);
        border-radius:30px;
        padding:20px;
        z-index:9999;
        box-shadow:0 0 100px rgba(0,0,0,1);
    }

    .elite-btn{
        margin-top:10px;
        padding:14px;
        border-radius:18px;
        text-align:center;
        font-weight:bold;
        cursor:pointer;
    }

    .b1{background:#00e5ff;}
    .b2{background:#00c853;}
    .b3{background:#ff1744;}
    `;
    document.head.appendChild(s);
}

// ===== BADGES =====
function badges(){
    Lampa.Listener.follow('full', e=>{
        if(e.type==='complite'){
            document.querySelectorAll('.card').forEach(c=>{
                c.classList.add('elite-card');

                let t=c.innerText.toLowerCase();

                if(t.includes('4k')){
                    let b=document.createElement('div');
                    b.className='elite-badge';
                    b.innerText='4K';
                    c.appendChild(b);
                    c.classList.add('elite-top');
                }

                if(t.includes('hdr')){
                    let b=document.createElement('div');
                    b.className='elite-badge';
                    b.style.top='28px';
                    b.innerText='HDR';
                    c.appendChild(b);
                }

                if(t.includes('remux')){
                    let b=document.createElement('div');
                    b.className='elite-badge';
                    b.style.top='50px';
                    b.innerText='REMUX';
                    c.appendChild(b);
                }
            });
        }
    });
}

// ===== AUTOPLAY =====
function autoplay(){
    Lampa.Listener.follow('activity', e=>{
        if(e.type==='open' && ELITE.autoPlay){
            setTimeout(()=>{
                let btn=document.querySelector('.view--online');
                if(btn) btn.click();
            },700);
        }
    });
}

// ===== MENU =====
function panel(){
    let el=document.createElement('div');
    el.className='elite-panel';

    el.innerHTML=`
        <div class="elite-btn b1">🔥 BEST ONLY</div>
        <div class="elite-btn b2">💎 ULTRA CLEAN (ONLY PERFECT)</div>
        <div class="elite-btn b3">✖ CLOSE</div>
    `;

    document.body.appendChild(el);

    el.querySelector('.b1').onclick=()=>{
        ELITE.bestOnly=true;
        el.remove();
        Lampa.Activity.reload();
    };

    el.querySelector('.b2').onclick=()=>{
        ELITE.ultraClean=true;
        el.remove();
        Lampa.Activity.reload();
    };

    el.querySelector('.b3').onclick=()=>el.remove();
}

// ===== INTERCEPT =====
function intercept(){
    let orig=Lampa.Api.sources;

    Lampa.Api.sources=function(p,ok,err){
        orig(p,function(d){
            if(d.results) d.results = filter(d.results);
            ok(d);
        },err);
    };
}

// ===== START =====
function start(){
    css();
    intercept();
    badges();
    autoplay();

    Lampa.Listener.follow('app', e=>{
        if(e.type==='ready'){
            Lampa.Controller.collectionSet('menu', [{
                title:'👑 ELITE AI',
                icon:'star',
                onClick:panel
            }]);
        }
    });

    console.log('👑 ELITE AI ACTIVE');
}

if(window.Lampa) start();
else document.addEventListener('lampa',start);

})();
