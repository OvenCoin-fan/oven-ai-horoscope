import { useState } from 'react';
import './App.css';

const Z = [
  {s:'aries',e:'♈',n:'Овен'},{s:'taurus',e:'♉',n:'Телец'},
  {s:'gemini',e:'♊',n:'Близнецы'},{s:'cancer',e:'♋',n:'Рак'},
  {s:'leo',e:'♌',n:'Лев'},{s:'virgo',e:'♍',n:'Дева'},
  {s:'libra',e:'♎',n:'Весы'},{s:'scorpio',e:'♏',n:'Скорпион'},
  {s:'sagittarius',e:'♐',n:'Стрелец'},{s:'capricorn',e:'♑',n:'Козерог'},
  {s:'aquarius',e:'♒',n:'Водолей'},{s:'pisces',e:'♓',n:'Рыбы'},
];

const FB: Record<string,string[]> = {
  aries:['♈ Овен: Звёзды на твоей стороне. Риски оправдаются!','♈ Овен: Энергия бьёт ключом — направь её в дело.','♈ Овен: День перемен. Препятствие станет трамплином.'],
  taurus:['♉ Телец: Стабильность — суперсила. Укрепляй то, что работает.'],
  gemini:['♊ Близнецы: Информация — валюта. Новые связи принесут возможности.'],
  cancer:['♋ Рак: Доверяй чувствам. Внутренний голос подскажет верное решение.'],
  leo:['♌ Лев: Сцена твоя. Проявись — и мир заметит.'],
  virgo:['♍ Дева: Детали решают всё. Перепроверь — и успех гарантирован.'],
  libra:['♎ Весы: Баланс — ключ к гармонии. Партнёрство принесёт плоды.'],
  scorpio:['♏ Скорпион: Трансформация. Отпусти старое — придёт новое.'],
  sagittarius:['♐ Стрелец: Горизонт расширяется. Не бойся нового.'],
  capricorn:['♑ Козерог: Дисциплина — твой козырь. Признание близко.'],
  aquarius:['♒ Водолей: Инновации в воздухе. Необычная идея — золотая.'],
  pisces:['♓ Рыбы: Интуиция на пике. Творчество — твой путь.'],
};

function gfb(s:string){const o=FB[s]||FB.aries;return o[Math.floor(Math.random()*o.length)]}

export function Horoscope() {
  const [sel,setSel]=useState<string|null>(null);
  const [text,setText]=useState('');
  const [ld,setLd]=useState(false);
  const go=async(s:string)=>{
    setSel(s);setLd(true);
    try{const r=await fetch('/api/horoscope',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sign:s,date:new Date().toISOString()})});
    if(r.ok){const d=await r.json();setText(d.horoscope)}else setText(gfb(s));
    }catch{setText(gfb(s))}finally{setLd(false)}
  };
  return (
    <div className="card">
      <h2>🔮 AI Гороскоп</h2>
      <p style={{color:'#888',fontSize:'13px',marginBottom:'12px'}}>Выбери знак — Mira предскажет день</p>
      <div className="zodiac-grid">
        {Z.map(({s,e,n})=><button key={s} className={`zodiac-btn ${sel===s?'active':''}`} onClick={()=>go(s)}><span className="emoji">{e}</span>{n}</button>)}
      </div>
      {ld&&<p className="loading">♈ Звёзды выстраиваются...</p>}
      {text&&!ld&&<div className="horoscope-result">{text}</div>}
    </div>
  );
}
