K.momRender=()=>{var a=K.d.mom.slice().sort((x,y)=>y.date.localeCompare(x.date)),ed=K.canEdit?K.canEdit():true;
$('#tl').innerHTML=a.length?a.map(m=>'<li class="tl"><small>'+K.fmt(m.date)+'</small> <small>'+K.esc(m.cat)+'</small><h4>'+K.esc(m.title)+'</h4><p>'+K.esc(m.desc)+'</p>'+(m.img?'<div class="ph" data-img="'+m.id+'"></div>':'')+(ed?'<div class="row"><button class="ghost" data-a="editmom" data-id="'+m.id+'">Edit</button><button class="ghost" data-a="delmom" data-id="'+m.id+'">Delete</button></div>':'')+'</li>').join(''):K.empty('No moments yet. Add a date that mattered.','Add moment','addmom');
var els=$$('.tl'),show=!K.d.set.anim||!('IntersectionObserver' in window);
if(show)return els.forEach(e=>e.classList.add('in'));
var io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});els.forEach(e=>io.observe(e))};
K.rend.push(K.momRender);
Object.assign(K.act,{addmom:()=>K.act.editmom(),editmom:id=>{var m=K.d.mom.find(x=>x.id==id);
K.form(m?'Edit moment':'New moment',[{n:'date',l:'Date',t:'date',r:1},{n:'title',l:'Title',r:1},{n:'desc',l:'Description',t:'area'},{n:'cat',l:'Category',t:'sel',o:()=>K.cats},{n:'img',l:'Image (optional)',t:'file'}],m||{date:K.today()},async o=>{
var n=m||{id:K.uid(),img:false};Object.assign(n,{date:o.date,title:o.title,desc:o.desc,cat:o.cat});
if(o.img&&o.img.size){await K.putImg(n.id,o.img);delete K.urls[n.id];n.img=true}
if(!m)K.d.mom.push(n);K.save();K.refresh();K.toast('Saved')})},delmom:id=>K.del('mom',id)});
