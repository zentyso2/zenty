/* ═══════════════════════════════════════════════════
   ZENTYSO2 — script.js  (ALL JS)
   Emir | 2025
═══════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   DATABASE  (localStorage)
══════════════════════════════════ */
const DB = {
  users()   { try { return JSON.parse(localStorage.getItem('z2_users')||'[]'); } catch { return []; } },
  save(u)   { localStorage.setItem('z2_users', JSON.stringify(u)); },
  byEmail(e){ return this.users().find(u => u.email.toLowerCase() === e.toLowerCase()); },
  byUn(n)   { return this.users().find(u => u.username.toLowerCase() === n.toLowerCase()); },
  byId(id)  { return this.users().find(u => u.id === id); },
  create(d) {
    const us = this.users();
    const u  = { id:Date.now(), username:d.username, displayName:d.displayName,
      email:d.email, password:d.password, avatar:d.avatar||'😎',
      bio:'', followers:[], following:[], badge:'', plan:'free', joinedAt:Date.now() };
    us.push(u); this.save(us); return u;
  },
  update(id, p) { const us = this.users().map(u => u.id===id ? {...u,...p} : u); this.save(us); return us.find(u=>u.id===id); },
  setSess(u){ localStorage.setItem('z2_sess', JSON.stringify({id:u.id})); },
  getSess() { try { return JSON.parse(localStorage.getItem('z2_sess')); } catch { return null; } },
  clrSess() { localStorage.removeItem('z2_sess'); },
  me()      { const s=this.getSess(); return s ? this.byId(s.id)||null : null; },
};

const PDB = {
  all()    { try { return JSON.parse(localStorage.getItem('z2_posts')||'[]'); } catch { return []; } },
  save(p)  { localStorage.setItem('z2_posts', JSON.stringify(p)); },
  create(d){ const ps=this.all(); const p={id:Date.now(),authorId:d.authorId,title:d.title||'',body:d.body,tags:d.tags||[],likes:[],comments:[],createdAt:Date.now()}; ps.unshift(p); this.save(ps); return p; },
  del(id)  { this.save(this.all().filter(p=>p.id!==id)); },
  like(pid,uid) { const ps=this.all().map(p=>{ if(p.id!==pid)return p; const h=p.likes.includes(uid); return {...p,likes:h?p.likes.filter(l=>l!==uid):[...p.likes,uid]}; }); this.save(ps); return ps.find(p=>p.id===pid); },
  comment(pid,c){ const ps=this.all().map(p=>p.id!==pid?p:{...p,comments:[...p.comments,{id:Date.now(),...c}]}); this.save(ps); return ps.find(p=>p.id===pid); },
};

/* Seed demo users */
(function seed(){
  if(DB.users().length>0) return;
  DB.save([
    {id:1001,username:'emir_z2',displayName:'Emir',email:'emir@zentyso2.com',password:'Emir2025!',avatar:'👑',bio:'Zentyso2 kanalının sahibi.',badge:'⭐ Kanal Sahibi',followers:[],following:[],plan:'vip',joinedAt:Date.now()-864e5*60},
    {id:1002,username:'aysel_az',displayName:'Aysel',email:'aysel@demo.com',password:'Demo1234!',avatar:'🌸',bio:'Tech sevər.',badge:'',followers:[1001],following:[1001],plan:'pro',joinedAt:Date.now()-864e5*20},
    {id:1003,username:'tural_dev',displayName:'Tural',email:'tural@demo.com',password:'Demo1234!',avatar:'🚀',bio:'Developer.',badge:'',followers:[1001,1002],following:[1001],plan:'free',joinedAt:Date.now()-864e5*10},
    {id:1004,username:'leyla_art',displayName:'Leyla',email:'leyla@demo.com',password:'Demo1234!',avatar:'🎵',bio:'Yaradıcı.',badge:'',followers:[1001],following:[1001,1002],plan:'pro',joinedAt:Date.now()-864e5*5},
  ]);
})();

/* Seed demo posts */
(function seedP(){
  if(PDB.all().length>0) return;
  PDB.save([
    {id:2001,authorId:1001,title:'Zentyso2 kanalına xoş gəldiniz! 🎉',body:'Salam hamıya! Bu platformada videolarım haqqında yazacaq, sizinlə hekayələri paylaşacağam.',tags:['kanal','xoş'],likes:[1002,1003,1004],comments:[{id:3001,authorId:1002,text:'Çox gözəl başlanğıc! 🔥',createdAt:Date.now()-3600e3}],createdAt:Date.now()-864e5*3},
    {id:2002,authorId:1002,title:'YouTube başlanğıcı üçün 5 tövsiyə 💡',body:'1. Konsistentlik vacibdir\n2. Thumbnail klik nisbətini artırır\n3. SEO-ya diqqət edin\n4. Toplulukla əlaqə qurun\n5. Analitikaya baxın',tags:['youtube','tövsiyə'],likes:[1001,1003],comments:[],createdAt:Date.now()-864e5*2},
    {id:2003,authorId:1003,title:'DaVinci Resolve vs CapCut 🎬',body:'Peşəkar nəticə → DaVinci. Sürətli → CapCut. Başlanğıc üçün CapCut tövsiyə edirəm.',tags:['redaktə'],likes:[1001,1002,1004],comments:[{id:3002,authorId:1001,text:'CapCut Shorts üçün mükəmməldir! 👍',createdAt:Date.now()-1800e3}],createdAt:Date.now()-864e5},
    {id:2004,authorId:1004,title:'Fon musiqisinin əhəmiyyəti 🎵',body:'Doğru musiqi izləyiciləri daha uzun saxlayır. Epidemic Sound istifadə edirəm.',tags:['musiqi'],likes:[1001,1002],comments:[],createdAt:Date.now()-3600e3*12},
  ]);
})();

/* ══════════════════════════════════
   TOAST
══════════════════════════════════ */
function toast(msg, type='') {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className   = `toast show ${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ══════════════════════════════════
   LOADER
══════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('hidden');
    const sk = document.getElementById('sk-grid');
    const rv = document.getElementById('real-vids');
    if(sk) sk.style.display = 'none';
    if(rv) { rv.style.display = 'grid'; rv.querySelectorAll('.fi').forEach(e => obs.observe(e)); }
  }, 1400);
});

/* ══════════════════════════════════
   COOKIE
══════════════════════════════════ */
(function(){ if(localStorage.getItem('z2_ck')) document.getElementById('cookie')?.classList.add('hidden'); })();
function ckOk() { localStorage.setItem('z2_ck','1'); document.getElementById('cookie')?.classList.add('hidden'); }
function ckNo() { document.getElementById('cookie')?.classList.add('hidden'); }

/* ══════════════════════════════════
   BACK TO TOP
══════════════════════════════════ */
const btt = document.getElementById('btt');
window.addEventListener('scroll', () => { if(btt) btt.classList.toggle('show', scrollY > 360); });

/* ══════════════════════════════════
   HAMBURGER
══════════════════════════════════ */
function toggleMob() {
  const h = document.getElementById('ham');
  const m = document.getElementById('mob-m');
  if(!h||!m) return;
  const o = m.classList.toggle('open');
  h.classList.toggle('open', o);
  document.body.style.overflow = o ? 'hidden' : '';
}
function closeMob() {
  document.getElementById('ham')?.classList.remove('open');
  document.getElementById('mob-m')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  const h=document.getElementById('ham'), m=document.getElementById('mob-m');
  if(h && m && !h.contains(e.target) && !m.contains(e.target)) closeMob();
});

/* ══════════════════════════════════
   THEME
══════════════════════════════════ */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('z2_theme', t);
  document.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.theme===t));
  updateFav();
}
(function initTheme(){
  const t = localStorage.getItem('z2_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.theme===t));
})();

/* ══════════════════════════════════
   PALETTE
══════════════════════════════════ */
function setPal(p) {
  document.documentElement.setAttribute('data-palette', p);
  localStorage.setItem('z2_pal', p);
  document.querySelectorAll('.pd').forEach(d => d.classList.toggle('on', d.dataset.pal===p));
  updateFav();
}
function updateFav() {
  const p = document.documentElement.getAttribute('data-palette') || 'red';
  const c = {red:'%23e53935',blue:'%231e88e5',green:'%2343a047',yellow:'%23f9a825',purple:'%238e24aa',orange:'%23e64a19'}[p] || '%23e53935';
  const f = document.querySelector('link[rel=icon]');
  if(f) f.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='${c}'/><text x='50%25' y='55%25' font-size='16' font-family='Arial Black' font-weight='900' fill='white' text-anchor='middle' dominant-baseline='middle'>Z2</text></svg>`;
}
(function initPal(){
  const p = localStorage.getItem('z2_pal') || 'red';
  document.documentElement.setAttribute('data-palette', p);
  document.querySelectorAll('.pd').forEach(d => d.classList.toggle('on', d.dataset.pal===p));
  updateFav();
})();

/* ══════════════════════════════════
   SEARCH
══════════════════════════════════ */
const SI = [
  {l:'Videolar / Videos / Видео', h:'#videos'},
  {l:'Haqqımda / About / О нас',  h:'#about'},
  {l:'İcma / Community / Сообщество', h:'#cm-sec'},
  {l:'Üzvlük / Membership / Членство', h:'#payment'},
  {l:'FAQ', h:'#faq'},
  {l:'Abunə / Subscribe / Подписаться', h:'https://youtube.com/@Zentyso2'},
];
function doSearch(v) {
  const box = document.getElementById('s-drop');
  const q   = v.trim().toLowerCase();
  if(!q || !box) { box?.classList.remove('open'); return; }
  const hits = SI.filter(i => i.l.toLowerCase().includes(q));
  box.innerHTML = hits.length
    ? hits.map(h => `<div class="s-item" onclick="location.href='${h.h}';closeSrch()"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 20l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${h.l.split('/')[0].trim()}</div>`).join('')
    : '<div class="s-none">Nəticə yoxdur</div>';
  box.classList.add('open');
}
function closeSrch() { document.getElementById('s-drop')?.classList.remove('open'); }

/* ══════════════════════════════════
   NEWSLETTER
══════════════════════════════════ */
function nlSub() {
  const i=document.getElementById('nl-inp'), b=document.getElementById('nl-btn'), ok=document.getElementById('nl-ok');
  if(!i?.value.trim().includes('@')) { if(i) i.style.borderColor='var(--ac)'; return; }
  if(i) i.style.display='none'; if(b) b.style.display='none'; if(ok) ok.style.display='block';
}

/* ══════════════════════════════════
   FAQ
══════════════════════════════════ */
function toggleFaq(q) {
  const it=q.parentElement, op=it.classList.contains('open');
  document.querySelectorAll('.faq-i.open').forEach(x=>x.classList.remove('open'));
  if(!op) it.classList.add('open');
}

/* ══════════════════════════════════
   TRANSLATIONS  AZ / TR / EN / RU
══════════════════════════════════ */
const LANGS = {
  az: {
    nv_vid:'Videolar', nv_ab:'Haqqımda', nv_cm:'İcma', nv_mb:'Üzvlük', nv_fq:'FAQ',
    h_badge:'YouTube Kanalı', h_gr:'Xoş gəldiniz', h_sfx:'-yə',
    h_desc:'Keyfiyyətli məzmun, maraqlı videolar. 800+ abunəçi bizimlə. Sən də qoşul!',
    btn_sub:'Abunə Ol', btn_w:'Videoları İzlə',
    st_sub:'Abunəçi', st_vid:'Video', st_freq:'Hər Həftə', st_cnt:'Yeni Məzmun',
    vid_lbl:'Seçilmiş', vid_ti:'Populyar Videolar', vid_de:'Ən çox baxılan videolarımız.',
    tag1:'Populyar', tag2:'Trend', tag3:'Seçilmiş',
    feat_lbl:'Özəlliklər', feat_ti:'Nə Təklif Edirik?', feat_de:'Zentyso2-nin bütün imkanları.',
    f1_ti:'🎬 Keyfiyyətli Video', f1_de:'Hər həftə yeni videolar.',
    f2_ti:'👥 İcma',             f2_de:'İnsanlarla əlaqə qur, paylaş.',
    f3_ti:'📝 Blog',             f3_de:'Maraqlı yazılar, texniki məzmun.',
    f4_ti:'🔒 Üzvlük',           f4_de:'Pro/VIP ol, eksklüziv məzmun al.',
    ab_lbl:'Kanal Sahibi', ab_ti:'Haqqımda', ab_n:'Salam, mən Emirəm 👋',
    ab_de:'Zentyso2 kanalının sahibiyəm. Keyfiyyətli məzmun yaradıram. 800+ abunəçi ilə böyüyürük!',
    nl_ti:'📬 Yeni Videolardan Xəbər Al', nl_de:'Email daxil et, ilk sən bil!', nl_btn:'Abunə Ol',
    cm_lbl:'İcma', cm_ti:'Blog & İcma',
    ff_all:'🌍 Hamısı', ff_flw:'👥 İzlədiklərim',
    lp_ti:'🔐 İcmaya Qoşul', lp_de:'Yazı paylaşmaq üçün giriş et.',
    lp_li:'Giriş Et', lp_re:'Qeydiyyat',
    wp_ph:'Nə düşünürsən?', wp_ti_ph:'Başlıq', wp_tg_ph:'#teq', wp_send:'📤 Paylaş',
    tm_ti:'🏆 Top Üzvlər', tr_ti:'🔥 Trend Teqlər', st_cm_ti:'📊 İcma',
    st_mb:'Üzv', st_po:'Yazı', st_co:'Şərh',
    pay_lbl:'Üzvlük', pay_ti:'Plan Seçin', pay_de:'Özünüzə uyğun planı seçin.',
    pln_pop:'⭐ Ən Populyar',
    fn:'Pulsuz',   fd:'Başlanğıc üçün ideal.',
    pn:'Pro Üzv',  pd:'Ən populyar seçim.',
    vn:'VIP Üzv',  vd:'Tam dəstək, hər şey daxil.',
    f_vid:'Videolara giriş', f_cm:'İcma girişi', f_bl:'Blog', f_ex:'Eksklüziv məzmun', f_dc:'VIP Discord', f_dr:'Birbaşa əlaqə',
    b_fr:'Başla', b_pr:'Pro Seç', b_vp:'VIP Seç',
    pay_title:'Ödənişi Tamamla', pay_sub:'256-bit SSL ilə qorunur.',
    pay_free_ok:'Pulsuz Plana Qoşuldunuz!', pay_free_sub:'Hesabınız aktivdir.',
    processing:'Emal edilir…',
    pf_n:'Ad Soyad', pf_e:'Email', pf_c:'Kart Nömrəsi', pf_exp:'Son Tarix', pf_cv:'CVV',
    pm_sec:'256-bit SSL şifrəli.', pm_btn:'💳 Ödənişi Tamamla',
    pm_ok_ti:'Ödəniş Uğurlu!', pm_ok_de:'Hesabınız aktivdir. Xoş gəldiniz!',
    fq_lbl:'Suallar', fq_ti:'Tez-tez soruşulanlar',
    q1:'Nə vaxt yeni video yükləyirsən?',      a1:'Hər həftə ən azı 1 yeni video.',
    q2:'İcmada necə yazı paylaşa bilərəm?',    a2:'Qeydiyyatdan keç, giriş et, paylaş.',
    q3:'Əməkdaşlıq üçün necə əlaqə etmək?',   a3:'Sosial media vasitəsilə DM at.',
    q4:'Pro/VIP nə verir?',                    a4:'Pro — eksklüziv məzmun. VIP — Discord + birbaşa əlaqə.',
    ft_n:'Naviqasiya', ft_s:'Sosial Media',
    ft_de:"Emir'in rəsmi kanalı. 800+ abunəçi. Hər həftə yeni məzmun.",
    ft_cp:'© 2025 Zentyso2 · Emir. Bütün hüquqlar qorunur.',
    ck_t:'🍪 Daha yaxşı təcrübə üçün kukilərdən istifadə edirik.',
    ck_ok:'Qəbul et', ck_no:'Rədd et',
  },
  tr: {
    nv_vid:'Videolar', nv_ab:'Hakkımda', nv_cm:'Topluluk', nv_mb:'Üyelik', nv_fq:'SSS',
    h_badge:'YouTube Kanalı', h_gr:'Hoş geldiniz', h_sfx:"'e",
    h_desc:'Kaliteli içerik, ilgi çekici videolar. 800+ abone bizimle. Sen de katıl!',
    btn_sub:'Abone Ol', btn_w:'Videoları İzle',
    st_sub:'Abone', st_vid:'Video', st_freq:'Her Hafta', st_cnt:'Yeni İçerik',
    vid_lbl:'Öne Çıkan', vid_ti:'Popüler Videolar', vid_de:'En çok izlenen videolarımız.',
    tag1:'Popüler', tag2:'Trend', tag3:'Öne Çıkan',
    feat_lbl:'Özellikler', feat_ti:'Neler Sunuyoruz?', feat_de:'Zentyso2\'nin tüm imkânları.',
    f1_ti:'🎬 Kaliteli Video', f1_de:'Her hafta yeni videolar.',
    f2_ti:'👥 Topluluk',       f2_de:'İnsanlarla bağlantı kur, paylaş.',
    f3_ti:'📝 Blog',           f3_de:'İlginç yazılar, teknik içerik.',
    f4_ti:'🔒 Üyelik',         f4_de:'Pro/VIP ol, özel içerik al.',
    ab_lbl:'Kanal Sahibi', ab_ti:'Hakkımda', ab_n:"Merhaba, ben Emir'im 👋",
    ab_de:'Zentyso2 kanalının sahibiyim. Kaliteli içerik üretiyorum. 800+ abone ile büyüyoruz!',
    nl_ti:'📬 Yeni Videolardan Haberdar Ol', nl_de:'E-posta gir, ilk sen bil!', nl_btn:'Abone Ol',
    cm_lbl:'Topluluk', cm_ti:'Blog & Topluluk',
    ff_all:'🌍 Hepsi', ff_flw:'👥 Takip Ettiklerim',
    lp_ti:'🔐 Topluluğa Katıl', lp_de:'Yazı paylaşmak için giriş yap.',
    lp_li:'Giriş Yap', lp_re:'Kayıt Ol',
    wp_ph:'Ne düşünüyorsun?', wp_ti_ph:'Başlık', wp_tg_ph:'#etiket', wp_send:'📤 Paylaş',
    tm_ti:'🏆 En İyi Üyeler', tr_ti:'🔥 Trend Etiketler', st_cm_ti:'📊 Topluluk',
    st_mb:'Üye', st_po:'Yazı', st_co:'Yorum',
    pay_lbl:'Üyelik', pay_ti:'Plan Seçin', pay_de:'Size uygun planı seçin.',
    pln_pop:'⭐ En Popüler',
    fn:'Ücretsiz', fd:'Başlangıç için ideal.',
    pn:'Pro Üye',  pd:'En popüler seçim.',
    vn:'VIP Üye',  vd:'Tam destek, her şey dahil.',
    f_vid:'Videolara erişim', f_cm:'Topluluk erişimi', f_bl:'Blog', f_ex:'Özel içerik', f_dc:'VIP Discord', f_dr:'Doğrudan iletişim',
    b_fr:'Başla', b_pr:"Pro'yu Seç", b_vp:"VIP'i Seç",
    pay_title:'Ödemeyi Tamamla', pay_sub:'256-bit SSL ile korunuyor.',
    pay_free_ok:'Ücretsiz Plana Katıldınız!', pay_free_sub:'Hesabınız aktif.',
    processing:'İşleniyor…',
    pf_n:'Ad Soyad', pf_e:'E-posta', pf_c:'Kart Numarası', pf_exp:'Son Kullanma', pf_cv:'CVV',
    pm_sec:'256-bit SSL şifreli.', pm_btn:'💳 Ödemeyi Tamamla',
    pm_ok_ti:'Ödeme Başarılı!', pm_ok_de:'Hesabınız aktif. Hoş geldiniz!',
    fq_lbl:'Sorular', fq_ti:'Sık Sorulan Sorular',
    q1:'Ne zaman yeni video yüklüyorsun?',           a1:'Her hafta en az 1 yeni video.',
    q2:'Toplulukta nasıl yazı paylaşabilirim?',      a2:'Kayıt ol, giriş yap, paylaş.',
    q3:'İş birliği için nasıl iletişime geçmeliyim?', a3:'Sosyal medyadan DM at.',
    q4:'Pro/VIP ne sağlar?',                         a4:'Pro — özel içerik. VIP — Discord + doğrudan iletişim.',
    ft_n:'Navigasyon', ft_s:'Sosyal Medya',
    ft_de:"Emir'in kanalı. 800+ abone. Her hafta yeni içerik.",
    ft_cp:'© 2025 Zentyso2 · Emir. Tüm hakları saklıdır.',
    ck_t:'🍪 Daha iyi deneyim için çerez kullanıyoruz.',
    ck_ok:'Kabul Et', ck_no:'Reddet',
  },
  en: {
    nv_vid:'Videos', nv_ab:'About', nv_cm:'Community', nv_mb:'Membership', nv_fq:'FAQ',
    h_badge:'YouTube Channel', h_gr:'Welcome to', h_sfx:'',
    h_desc:'Quality content, engaging videos. 800+ subscribers with us. Join too!',
    btn_sub:'Subscribe', btn_w:'Watch Videos',
    st_sub:'Subscribers', st_vid:'Videos', st_freq:'Every Week', st_cnt:'New Content',
    vid_lbl:'Featured', vid_ti:'Popular Videos', vid_de:'Our most watched videos.',
    tag1:'Popular', tag2:'Trending', tag3:'Featured',
    feat_lbl:'Features', feat_ti:'What We Offer', feat_de:'Everything Zentyso2 has to offer.',
    f1_ti:'🎬 Quality Video', f1_de:'New quality videos every week.',
    f2_ti:'👥 Community',     f2_de:'Connect with people, share posts.',
    f3_ti:'📝 Blog',          f3_de:'Interesting posts, technical content.',
    f4_ti:'🔒 Membership',    f4_de:'Go Pro/VIP for exclusive content.',
    ab_lbl:'Channel Owner', ab_ti:'About Me', ab_n:"Hey, I'm Emir 👋",
    ab_de:"I'm the creator of Zentyso2. Making quality content. Growing with 800+ subscribers!",
    nl_ti:'📬 Get Video Notifications', nl_de:'Enter your email, be the first to know!', nl_btn:'Subscribe',
    cm_lbl:'Community', cm_ti:'Blog & Community',
    ff_all:'🌍 All', ff_flw:'👥 Following',
    lp_ti:'🔐 Join the Community', lp_de:'Log in to share posts.',
    lp_li:'Log In', lp_re:'Sign Up',
    wp_ph:"What's on your mind?", wp_ti_ph:'Title', wp_tg_ph:'#tag', wp_send:'📤 Post',
    tm_ti:'🏆 Top Members', tr_ti:'🔥 Trending Tags', st_cm_ti:'📊 Community',
    st_mb:'Members', st_po:'Posts', st_co:'Comments',
    pay_lbl:'Membership', pay_ti:'Choose a Plan', pay_de:'Pick the right plan for you.',
    pln_pop:'⭐ Most Popular',
    fn:'Free',       fd:'Perfect for getting started.',
    pn:'Pro Member', pd:'Most popular choice.',
    vn:'VIP Member', vd:'Full access, everything included.',
    f_vid:'Access to all videos', f_cm:'Community access', f_bl:'Blog posts', f_ex:'Exclusive content', f_dc:'VIP Discord', f_dr:'Direct contact',
    b_fr:'Get Started', b_pr:'Choose Pro', b_vp:'Choose VIP',
    pay_title:'Complete Payment', pay_sub:'Protected with 256-bit SSL.',
    pay_free_ok:'You joined the Free Plan!', pay_free_sub:'Your account is active.',
    processing:'Processing…',
    pf_n:'Full Name', pf_e:'Email', pf_c:'Card Number', pf_exp:'Expiry Date', pf_cv:'CVV',
    pm_sec:'256-bit SSL encrypted.', pm_btn:'💳 Complete Payment',
    pm_ok_ti:'Payment Successful!', pm_ok_de:'Your account is active. Welcome!',
    fq_lbl:'Questions', fq_ti:'Frequently Asked Questions',
    q1:'When do you upload new videos?',         a1:'At least 1 new video every week.',
    q2:'How do I share a post in the community?', a2:'Sign up, log in, then post.',
    q3:'How can I contact you for collaborations?', a3:'DM me on social media.',
    q4:'What does Pro/VIP give?',                 a4:'Pro — exclusive content. VIP — Discord + direct contact.',
    ft_n:'Navigation', ft_s:'Social Media',
    ft_de:"Emir's official channel. 800+ subscribers. New content every week.",
    ft_cp:'© 2025 Zentyso2 · Emir. All rights reserved.',
    ck_t:'🍪 We use cookies to improve your experience.',
    ck_ok:'Accept', ck_no:'Decline',
  },
  ru: {
    nv_vid:'Видео', nv_ab:'О канале', nv_cm:'Сообщество', nv_mb:'Членство', nv_fq:'FAQ',
    h_badge:'YouTube Канал', h_gr:'Добро пожаловать', h_sfx:' — Zentyso2',
    h_desc:'Качественный контент, интересные видео. 800+ подписчиков с нами. Присоединяйся!',
    btn_sub:'Подписаться', btn_w:'Смотреть видео',
    st_sub:'Подписчиков', st_vid:'Видео', st_freq:'Каждую неделю', st_cnt:'Новый контент',
    vid_lbl:'Избранное', vid_ti:'Популярные видео', vid_de:'Самые просматриваемые видео.',
    tag1:'Популярное', tag2:'В тренде', tag3:'Избранное',
    feat_lbl:'Возможности', feat_ti:'Что мы предлагаем', feat_de:'Все возможности Zentyso2.',
    f1_ti:'🎬 Качественное видео', f1_de:'Новые видео каждую неделю.',
    f2_ti:'👥 Сообщество',         f2_de:'Общайся с людьми, делись постами.',
    f3_ti:'📝 Блог',               f3_de:'Интересные статьи, технический контент.',
    f4_ti:'🔒 Членство',           f4_de:'Стань Pro/VIP для эксклюзивного контента.',
    ab_lbl:'Владелец канала', ab_ti:'О себе', ab_n:'Привет, я Эмир 👋',
    ab_de:'Я создатель канала Zentyso2. Качественный контент каждую неделю. Растём с 800+ подписчиками!',
    nl_ti:'📬 Получай уведомления о видео', nl_de:'Введи email, узнавай первым!', nl_btn:'Подписаться',
    cm_lbl:'Сообщество', cm_ti:'Блог и Сообщество',
    ff_all:'🌍 Все', ff_flw:'👥 Подписки',
    lp_ti:'🔐 Присоединись', lp_de:'Войди чтобы делиться постами.',
    lp_li:'Войти', lp_re:'Регистрация',
    wp_ph:'Что думаешь?', wp_ti_ph:'Заголовок', wp_tg_ph:'#тег', wp_send:'📤 Опубликовать',
    tm_ti:'🏆 Топ участников', tr_ti:'🔥 Топ теги', st_cm_ti:'📊 Сообщество',
    st_mb:'Участников', st_po:'Постов', st_co:'Комментариев',
    pay_lbl:'Членство', pay_ti:'Выберите план', pay_de:'Выберите подходящий план.',
    pln_pop:'⭐ Самый популярный',
    fn:'Бесплатно',    fd:'Идеально для начала.',
    pn:'Pro участник', pd:'Самый популярный выбор.',
    vn:'VIP участник', vd:'Полный доступ, всё включено.',
    f_vid:'Доступ ко всем видео', f_cm:'Доступ к сообществу', f_bl:'Блог', f_ex:'Эксклюзивный контент', f_dc:'VIP Discord', f_dr:'Прямая связь',
    b_fr:'Начать', b_pr:'Выбрать Pro', b_vp:'Выбрать VIP',
    pay_title:'Завершить оплату', pay_sub:'Защищено 256-bit SSL.',
    pay_free_ok:'Вы присоединились бесплатно!', pay_free_sub:'Аккаунт активен.',
    processing:'Обработка…',
    pf_n:'Имя Фамилия', pf_e:'Email', pf_c:'Номер карты', pf_exp:'Срок действия', pf_cv:'CVV',
    pm_sec:'256-bit SSL шифрование.', pm_btn:'💳 Завершить оплату',
    pm_ok_ti:'Оплата прошла!', pm_ok_de:'Аккаунт активен. Добро пожаловать!',
    fq_lbl:'Вопросы', fq_ti:'Часто задаваемые вопросы',
    q1:'Когда выходят новые видео?',        a1:'Минимум 1 видео каждую неделю.',
    q2:'Как опубликовать пост?',            a2:'Зарегистрируйся, войди, публикуй.',
    q3:'Как связаться для сотрудничества?', a3:'Напиши в личку в соцсетях.',
    q4:'Что даёт Pro/VIP?',                 a4:'Pro — эксклюзив. VIP — Discord + прямая связь.',
    ft_n:'Навигация', ft_s:'Социальные сети',
    ft_de:'Официальный канал Эмира. 800+ подписчиков. Новый контент каждую неделю.',
    ft_cp:'© 2025 Zentyso2 · Эмир. Все права защищены.',
    ck_t:'🍪 Используем cookie для улучшения сайта.',
    ck_ok:'Принять', ck_no:'Отклонить',
  }
};

let _L = localStorage.getItem('z2_lang') || 'az';
function _t(k) { return (LANGS[_L]||LANGS.az)[k] || (LANGS.az[k]||k); }

/* element ID → translation key */
const TM = {
  'nv-vid':'nv_vid','nv-ab':'nv_ab','nv-cm':'nv_cm','nv-mb':'nv_mb','nv-fq':'nv_fq',
  'mnv-vid':'nv_vid','mnv-ab':'nv_ab','mnv-cm':'nv_cm','mnv-mb':'nv_mb','mnv-fq':'nv_fq',
  'h-badge':'h_badge','h-gr':'h_gr','h-sfx':'h_sfx','h-desc':'h_desc',
  'btn-sub':'btn_sub','btn-w':'btn_w',
  'st-sub':'st_sub','st-vid':'st_vid','st-freq':'st_freq','st-cnt':'st_cnt',
  'vid-lbl':'vid_lbl','vid-ti':'vid_ti','vid-de':'vid_de',
  'tag1':'tag1','tag2':'tag2','tag3':'tag3',
  'feat-lbl':'feat_lbl','feat-ti':'feat_ti','feat-de':'feat_de',
  'f1-ti':'f1_ti','f1-de':'f1_de','f2-ti':'f2_ti','f2-de':'f2_de',
  'f3-ti':'f3_ti','f3-de':'f3_de','f4-ti':'f4_ti','f4-de':'f4_de',
  'ab-lbl':'ab_lbl','ab-ti':'ab_ti','ab-n':'ab_n','ab-de':'ab_de',
  'nl-ti':'nl_ti','nl-de':'nl_de','nl-btn':'nl_btn',
  'cm-lbl':'cm_lbl','cm-ti':'cm_ti',
  'ff-all':'ff_all','ff-flw':'ff_flw',
  'lp-ti':'lp_ti','lp-de':'lp_de','lp-li':'lp_li','lp-re':'lp_re',
  'wp-send':'wp_send','tm-ti':'tm_ti','tr-ti':'tr_ti','st-cm-ti':'st_cm_ti',
  'st-mb':'st_mb','st-po':'st_po','st-co':'st_co',
  'pay-lbl':'pay_lbl','pay-ti':'pay_ti','pay-de':'pay_de',
  'pln-pop':'pln_pop',
  'fn':'fn','fd':'fd','pn':'pn','pd-t':'pd','vn':'vn','vd':'vd',
  'b-fr':'b_fr','b-pr':'b_pr','b-vp':'b_vp',
  'pm-ok-ti':'pm_ok_ti','pm-ok-de':'pm_ok_de','pm-sbtn':'pm_btn',
  'pf-n-l':'pf_n','pf-e-l':'pf_e','pf-c-l':'pf_c','pf-exp-l':'pf_exp','pf-cv-l':'pf_cv',
  'pm-sec-t':'pm_sec',
  'fq-lbl':'fq_lbl','fq-ti':'fq_ti',
  'q1':'q1','a1':'a1','q2':'q2','a2':'a2','q3':'q3','a3':'a3','q4':'q4','a4':'a4',
  'ft-n':'ft_n','ft-s':'ft_s','ft-de':'ft_de','ft-cp':'ft_cp',
  'ft-vid':'nv_vid','ft-ab':'nv_ab','ft-cm':'nv_cm','ft-mb':'nv_mb',
  'ck-t':'ck_t','ck-ok':'ck_ok','ck-no':'ck_no',
};
const PH = { 'wp-body':'wp_ph','wp-title':'wp_ti_ph','wp-tags':'wp_tg_ph','nl-inp':'nl_btn' };

function setLang(l) {
  if(!LANGS[l]) return;
  _L = l;
  localStorage.setItem('z2_lang', l);
  document.documentElement.lang = l;
  Object.entries(TM).forEach(([id,k]) => { const el=document.getElementById(id); if(el) el.textContent=_t(k); });
  Object.entries(PH).forEach(([id,k]) => { const el=document.getElementById(id); if(el) el.placeholder=_t(k); });
  document.querySelectorAll('.lb').forEach(b => b.classList.toggle('on', b.dataset.lang===l));
  if(typeof renderCm === 'function') renderCm();
}

/* ══════════════════════════════════
   PAYMENT
══════════════════════════════════ */
const PLANS = {
  free: { name:'🆓 Pulsuz Plan',  price:'0 ₼/ay' },
  pro:  { name:'⭐ Pro Üzv',      price:'4.99 ₼/ay' },
  vip:  { name:'👑 VIP Üzv',      price:'9.99 ₼/ay' },
};
function openPay(k) {
  closeMob();
  const pl = PLANS[k]; if(!pl) return;
  if(k==='free') {
    _showPayOk();
    document.querySelector('.pm-ti').textContent = '🎉 ' + _t('pay_free_ok');
    document.querySelector('.pm-su').textContent = _t('pay_free_sub');
    document.getElementById('pm-ov').classList.add('open');
    document.body.style.overflow = 'hidden'; return;
  }
  document.getElementById('pm-sn').textContent = pl.name;
  document.getElementById('pm-sp').textContent = pl.price;
  document.querySelector('.pm-ti').textContent  = _t('pay_title');
  document.querySelector('.pm-su').textContent  = _t('pay_sub');
  document.getElementById('pm-fm').style.display = 'flex';
  document.getElementById('pm-ok').style.display = 'none';
  document.getElementById('pm-fm-el').reset();
  document.getElementById('pm-ov').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePay() { document.getElementById('pm-ov').classList.remove('open'); document.body.style.overflow=''; }
function _showPayOk() {
  document.getElementById('pm-fm').style.display = 'none';
  document.getElementById('pm-ok').style.display = 'block';
  document.querySelector('.pm-ti').textContent = '';
  document.querySelector('.pm-su').textContent = '';
}
function submitPay(e) {
  e.preventDefault();
  const ins = document.getElementById('pm-fm-el').querySelectorAll('input[required]');
  let ok = true;
  ins.forEach(i => { i.style.borderColor=''; if(!i.value.trim()){i.style.borderColor='#e53935';ok=false;} });
  const cn = document.getElementById('pm-cn');
  if(cn && cn.value.replace(/\s/g,'').length<16) { cn.style.borderColor='#e53935'; ok=false; }
  if(!ok) return;
  const btn = document.getElementById('pm-sbtn');
  btn.textContent = '⏳ ' + _t('processing');
  btn.disabled    = true;
  setTimeout(_showPayOk, 1800);
}
function fmtCard(i){ let v=i.value.replace(/\D/g,'').substring(0,16); i.value=v.replace(/(.{4})/g,'$1 ').trim(); }
function fmtExp(i) { let v=i.value.replace(/\D/g,'').substring(0,4); if(v.length>=3)v=v.substring(0,2)+'/'+v.substring(2); i.value=v; }
function fmtCvv(i) { i.value=i.value.replace(/\D/g,'').substring(0,3); }

/* ══════════════════════════════════
   AUTH
══════════════════════════════════ */
let _av = '😎';
function openAuth(mode='login') {
  document.getElementById('auth-ov').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(mode);
  clearErrs();
  document.getElementById('auth-al').className = 'auth-al';
}
function closeAuth() { document.getElementById('auth-ov').classList.remove('open'); document.body.style.overflow=''; }
function switchTab(m) {
  document.querySelectorAll('.at').forEach(t => t.classList.toggle('on', t.dataset.tab===m));
  const lf=document.getElementById('lf'), rf=document.getElementById('rf');
  if(lf) lf.style.display = m==='login' ? 'flex' : 'none';
  if(rf) rf.style.display = m==='register' ? 'flex' : 'none';
  clearErrs();
  document.getElementById('auth-al').className = 'auth-al';
}
function pickAv(el,e) { _av=e; document.querySelectorAll('.av-o').forEach(a=>a.classList.remove('on')); el.classList.add('on'); }
function pwStr(v) {
  let s=0;
  if(v.length>=6)s++; if(v.length>=10)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
  const f=document.getElementById('pw-f'), lb=document.getElementById('pw-lb');
  const m=[{w:'0%',c:'transparent',l:''},{w:'25%',c:'#e53935',l:'Zəif'},{w:'50%',c:'#f9a825',l:'Orta'},{w:'75%',c:'#1e88e5',l:'Yaxşı'},{w:'100%',c:'#43a047',l:'Güclü ✓'}][Math.min(s,4)];
  if(f){f.style.width=m.w;f.style.background=m.c;} if(lb) lb.textContent=m.l;
}
function togglePw(id,btn) {
  const i=document.getElementById(id); if(!i) return;
  const show=i.type==='password'; i.type=show?'text':'password';
  btn.innerHTML=show
    ?`<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/></svg>`
    :`<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
}
function showE(id,m) { const e=document.getElementById(id); if(e){e.textContent=m;e.classList.add('on');} }
function clearErrs()  { document.querySelectorAll('.a-err').forEach(e=>e.classList.remove('on')); }
function setAl(type,m){ const el=document.getElementById('auth-al'); if(!el)return; el.className=`auth-al ${type}`; el.textContent=m; }

function doLogin(e) {
  e.preventDefault(); clearErrs(); document.getElementById('auth-al').className='auth-al';
  const em=document.getElementById('l-em')?.value.trim()||'';
  const pw=document.getElementById('l-pw')?.value||'';
  let ok=true;
  if(!em.includes('@')) { showE('l-em-e','Düzgün email daxil et'); ok=false; }
  if(!pw)               { showE('l-pw-e','Şifrə boş ola bilməz'); ok=false; }
  if(!ok) return;
  const u=DB.byEmail(em);
  if(!u)             { setAl('er','❌ Bu email ilə hesab tapılmadı.'); return; }
  if(u.password!==pw){ setAl('er','❌ Şifrə yanlışdır.'); return; }
  DB.setSess(u); closeAuth(); onLoginOk(u);
  toast('👋 Xoş gəldin, ' + u.displayName + '!', 'ok');
}

function doReg(e) {
  e.preventDefault(); clearErrs(); document.getElementById('auth-al').className='auth-al';
  const dn  = document.getElementById('r-dn')?.value.trim()||'';
  const un  = document.getElementById('r-un')?.value.trim().replace(/\s/g,'')||'';
  const em  = document.getElementById('r-em')?.value.trim()||'';
  const pw  = document.getElementById('r-pw')?.value||'';
  const pw2 = document.getElementById('r-pw2')?.value||'';
  let ok=true;
  if(!dn)                    { showE('r-dn-e','Ad boş ola bilməz'); ok=false; }
  if(un.length<3)            { showE('r-un-e','Ən azı 3 simvol'); ok=false; }
  else if(!/^[a-zA-Z0-9_]+$/.test(un)) { showE('r-un-e','Yalnız hərf, rəqəm, _'); ok=false; }
  if(!em.includes('@'))      { showE('r-em-e','Düzgün email daxil et'); ok=false; }
  if(pw.length<6)            { showE('r-pw-e','Ən azı 6 simvol'); ok=false; }
  if(pw!==pw2)               { showE('r-pw2-e','Şifrələr uyğun gəlmir'); ok=false; }
  if(!ok) return;
  if(DB.byEmail(em))  { setAl('er','❌ Bu email artıq qeydiyyatdadır.'); return; }
  if(DB.byUn(un))     { setAl('er','❌ Bu istifadəçi adı artıq var.'); return; }
  const nu=DB.create({displayName:dn,username:un,email:em,password:pw,avatar:_av});
  DB.setSess(nu); closeAuth(); onLoginOk(nu);
  toast('🎉 Qeydiyyat uğurlu! Xoş gəldin!', 'ok');
}

function doLogout() { DB.clrSess(); onLogoutOk(); toast('👋 Çıxış edildi.', ''); }
function forgotPw() {
  const em=document.getElementById('l-em')?.value.trim()||'';
  if(!em) { showE('l-em-e','Əvvəlcə email daxil et'); return; }
  if(!DB.byEmail(em)) { setAl('er','❌ Bu email tapılmadı.'); return; }
  setAl('ok','✅ Şifrə sıfırlama linki göndərildi (demo).');
}

/* ══════════════════════════════════
   NAV USER
══════════════════════════════════ */
function onLoginOk(u) {
  _renderNavU(u);
  const wp=document.getElementById('wp-bx'), lp=document.getElementById('lp-bx');
  if(wp) wp.classList.add('vis');
  if(lp) lp.style.display='none';
  const wa=document.getElementById('wp-av'); if(wa) wa.textContent=u.avatar;
  renderCm(); _updStats();
}
function onLogoutOk() {
  const ua=document.getElementById('nua');
  if(ua) ua.innerHTML=`<button class="bp" style="padding:6px 11px;font-size:.72rem" onclick="openAuth('login')">Giriş</button><button class="bs" style="padding:6px 11px;font-size:.72rem" onclick="openAuth('register')">Qeydiyyat</button>`;
  const wp=document.getElementById('wp-bx'), lp=document.getElementById('lp-bx');
  if(wp) wp.classList.remove('vis');
  if(lp) lp.style.display='block';
  renderCm();
}
function _renderNavU(u) {
  const ua=document.getElementById('nua'); if(!ua) return;
  ua.innerHTML=`<div class="nav-user" id="nav-uw" onclick="toggleUd()">
    <div class="nav-av">${u.avatar}</div>
    <span class="nav-un">${u.displayName}</span>
    <div class="udrop" id="udrop">
      <div class="ud-hd"><div class="ud-n">${u.displayName}</div><div class="ud-e">@${u.username}</div></div>
      <button class="ud-i" onclick="openPf(${u.id});event.stopPropagation()"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>Profilim</button>
      <button class="ud-i" onclick="document.getElementById('cm-sec').scrollIntoView({behavior:'smooth'});event.stopPropagation()"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>İcma</button>
      <button class="ud-i dng" onclick="doLogout();event.stopPropagation()"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>Çıxış</button>
    </div></div>`;
}

/* nav user dropdown styles (inline because community.css merged) */
const _udStyle = document.createElement('style');
_udStyle.textContent=`.nav-user{display:flex;align-items:center;gap:5px;cursor:pointer;position:relative;flex-shrink:0}.nav-av{width:30px;height:30px;border-radius:50%;border:2px solid var(--ac);background:var(--acd);display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:700;color:var(--ac);flex-shrink:0;transition:box-shadow var(--tr)}.nav-av:hover{box-shadow:0 0 0 3px var(--acg)}.nav-un{font-size:.76rem;font-weight:600;color:var(--txm);max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:none}.udrop{display:none;position:absolute;top:calc(100%+7px);right:0;min-width:180px;background:var(--bg2);border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden;z-index:500;box-shadow:0 5px 20px var(--sh);animation:sdwn .2s ease}.nav-user:hover .udrop,.nav-user.open .udrop{display:block}.ud-hd{padding:11px 13px;border-bottom:1px solid var(--bd)}.ud-n{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ud-e{font-size:.7rem;color:var(--txd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ud-i{display:flex;align-items:center;gap:8px;padding:9px 13px;font-size:.82rem;color:var(--txm);cursor:pointer;transition:background var(--tr),color var(--tr);border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}.ud-i:hover{background:var(--acd);color:var(--ac)}.ud-i.dng:hover{background:rgba(229,57,53,.11);color:#e53935}@media(min-width:480px){.nav-un{display:block}}`;
document.head.appendChild(_udStyle);

function toggleUd() { document.getElementById('nav-uw')?.classList.toggle('open'); }
document.addEventListener('click', e => { const w=document.getElementById('nav-uw'); if(w&&!w.contains(e.target)) w.classList.remove('open'); });

/* ══════════════════════════════════
   PROFILE MODAL
══════════════════════════════════ */
let _puid = null;
function openPf(uid) {
  _puid = uid;
  const u=DB.byId(uid); if(!u) return;
  const me=DB.me(), self=me&&me.id===uid, flw=me&&(me.following||[]).includes(uid);
  document.getElementById('pf-av-big').textContent   = u.avatar;
  document.getElementById('pf-dn').textContent        = u.displayName;
  document.getElementById('pf-hnd').textContent       = '@'+u.username;
  document.getElementById('pf-bio').textContent       = u.bio||'';
  document.getElementById('pf-fc').textContent        = (u.followers||[]).length;
  document.getElementById('pf-fg').textContent        = (u.following||[]).length;
  document.getElementById('pf-pc').textContent        = PDB.all().filter(p=>p.authorId===uid).length;
  const fb=document.getElementById('pf-flw-btn');
  if(self)       { fb.textContent='✏️ Düzəlt'; fb.className='pf-flw-btn'; fb.onclick=()=>openEp(); }
  else if(!me)   { fb.textContent='➕ İzlə'; fb.className='pf-flw-btn'; fb.onclick=()=>{closePf();openAuth('login');}; }
  else           { fb.textContent=flw?'✓ İzlənir':'➕ İzlə'; fb.className=`pf-flw-btn${flw?' flw':''}`; fb.onclick=()=>toggleFlw(uid); }
  swPfTab('posts');
  _renderPfPosts(uid); _renderFlList(uid,'followers'); _renderFlList(uid,'following');
  document.getElementById('pf-ov').classList.add('open');
  document.body.style.overflow='hidden';
}
function closePf() { document.getElementById('pf-ov').classList.remove('open'); document.body.style.overflow=''; }
function swPfTab(t) {
  document.querySelectorAll('.ptab').forEach(x=>x.classList.toggle('on',x.dataset.tab===t));
  document.querySelectorAll('.pf-pn').forEach(p=>p.classList.toggle('on',p.id==='pf-'+t));
}
function _renderPfPosts(uid) {
  const ps=PDB.all().filter(p=>p.authorId===uid);
  const c=document.getElementById('pf-posts'); if(!c) return;
  c.innerHTML=!ps.length?'<div class="empty-s"><div class="ei">📝</div><p>Yazı yoxdur.</p></div>'
    :`<div class="pf-posts">${ps.map(p=>`<div class="pp-i"><h4>${p.title||p.body.slice(0,60)}</h4><div class="pp-m">❤️ ${p.likes.length} · 💬 ${p.comments.length} · ${ago(p.createdAt)}</div></div>`).join('')}</div>`;
}
function _renderFlList(uid, type) {
  const u=DB.byId(uid); const ids=(type==='followers'?u.followers:u.following)||[];
  const me=DB.me(); const el=document.getElementById('pf-'+type); if(!el) return;
  if(!ids.length){el.innerHTML=`<div class="empty-s"><div class="ei">👥</div><p>${type==='followers'?'İzləyici yoxdur.':'Heç kimi izlənmir.'}</p></div>`;return;}
  const us=DB.users().filter(x=>ids.includes(x.id));
  el.innerHTML=`<div class="fl-l">${us.map(x=>{const isF=me&&(me.following||[]).includes(x.id),self=me&&me.id===x.id;
    const b=self?'':`<button class="fl-btn ${isF?'flw':''}" id="flb-${x.id}" onclick="event.stopPropagation();toggleFlw(${x.id})">${isF?'✓':'+ İzlə'}</button>`;
    return `<div class="fl-i" onclick="closePf();setTimeout(()=>openPf(${x.id}),200)"><div class="fl-av">${x.avatar}</div><div class="fl-nw"><div class="fl-n">${x.displayName}</div><div class="fl-h">@${x.username}</div></div>${b}</div>`;}).join('')}</div>`;
}
function openEp() { const me=DB.me();if(!me)return; document.getElementById('ep-dn').value=me.displayName||''; document.getElementById('ep-bio').value=me.bio||''; document.getElementById('ep-ov').classList.add('open'); }
function closeEp() { document.getElementById('ep-ov').classList.remove('open'); }
function saveEp() {
  const me=DB.me();if(!me)return;
  const dn=document.getElementById('ep-dn')?.value.trim(), bio=document.getElementById('ep-bio')?.value.trim();
  if(!dn) return;
  DB.update(me.id,{displayName:dn,bio});
  closeEp(); openPf(me.id); _renderNavU(DB.me()); toast('✅ Profil yeniləndi!','ok');
}

/* ══════════════════════════════════
   FOLLOW
══════════════════════════════════ */
function toggleFlw(tid) {
  const me=DB.me(); if(!me){openAuth('login');return;} if(me.id===tid)return;
  const us=DB.users(), md=us.find(u=>u.id===me.id), tg=us.find(u=>u.id===tid);
  const isF=(md.following||[]).includes(tid);
  if(isF){ md.following=(md.following||[]).filter(i=>i!==tid); tg.followers=(tg.followers||[]).filter(i=>i!==me.id); }
  else   { (md.following=md.following||[]).push(tid); (tg.followers=tg.followers||[]).push(me.id); }
  DB.save(us); const nf=!isF;
  toast(nf?`➕ ${tg.displayName} izlənir`:`➖ izlənmir`, nf?'ok':'');
  if(_puid===tid){ const pb=document.getElementById('pf-flw-btn'); if(pb){pb.textContent=nf?'✓ İzlənir':'➕ İzlə';pb.className=`pf-flw-btn${nf?' flw':''}`;} const fc=document.getElementById('pf-fc');if(fc)fc.textContent=(tg.followers||[]).length; }
  const ib=document.getElementById(`flb-${tid}`); if(ib){ib.textContent=nf?'✓':'+ İzlə';ib.classList.toggle('flw',nf);}
  document.querySelectorAll(`[data-fid="${tid}"]`).forEach(b=>{b.textContent=nf?'✓':'+ İzlə';b.classList.toggle('flw',nf);});
  renderTopM();
}

/* ══════════════════════════════════
   COMMUNITY
══════════════════════════════════ */
let _ff = 'all';
function renderCm() { renderFeed(); renderTopM(); renderTrTags(); _updStats(); }

function renderFeed() {
  const me=DB.me(); let ps=PDB.all();
  if(_ff==='following'&&me) ps=ps.filter(p=>(me.following||[]).includes(p.authorId)||p.authorId===me.id);
  const f=document.getElementById('post-feed'); if(!f) return;
  f.innerHTML=!ps.length?'<div class="empty-s"><div class="ei">📭</div><p>Hələ yazı yoxdur.</p></div>':ps.map(p=>_buildPc(p,me)).join('');
}

function _buildPc(p, me) {
  const a=DB.byId(p.authorId); if(!a) return '';
  const lkd=me&&p.likes.includes(me.id), mine=me&&me.id===p.authorId, long=p.body.length>260;
  return `<div class="pc" id="pc-${p.id}">
    <div class="pc-hd">
      <div class="pc-av" onclick="openPf(${a.id})">${a.avatar}</div>
      <div class="pc-mw"><div><span class="pc-au" onclick="openPf(${a.id})">${a.displayName}</span>${a.badge?`<span class="pc-bg">${a.badge}</span>`:''}</div><div class="pc-time">@${a.username} · ${ago(p.createdAt)}</div></div>
      ${mine?`<button class="pa dng" onclick="delPost(${p.id})" style="margin-left:auto"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>`:''}
    </div>
    ${p.title?`<div class="pc-ttl">${p.title}</div>`:''}
    <div class="pc-body${long?' col':''}" id="pb-${p.id}">${p.body.replace(/\n/g,'<br>')}</div>
    ${long?`<span class="pc-rm" onclick="expPost(${p.id},this)">Daha çox ↓</span>`:''}
    ${p.tags.length?`<div class="pc-tags">${p.tags.map(t=>`<span class="pc-tag">#${t}</span>`).join('')}</div>`:''}
    <div class="pc-acts">
      <button class="pa${lkd?' lkd':''}" id="lb-${p.id}" onclick="likeP(${p.id})">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span id="lc-${p.id}">${p.likes.length}</span>
      </button>
      <button class="pa" onclick="togCm(${p.id})">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        <span id="cc-${p.id}">${p.comments.length}</span>
      </button>
      <button class="pa" onclick="shareP(${p.id})">
        <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        Paylaş
      </button>
    </div>
    <div class="cm-sec-s" id="cms-${p.id}">
      <div class="cm-list" id="cml-${p.id}">${p.comments.map(_buildCm).join('')}</div>
      ${me?`<div class="cm-inp-r"><input type="text" placeholder="Şərh…" id="ci-${p.id}" onkeydown="if(event.key==='Enter')sendCm(${p.id})"/><button class="cm-send" onclick="sendCm(${p.id})">→</button></div>`
           :`<p style="font-size:.76rem;color:var(--txd);padding:5px 0">Şərh üçün <span style="color:var(--ac);cursor:pointer" onclick="openAuth('login')">giriş et</span>.</p>`}
    </div>
  </div>`;
}
function _buildCm(c) {
  const a=DB.byId(c.authorId); if(!a) return '';
  return `<div class="cm-i"><div class="cm-av">${a.avatar}</div><div class="cm-bd"><div class="cm-n">${a.displayName}</div><div class="cm-t">${c.text}</div><div class="cm-tm">${ago(c.createdAt)}</div></div></div>`;
}

function submitPost() {
  const me=DB.me(); if(!me){openAuth('login');return;}
  const ti=document.getElementById('wp-title')?.value.trim()||'';
  const bo=document.getElementById('wp-body')?.value.trim()||'';
  const tg=(document.getElementById('wp-tags')?.value||'').split(',').map(t=>t.trim().replace(/^#/,'')).filter(Boolean);
  if(!bo){toast('⚠️ Mətn boş ola bilməz','err');return;}
  PDB.create({authorId:me.id,title:ti,body:bo,tags:tg});
  ['wp-title','wp-body','wp-tags'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderFeed(); _updStats(); toast('✅ Paylaşıldı!','ok');
}
function likeP(pid)     { const me=DB.me();if(!me){openAuth('login');return;} const up=PDB.like(pid,me.id); const l=up.likes.includes(me.id); document.getElementById(`lb-${pid}`)?.classList.toggle('lkd',l); const lc=document.getElementById(`lc-${pid}`);if(lc)lc.textContent=up.likes.length; }
function togCm(pid)     { document.getElementById(`cms-${pid}`)?.classList.toggle('open'); }
function sendCm(pid)    { const me=DB.me();if(!me){openAuth('login');return;} const inp=document.getElementById(`ci-${pid}`); const t=inp?.value.trim()||''; if(!t)return; const up=PDB.comment(pid,{authorId:me.id,text:t,createdAt:Date.now()}); const l=document.getElementById(`cml-${pid}`);if(l)l.innerHTML=up.comments.map(_buildCm).join(''); const cc=document.getElementById(`cc-${pid}`);if(cc)cc.textContent=up.comments.length; if(inp)inp.value=''; _updStats(); }
function delPost(pid)   { const me=DB.me(); const p=PDB.all().find(x=>x.id===pid); if(!me||!p||p.authorId!==me.id)return; PDB.del(pid); document.getElementById(`pc-${pid}`)?.remove(); _updStats(); toast('🗑️ Silindi.',''); }
function expPost(id,btn){ const el=document.getElementById(`pb-${id}`); if(!el)return; const was=el.classList.contains('col'); el.classList.toggle('col',!was); btn.textContent=was?'Bağla ↑':'Daha çox ↓'; }
function shareP(id)     { navigator.clipboard?.writeText(window.location.href).then(()=>toast('🔗 Link kopyalandı!','ok')); }
function setFF(t)       { _ff=t; document.querySelectorAll('.ff').forEach(b=>b.classList.toggle('on',b.dataset.filter===t)); renderFeed(); }

function renderTopM() {
  const us=DB.users().sort((a,b)=>(b.followers||[]).length-(a.followers||[]).length).slice(0,5);
  const me=DB.me(); const el=document.getElementById('top-m'); if(!el) return;
  el.innerHTML=us.map((u,i)=>{const isF=me&&(me.following||[]).includes(u.id),self=me&&me.id===u.id;
    return `<div class="tm-i" onclick="openPf(${u.id})"><span class="tm-r">${i+1}</span><div class="tm-a">${u.avatar}</div><div class="fl-nw" style="flex:1;min-width:0"><div class="fl-n" style="font-size:.82rem">${u.displayName}</div><div class="fl-h">👥 ${(u.followers||[]).length}</div></div>${!self?`<button class="fl-btn ${isF?'flw':''}" data-fid="${u.id}" onclick="event.stopPropagation();toggleFlw(${u.id})">${isF?'✓':'+ İzlə'}</button>`:''}</div>`;}).join('');
}
function renderTrTags() {
  const c={}; PDB.all().forEach(p=>p.tags.forEach(t=>{c[t]=(c[t]||0)+1;}));
  const el=document.getElementById('tr-tags'); if(!el) return;
  el.innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t,n])=>`<span class="tr-t">#${t} <small style="opacity:.6">${n}</small></span>`).join('');
}
function _updStats() {
  const ps=PDB.all(), us=DB.users(), co=ps.reduce((s,p)=>s+p.comments.length,0);
  const mc=document.getElementById('st-mc'), pc=document.getElementById('st-pc'), cc=document.getElementById('st-cc');
  if(mc)mc.textContent=us.length; if(pc)pc.textContent=ps.length; if(cc)cc.textContent=co;
}

/* ══════════════════════════════════
   SCROLL ANIMATION
══════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      const s=e.target.parentElement.querySelectorAll('.fi');
      e.target.style.transitionDelay=(Array.from(s).indexOf(e.target)*70)+'ms';
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    }
  });
}, {threshold:.1});
document.querySelectorAll('.fi').forEach(el => obs.observe(el));

/* ══════════════════════════════════
   UTILS
══════════════════════════════════ */
function ago(ts) {
  const d=Date.now()-ts, m=Math.floor(d/60000);
  if(m<1)  return 'indi';
  if(m<60) return `${m} dəq`;
  const h=Math.floor(m/60);
  if(h<24) return `${h} saat`;
  const dy=Math.floor(h/24);
  if(dy<30)return `${dy} gün`;
  return new Date(ts).toLocaleDateString('az-AZ');
}

/* ══════════════════════════════════
   KEYBOARD
══════════════════════════════════ */
document.addEventListener('keydown', e => {
  if(e.key==='Escape') { closeSrch(); closePay(); closeMob(); closeAuth(); closePf(); closeEp(); }
});

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setLang(_L);
  const me=DB.me();
  if(me) { onLoginOk(me); }
  else   { document.getElementById('lp-bx')?.style && (document.getElementById('lp-bx').style.display='block'); renderCm(); }
});
