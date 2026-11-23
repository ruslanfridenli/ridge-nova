const I18N={"en":{"controls":"Controls","params":"Parameters","harmony":"Harmony","base":"Base hue","count":"Colors","sat":"Saturation","light":"Lightness","export":"Export","regen":"↻ New palette","css":"Copy CSS variables","json":"Copy JSON","grad":"⤓ Gradient PNG","contrast":"Contrast vs white/black","copied":"copied!"},"de":{"controls":"Steuerung","params":"Parameter","harmony":"Harmonie","base":"Basis-Farbton","count":"Farben","sat":"Sättigung","light":"Helligkeit","export":"Export","regen":"↻ Neue Palette","css":"CSS-Variablen kopieren","json":"JSON kopieren","grad":"⤓ Verlaufs-PNG","contrast":"Kontrast zu Weiß/Schwarz","copied":"kopiert!"}};
let lang=localStorage.getItem('lang')||'en';
const t=k=>I18N[lang][k]||k;
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-i]').forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();});

const $=id=>document.getElementById(id);
const strip=$('strip'),hexes=$('hexes'),contrast=$('contrast');
const HARM={analogous:[0],complementary:[0,180],triadic:[0,120,240],tetradic:[0,90,180,270],split:[0,150,210]};
function hsl(h,s,l){h=((h%360)+360)%360;const c=(1-Math.abs(2*l/100-1))*s/100,x=c*(1-Math.abs((h/60)%2-1)),m=l/100-c/2;let r,g,b;
if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];
const f=v=>Math.round((v+m)*255).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}
function lum(hex){const n=parseInt(hex.slice(1),16);const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(n>>16)+0.7152*f((n>>8)&255)+0.0722*f(n&255);}
function gen(){
  const harm=$('harm').value,hue=+$('hue').value,sat=+$('sat').value,light=+$('light').value,count=+$('count').value;
  const offs=HARM[harm];const colors=[];
  for(let i=0;i<count;i++){
    const o=offs[i%offs.length]+(Math.floor(i/offs.length))*30;
    const l=light+(i%2?8:-8);
    colors.push(hsl(hue+o,sat,Math.min(90,Math.max(15,l))));
  }
  strip.innerHTML='';hexes.innerHTML='';
  colors.forEach(c=>{
    const d=document.createElement('div');d.className='sw';d.style.background=c;d.title=c;strip.appendChild(d);
    const s=document.createElement('div');s.className='hex';s.textContent=c;s.onclick=()=>{navigator.clipboard.writeText(c);s.textContent=t('copied');setTimeout(()=>s.textContent=c,800);};hexes.appendChild(s);
  });
  contrast.innerHTML=colors.map(c=>{const L=lum(c);const wr=(1.05)/(L+0.05),bl=(L+0.05)/0.05;return c+' → '+(wr>bl?'white':'black')+' '+Math.round(Math.max(wr,bl)*100)/100;}).join('<br>');
  window._colors=colors;
}
['harm','hue','count','sat','light'].forEach(id=>$(id).addEventListener('input',gen));
$('regen').onclick=()=>{$('hue').value=Math.floor(Math.random()*360);gen();};
$('css').onclick=()=>{const css=':root{'+window._colors.map((c,i)=>'--c'+(i+1)+':'+c+';').join('')+'}';navigator.clipboard.writeText(css);$('css').textContent=t('copied');setTimeout(()=>$('css').textContent='Copy CSS variables',1500);};
$('json').onclick=()=>{navigator.clipboard.writeText(JSON.stringify(window._colors));$('json').textContent=t('copied');setTimeout(()=>$('json').textContent='Copy JSON',1500);};
$('grad').onclick=()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=300;const x=cv.getContext('2d');const g=x.createLinearGradient(0,0,1200,0);window._colors.forEach((c,i)=>g.addColorStop(i/(window._colors.length-1),c));x.fillStyle=g;x.fillRect(0,0,1200,300);const a=document.createElement('a');a.download='palette-'+Date.now()+'.png';a.href=cv.toDataURL();a.click();};
gen();applyLang();