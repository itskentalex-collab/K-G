// PROJECT KLIE — complete shared archive sync (database + photo storage).
(function(){
  const cfg=window.KLIE_CLOUD_CONFIG||{};
  const configured=cfg.url&&cfg.anonKey&&!String(cfg.url).includes('YOUR_')&&!String(cfg.anonKey).includes('YOUR_');
  let client=null, applying=false, timer=null, syncing=false, pending=false, lastMedia=[];
  K.canEdit=()=>!!sessionStorage.getItem('klie_owner_key');
  K.refreshAccessUI=()=>document.querySelectorAll('[data-editor-only]').forEach(el=>{el.hidden=!K.canEdit();});
  const status=(msg,bad=false)=>{const el=document.getElementById('cloud-status');if(el){el.textContent=msg;el.style.color=bad?'#e6a0a0':'';}};
  const key=()=>sessionStorage.getItem('klie_owner_key')||'';
  const mediaUrl=id=>cfg.url.replace(/\/$/,'')+'/storage/v1/object/public/klie-media/'+encodeURIComponent(id);
  const archiveData=()=>({mem:K.d.mem,mom:K.d.mom,col:K.d.col,notes:K.d.notes.map(n=>{const x={...n};delete x.cloud;return x;}),unseen:!!K.d.unseen,set:K.d.set});
  const mediaIds=()=>[...new Set(K.d.mem.concat(K.d.mom).filter(x=>x.img).map(x=>x.id))];
  async function callMedia(id,method,blob){
    const k=key();if(!k)throw new Error('Owner key belum diaktifkan.');
    const headers={'x-klie-owner-key':k,'apikey':cfg.anonKey};
    if(blob)headers['Content-Type']=blob.type||'image/jpeg';
    const res=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/klie-media/'+encodeURIComponent(id),{method,headers,body:blob||undefined});
    if(!res.ok)throw new Error((await res.text()).slice(0,180)||'Media upload failed');
  }
  async function uploadAllPhotos(){
    const uploaded=[];
    for(const id of mediaIds()){const blob=await K.getImg(id);if(blob){await callMedia(id,'PUT',blob);uploaded.push(id);}else if(lastMedia.includes(id)){uploaded.push(id);}}
    return uploaded;
  }
  async function pushArchive(showToast=false){
    if(!client||!key())return false;
    if(syncing){pending=true;return false;}
    syncing=true;
    try{
      const ids=await uploadAllPhotos();
      const {error}=await client.rpc('klie_save_archive',{p_owner_key:key(),p_data:archiveData(),p_media:ids});
      if(error)throw error;
      const removed=lastMedia.filter(id=>!ids.includes(id));
      for(const id of removed){try{await callMedia(id,'DELETE');}catch(e){console.warn('KLIE media cleanup:',e.message);}}
      lastMedia=ids;
      status('Cloud connected · All archive data and photos are synced.');
      if(showToast)K.toast('Seluruh arsip KLIE berhasil disinkronkan.');
      return true;
    }catch(e){status('Sync failed: '+(e.message||'Unknown error'),true);if(showToast)K.toast('Sinkronisasi gagal. Periksa koneksi dan owner key.');return false;}
    finally{syncing=false;if(pending){pending=false;pushArchive(false);}}
  }
  async function applyRemote(row){
    if(!row||!row.data)return;
    applying=true;
    try{
      const d=row.data;
      K.d=Object.assign(K.def(),d);
      K.d.set=Object.assign(K.def().set,d.set||{});
      K.d.mem=Array.isArray(d.mem)?d.mem:[];K.d.mom=Array.isArray(d.mom)?d.mom:[];
      K.d.col=Array.isArray(d.col)?d.col:K.def().col;K.d.notes=Array.isArray(d.notes)?d.notes:[];
      lastMedia=Array.isArray(row.media)?row.media:[];
      K.save();
      for(const id of lastMedia){
        try{const r=await fetch(mediaUrl(id));if(r.ok){const blob=await r.blob();await K.putImg(id,blob);delete K.urls[id];}}
        catch(e){console.warn('KLIE photo download:',id,e);}
      }
      K.apply();K.refresh();
      status('Cloud connected · '+K.d.mem.length+' memories, '+K.d.mom.length+' moments, '+K.d.notes.length+' notes and '+lastMedia.length+' photos synced.');
    }finally{applying=false;}
  }
  async function refreshArchive(){
    if(!client)return;
    const {data,error}=await client.from('klie_shared_state').select('data,media,updated_at').eq('id',true).maybeSingle();
    if(error){status('Cloud read error: '+error.message,true);return;}
    if(data){await applyRemote(data);}
    else status('Cloud ready · No shared archive yet. Enable editing and upload this device’s archive.');
  }
  K.cloudQueueSync=()=>{
    if(applying||!client||!key())return;
    clearTimeout(timer);timer=setTimeout(()=>pushArchive(false),850);
  };
  K.enableCloudEditing=async()=>{
    if(!client)return K.toast('Konfigurasi Supabase belum selesai.');
    const entered=window.prompt('Masukkan shared owner key KLIE. Gunakan key yang sama di kedua perangkat:');
    if(!entered)return;
    const {data,error}=await client.rpc('klie_check_owner_key',{p_owner_key:entered});
    if(error||data!==true)return K.toast('Owner key tidak valid.');
    sessionStorage.setItem('klie_owner_key',entered);
    K.refreshAccessUI();K.refresh();
    K.toast('Akses edit aktif di browser ini.');
    status('Editing enabled · Changes from this device will sync to the shared archive.');
  };
  K.publishLocalArchive=async()=>{
    if(!client)return K.toast('Konfigurasi Supabase belum selesai.');
    if(!key())await K.enableCloudEditing();
    if(!key())return;
    const {data}=await client.from('klie_shared_state').select('id').eq('id',true).maybeSingle();
    if(data&&!await K.ask('Cloud archive sudah ada. Ganti seluruh arsip cloud dengan data perangkat ini? Pastikan sudah membuat backup.'))return;
    await pushArchive(true);
  };
  K.act.sharenote=async id=>{
    const note=K.d.notes.find(n=>n.id===id);if(!note)return;
    if(!key())await K.enableCloudEditing();
    if(!key())return;
    note.cloud=true;K.save();K.refresh();
    const url=location.href.split('#')[0]+'#notes';
    try{await navigator.clipboard.writeText(url);K.toast('Arsip bersama aktif. Link website disalin.');}catch(e){K.toast('Arsip bersama aktif. Bagikan link website.');}
  };
  K.act.delnote=async id=>{if(!await K.ask('Delete this note from the shared archive? This cannot be undone.'))return;K.d.notes=K.d.notes.filter(n=>n.id!==id);K.save();K.refresh();};
  document.addEventListener('DOMContentLoaded',()=>{
    if(!configured){status('Not configured. Add the Supabase URL and anon/publishable key in js/cloud-config.js.');return;}
    if(!window.supabase||!window.supabase.createClient){status('Supabase library did not load. Check your internet connection.',true);return;}
    client=window.supabase.createClient(cfg.url,cfg.anonKey);
    refreshArchive();
    K.refreshAccessUI();
    client.channel('klie-full-archive').on('postgres_changes',{event:'*',schema:'public',table:'klie_shared_state'},refreshArchive).subscribe(state=>{if(state==='CHANNEL_ERROR')status('Realtime connection failed. Reload the page to retry.',true);});
  });
})();
