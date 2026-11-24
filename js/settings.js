K.valid=o=>{var dt=/^\d{4}-\d{2}-\d{2}$/,ok=m=>m&&typeof m.id=='string'&&typeof m.title=='string'&&dt.test(m.date);
return !!o&&typeof o=='object'&&['mem','mom','col','notes'].every(k=>Array.isArray(o[k]))&&o.mem.every(ok)&&o.mom.every(ok)&&o.col.every(c=>typeof c=='string')&&o.notes.every(n=>n&&typeof n.id=='string'&&typeof n.t=='string')&&(!o.imgs||(typeof o.imgs=='object'&&Object.values(o.imgs).every(v=>typeof v=='string'&&v.indexOf('data:image/')==0)))};
Object.assign(K.act,{
enablecloud:()=>K.enableCloudEditing&&K.enableCloudEditing(),
publishcloud:()=>K.publishLocalArchive&&K.publishLocalArchive(),
export:async()=>{var o=JSON.parse(JSON.stringify(K.d));o.v=1;o.imgs={};for(var x of K.d.mem.concat(K.d.mom))if(x.img){var b=await K.getImg(x.id);if(b)o.imgs[x.id]=await new Promise(r=>{var f=new FileReader;f.onload=()=>r(f.result);f.readAsDataURL(b)})}
var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='project-klie-'+K.today()+'.json';a.click();K.toast('Archive exported')},
import:()=>$('#imp').click(),
wipe:async()=>{if(!await K.ask('Clear all memories, moments, notes and settings from this browser? Export a backup first. This cannot be undone.'))return;localStorage.removeItem('klie');await K.clearImgs();K.urls={};K.d=K.def();K.apply();K.save();K.refresh();K.toast('Local data cleared')}});
K.mods.push(()=>{var s=K.d.set;
$('#s-th').value=s.theme;$('#s-th').onchange=e=>{s.theme=e.target.value;K.save();K.apply()};
$('#s-cl').value=s.h24?'24':'12';$('#s-cl').onchange=e=>{s.h24=e.target.value=='24';K.save()};
$('#s-an').checked=s.anim;$('#s-an').onchange=e=>{s.anim=e.target.checked;K.save();K.apply();K.refresh()};
$('#s-sn').checked=s.snd;$('#s-sn').onchange=e=>{s.snd=e.target.checked;K.save()};
$('#imp').onchange=async e=>{var f=e.target.files[0];e.target.value='';if(!f)return;var o;
try{o=JSON.parse(await f.text())}catch(x){}
if(!K.valid(o))return K.toast('Invalid archive file. Nothing was changed.');
if(!await K.ask('Replace your current archive with this file ('+o.mem.length+' memories, '+o.mom.length+' moments, '+o.notes.length+' notes)?'))return;
var d=K.def(),im=o.imgs||{};d.mem=o.mem.map(m=>({id:m.id,title:String(m.title),date:m.date,desc:String(m.desc||''),cat:String(m.cat||'Other'),col:String(m.col||'Unsorted'),tags:Array.isArray(m.tags)?m.tags.map(String):[],fav:!!m.fav,img:!!im[m.id]}));
d.mom=o.mom.map(m=>({id:m.id,title:String(m.title),date:m.date,desc:String(m.desc||''),cat:String(m.cat||'Other'),img:!!im[m.id]}));
d.notes=o.notes.map(n=>({id:n.id,t:n.t,b:String(n.b||''),pin:!!n.pin,ts:+n.ts||Date.now()}));
d.col=o.col.filter((c,i,a)=>a.indexOf(c)==i);d.mem.forEach(m=>{if(!d.col.includes(m.col))d.col.push(m.col)});if(!d.col.includes('Unsorted'))d.col.push('Unsorted');
d.unseen=!!o.unseen;d.set=Object.assign(d.set,o.set&&typeof o.set=='object'?o.set:{});
await K.clearImgs();K.urls={};for(var id in im)await K.putImg(id,await (await fetch(im[id])).blob());
K.d=d;K.save();K.apply();K.refresh();K.toast('Archive restored')}});
