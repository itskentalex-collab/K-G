K.inCol=(m,c)=>m.col==c||(c=='Favorites'&&m.fav);
K.colRender=()=>{var d=K.d;if(!d.col.includes(K.sel))K.sel=d.col[0];
$('#ct').innerHTML=d.col.map((c,i)=>'<button class="tile'+(c==K.sel?' on':'')+'" data-a="selcol" data-id="'+i+'">'+K.esc(c)+'<small>'+d.mem.filter(m=>K.inCol(m,c)).length+' memories</small></button>').join('');
var l=d.mem.filter(m=>K.inCol(m,K.sel));
$('#cd').innerHTML='<div class="ph-h"><h3>'+K.esc(K.sel)+'</h3><div class="row" style="margin:0"><button class="ghost" data-a="rencol">Rename</button><button class="ghost" data-a="delcol">Delete</button></div></div><div class="grid">'+(l.length?l.map(K.card).join(''):K.empty('Nothing in this collection. Assign it from a memory\'s Edit form.'))+'</div>'};
K.rend.push(K.colRender);
Object.assign(K.act,{selcol:i=>{K.sel=K.d.col[i];K.colRender();K.hyd(document)},
addcol:()=>K.form('New collection',[{n:'name',l:'Name',r:1}],{},async o=>{var n=o.name.trim();if(!n||K.d.col.includes(n))return K.toast('That name is empty or already used.');K.d.col.push(n);K.sel=n;K.save();K.refresh()}),
rencol:()=>K.form('Rename collection',[{n:'name',l:'Name',r:1}],{name:K.sel},async o=>{var n=o.name.trim(),old=K.sel;if(!n||(n!=old&&K.d.col.includes(n)))return K.toast('That name is empty or already used.');K.d.col[K.d.col.indexOf(old)]=n;K.d.mem.forEach(m=>{if(m.col==old)m.col=n});K.sel=n;K.save();K.refresh()}),
delcol:async()=>{if(K.sel=='Unsorted')return K.toast('Unsorted cannot be deleted.');if(!await K.ask('Delete "'+K.esc(K.sel)+'"? Its memories move to Unsorted.'))return;K.d.mem.forEach(m=>{if(m.col==K.sel)m.col='Unsorted'});K.d.col=K.d.col.filter(c=>c!=K.sel);K.sel=null;K.save();K.refresh()}});
