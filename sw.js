'use strict';
const VERSION='1.0.0';
const PREFIX=`junior-strong-${encodeURIComponent(self.registration.scope)}-`;
const CACHE=PREFIX+VERSION;
const ASSETS=['./','./index.html','./styles.css','./app.js','./program.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./hero.svg','./icon.svg','./apple-touch-icon.png','./INSTALL.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 const scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const filename=url.pathname.slice(scope.pathname.length);
 if(filename==='program.json'){
   event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok){const body=await response.clone().json();if(body?.schemaVersion===1&&Array.isArray(body.days))await cache.put(new URL('./program.json',scope).href,response.clone());return response;}}catch{}const saved=await cache.match(new URL('./program.json',scope).href);return saved||new Response('{}',{status:503,headers:{'Content-Type':'application/json'}});})());return;
 }
 const isAsset=ASSETS.some(asset=>new URL(asset,scope).pathname===url.pathname);
 if(!isAsset&&event.request.mode!=='navigate')return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}catch{const saved=await cache.match(event.request,{ignoreSearch:true});if(saved)return saved;if(event.request.mode==='navigate')return (await cache.match(new URL('./index.html',scope).href))||Response.error();return Response.error();}})());
});
