(function(){
var R={hello:['Hello. You found the quiet corner.','Hi. I was just rearranging some thoughts.','Hey. Good timing.','Hello again. Nothing extraordinary, yet.'],
mood:['Status: calm, with a slight chance of nostalgia.','Atmosphere: soft light, low volume.','Currently observing. Mostly content.','Signal steady. Mood unhurried.','Running at 72% curiosity.'],
secret:['Not every door has a handle. Some are just a pattern of clicks.','A clue: the logo is more patient than it looks. Count to seven.','Look low. Small things like to hide near the end of the page.','Try something old: up, up, down, down.'],
unk:["I don't have that in my vocabulary yet.","Interesting. That's outside my little world.","Perhaps try /help?","Not every question has an entry here."]};
function rm(list,none){if(!list.length)return none;var m=K.pick(list);return 'Picked <a href="#" data-a="view" data-id="'+m.id+'">'+K.esc(m.title)+'</a> from '+K.fmt(m.date)+'.'}
var C={
help:['Show all commands',()=>'Commands:<br>'+Object.keys(C).filter(k=>C[k][0]).map(k=>'<b>/'+k+'</b> '+C[k][0]).join('<br>')],
hello:['A greeting',()=>K.pick(R.hello)],
date:['Today\'s date',()=>new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})],
time:['Current time',()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:!K.d.set.h24})],
memories:['Total saved memories',()=>'There '+(K.d.mem.length==1?'is 1 memory':'are '+K.d.mem.length+' memories')+' in the archive.'],
random:['A random memory',()=>rm(K.d.mem,'The archive is empty. A blank page is also a start.')],
quote:['A short thought',()=>K.pick(K.thoughts)],
mood:['Atmospheric status',()=>K.pick(R.mood)],
secret:['A mysterious clue',()=>K.pick(R.secret)],
about:['What KLIE AI is',()=>'I am KLIE AI, a locally simulated assistant. I am not a real AI model: I use written responses and simple commands, entirely in your browser.'],
clear:['Clear this chat',()=>''],
surprise:['Something unexpected',()=>K.pick([()=>{K.burst();return 'Stars. Briefly.'},()=>{document.body.classList.add('tint');setTimeout(()=>document.body.classList.remove('tint'),6e3);return 'I adjusted the light. Subtle, right?'},()=>rm(K.d.mem,'No memories yet, so here is a silence instead.'),()=>'You pressed it. That is the whole trick. Or is it?'])()],
favorite:['A random favorite memory',()=>rm(K.d.mem.filter(m=>m.fav),'No favorites yet. Mark one inside a memory.')],
count:['Archive statistics',()=>{var d=K.d,c={};d.mem.forEach(m=>c[m.cat]=(c[m.cat]||0)+1);var t=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return 'Memories: '+d.mem.length+'<br>Favorites: '+d.mem.filter(m=>m.fav).length+'<br>With photos: '+d.mem.filter(m=>m.img).length+'<br>Moments: '+d.mom.length+'<br>Notes: '+d.notes.length+'<br>Collections: '+d.col.length+(t?'<br>Most common category: '+K.esc(t):'')}],
'404':[null,()=>{setTimeout(()=>K.unlock(['Error 404','Page not found. Except one, which was never listed.']),900);return '404: nothing here. Wait. Something answered.'}]};
var chat,now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function add(h,me){var d=document.createElement('div');d.className='msg'+(me?' me':'');d.innerHTML=me?K.esc(h):h;chat.appendChild(d);chat.scrollTop=1e9;return d}
function stamp(d){d.insertAdjacentHTML('beforeend','<small>'+now()+'</small>')}
function reply(h){var d=add('<span class="dots"><span></span><span></span><span></span></span>');setTimeout(()=>{d.innerHTML=h;stamp(d);chat.scrollTop=1e9},500+Math.random()*700)}
function clr(){chat.innerHTML=''}
function send(t){t=t.trim();if(!t)return;var u=add(t,1);stamp(u);var k=t.toLowerCase().split(/\s+/)[0].slice(1);
if(t[0]!='/'||!C[k])return reply(K.pick(R.unk));if(k=='clear')return clr();reply(C[k][1]())}
function chips(){var v=$('#ci').value.toLowerCase(),a=Object.keys(C).filter(k=>C[k][0]&&('/'+k).startsWith(v||'/')).slice(0,8);$('#chips').innerHTML=a.map(k=>'<button type="button" data-c="/'+k+'">/'+k+'</button>').join('')}
K.mods.push(()=>{chat=$('#chat');$('#ch').innerHTML=Object.keys(C).filter(k=>C[k][0]).map(k=>'<b>/'+k+'</b> '+C[k][0]).join('<br>');
$('#cf').onsubmit=e=>{e.preventDefault();send($('#ci').value);$('#ci').value='';chips()};$('#ci').oninput=chips;$('#cc').onclick=clr;
$('#chips').onclick=e=>{var b=e.target.closest('[data-c]');if(b){send(b.dataset.c);$('#ci').value='';chips()}};chips();
var g=add('KLIE AI online. I am a locally simulated assistant. Try /help.');stamp(g)});
K.act.unseen=()=>{location.hash='unseen'}})();
