K.disc=['Something small was left here.','You are paying attention.','Not everything needs to be explained.','A quiet detail, noticed.'];
K.show=function(p,silent){if(!$('#p-'+p)||(p=='unseen'&&!K.d.unseen))p='overview';
$$('.pg').forEach(s=>s.classList.toggle('on',s.id=='p-'+p));$$('#nav a').forEach(a=>a.classList.toggle('act',a.dataset.p==p));
document.body.dataset.pg=p;$('#nav').classList.remove('open');scrollTo(0,0);if(!silent&&p!='unseen'&&Math.random()<.12)K.toast(K.pick(K.disc))};
K.mods.push(()=>{addEventListener('hashchange',()=>K.show(location.hash.slice(1)));$('#mb').onclick=()=>$('#nav').classList.toggle('open')});
