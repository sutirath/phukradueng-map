/* Service worker: ใช้ออฟไลน์ได้ */
var V='pk-2ff74c82';
var PRE=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "photos/langpae.jpg", "photos/lomsak.jpg", "photos/makduk.jpg", "photos/nanoi.jpg", "photos/nokaen.jpg", "photos/penphopmai.jpg", "photos/phonphop.jpg", "photos/thamyai.jpg", "photos/wangkwang.jpg", "photos/yiapmek.jpg"];
var FONT_CSS="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap";
self.addEventListener('install',function(e){
  e.waitUntil((async function(){
    var c=await caches.open(V);
    await c.addAll(PRE);
    try{ // ฟอนต์: ดึง CSS แล้วเก็บไฟล์ฟอนต์ ถ้าล้มเหลวจะใช้ฟอนต์ระบบแทน
      var r=await fetch(FONT_CSS,{mode:'cors'});
      if(r.ok){
        var css=await r.clone().text();
        await c.put(FONT_CSS,r);
        var urls=Array.from(new Set((css.match(/https:[^)'"\s]+/g)||[])));
        await Promise.all(urls.map(function(u){return fetch(u,{mode:'cors'}).then(function(x){if(x.ok)return c.put(u,x)}).catch(function(){})}));
      }
    }catch(err){}
  })());
  self.skipWaiting();
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('pk-')===0&&k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url),same=u.origin===location.origin,font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!same&&!font)return;
  var work=(async function(){
    var c=await caches.open(V);
    var hit=await c.match(r,{ignoreSearch:same,ignoreVary:true});
    if(!hit&&r.mode==='navigate')hit=await c.match('index.html');
    var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(function(){return null});
    return {hit:hit,net:net};
  })();
  e.waitUntil(work.then(function(w){return w.net}));
  e.respondWith(work.then(async function(w){return w.hit||(await w.net)||Response.error()}));
});
