import {useState} from 'react';
export default function Board(){
 const [layer,setLayer]=useState('铜层');
 return <div className="board-panel"><div className="board-heading"><span>看懂一块PCB</span><span className="subtle">交互示意</span></div><svg viewBox="0 0 520 290" role="img" aria-label={`PCB${layer}教学示意，非课程工程图`}>
 <defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#bbd4ce"/></pattern></defs>
 <rect width="520" height="290" fill="url(#grid)"/><rect x="58" y="38" width="405" height="204" rx="18" fill={layer==='阻焊'?'#166856':'#d8e9e3'} stroke="#749d91" strokeWidth="2"/>
 {[78,444].flatMap(x=>[57,224].map(y=><circle key={`${x}${y}`} cx={x} cy={y} r="7" fill="#f2f5f6" stroke="#b77c48" strokeWidth="4"/>))}
 <g fill="none" stroke={layer==='铜层'?'#b77c48':'#79a796'} strokeWidth="5" opacity={layer==='丝印'?.18:1} strokeLinejoin="round"><path d="M111 105H163L194 136H234M111 122H156L187 153H234M287 117H333L362 88H405M287 136H343L376 169H408M257 167V200H335L365 170M234 120H202V78H147"/><path d="M269 167V213H137V168H111" strokeWidth="3"/></g>
 <g fill="#b77c48">{[0,1,2,3,4,5].map(i=><g key={i}><rect x={226+i*10} y="90" width="5" height="20"/><rect x={226+i*10} y="164" width="5" height="20"/><rect x="211" y={113+i*8} width="18" height="4"/><rect x="281" y={113+i*8} width="18" height="4"/></g>)}{[0,1,2,3].map(i=><g key={i}><rect x="94" y={96+i*18} width="26" height="9" rx="2"/><circle cx="411" cy={92+i*24} r="7"/></g>)}</g>
 <rect x="229" y="109" width="52" height="54" rx="3" fill="#28423d"/><circle cx="238" cy="119" r="3" fill="#a7bfb4"/>
 <g fill="#f2ede0"><rect x="177" y="66" width="20" height="10" rx="2"/><rect x="326" y="182" width="20" height="10" rx="2"/></g>
 <g fill="none" stroke="#d8e8df" strokeWidth={layer==='丝印'?2:1} opacity={layer==='铜层'?.5:1}><rect x="219" y="97" width="72" height="76" rx="2"/><rect x="88" y="87" width="38" height="78"/><path d="M390 73H432V181H390Z"/></g>
 {layer==='丝印'&&<g fill="#255a4a" fontSize="13" fontFamily="sans-serif"><text x="242" y="86">U1</text><text x="86" y="79">J1</text><text x="398" y="67">J2</text><text x="170" y="59">C1</text><text x="327" y="215">C2</text></g>}
 <g fill="#45695e" fontFamily="sans-serif" fontSize="12"><text x="58" y="269">{layer==='铜层'?'走线连接带有同一网络的焊盘':layer==='阻焊'?'阻焊保护铜面，开窗留给焊接':'丝印标注位号、方向与装配信息'}</text></g></svg>
 <div className="layer-tabs" aria-label="切换PCB图层">{['铜层','阻焊','丝印'].map(x=><button className={layer===x?'active':''} aria-pressed={layer===x} key={x} onClick={()=>setLayer(x)}><i className={`layer-dot ${x==='铜层'?'copper':x==='阻焊'?'mask':'ink'}`}/>{x}</button>)}</div></div>
}
