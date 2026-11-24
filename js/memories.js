K.cats=['Moment','Place','Conversation','Object','Other'];
K.opts=(el,first,list)=>{var v=el.value;el.innerHTML='<option value="">'+first+'</option>'+list.map(x=>'<option>'+K.esc(x)+'</option>').join('');el.value=list.includes(v)?v:''};
K.memRender=()=>{K.opts($('#mc'),'All categories',K.cats);K.opts($('#ml'),'All collections',K.d.col);
var q=$('#mq').value.toLowerCase(),c=$('#mc').value,l=$('#ml').value,f=$('#mf').checked;
var a=K.d.mem.filter(m=>(!c||m.cat==c)&&(!l||m.col==l)&&(!f||m.fav)&&(!q||(m.title+' '+m.desc+' '+m.tags.join(' ')).toLowerCase().includes(q))).sort((x,y)=>y.date.localeCompare(x.date));
$('#mg').innerHTML=a.length?a.map(K.card).join(''):(K.d.mem.length?K.empty('Nothing matches those filters.'):K.empty('No memories yet. Add a photo, a date and a few words.','Add memory','addmem'))};
K.rend.push(K.memRender);
K.memEdit=id=>{var m=K.d.mem.find(x=>x.id==id);
K.form(m?'Edit memory':'New memory',[{n:'title',l:'Title',r:1},{n:'date',l:'Date',t:'date',r:1},{n:'desc',l:'Description',t:'area'},{n:'cat',l:'Category',t:'sel',o:()=>K.cats},{n:'col',l:'Collection',t:'sel',o:()=>K.d.col},{n:'tags',l:'Tags (comma separated)'},{n:'img',l:'Photo',t:'file'}],
m?Object.assign({},m,{tags:m.tags.join(', ')}):{date:K.today(),col:'Unsorted'},async o=>{
var n=m||{id:K.uid(),fav:false,img:false};Object.assign(n,{title:o.title,date:o.date,desc:o.desc,cat:o.cat,col:o.col,tags:o.tags.split(',').map(s=>s.trim()).filter(Boolean)});
if(o.img&&o.img.size){await K.putImg(n.id,o.img);delete K.urls[n.id];n.img=true}
if(!m)K.d.mem.push(n);K.save();K.refresh();K.toast('Saved')})};
K.memView=id=>{var m=K.d.mem.find(x=>x.id==id);if(!m)return;
K.open((m.img?'<div class="ph big" data-img="'+m.id+'" data-lb="'+m.id+'"></div>':'')+'<small>'+K.fmt(m.date)+'</small> <small>'+K.esc(m.cat)+'</small><h3>'+K.esc(m.title)+'</h3><p>'+K.esc(m.desc)+'</p><div class="tags">'+m.tags.map(t=>'<span>'+K.esc(t)+'</span>').join('')+'</div><small>Collection: '+K.esc(m.col)+'</small><div class="row"><button class="ghost" data-a="favmem" data-id="'+m.id+'">'+(m.fav?'Remove favorite':'Favorite')+'</button><button class="ghost" data-a="editmem" data-id="'+m.id+'">Edit</button><button class="ghost" data-a="delmem" data-id="'+m.id+'">Delete</button><button class="btn" data-x>Close</button></div>');
K.hyd($('#dlg'))};
Object.assign(K.act,{addmem:()=>K.memEdit(),editmem:id=>K.memEdit(id),delmem:id=>K.del('mem',id),view:id=>K.memView(id),favmem:id=>{var m=K.d.mem.find(x=>x.id==id);m.fav=!m.fav;K.save();K.refresh();K.memView(id)}});
K.mods.push(()=>{['mq','mc','ml','mf'].forEach(i=>$('#'+i).oninput=K.memRender);
document.addEventListener('click',async e=>{var l=e.target.closest('[data-lb]');if(l){var u=await K.url(l.dataset.lb);if(u)K.open('<img class="lb" src="'+u+'" alt="">')}})});
