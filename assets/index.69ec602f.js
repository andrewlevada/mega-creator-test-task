import{d as s,s as i,y as o,c as n,r as p}from"./index.9417924e.js";import"./index.13573bac.js";const m=`.border{margin:4px;border:1px dashed #00A9F0;width:calc(100% - 8px);height:calc(100% - 8px)}.el{position:absolute}.el.square{width:8px;height:8px;border:1px solid #00A9F0}.el.rotate{pointer-events:all;width:13px;height:11px}.el.rotate.top,.el.rotate.bottom{left:50%;transform:translate(-50%) rotate(90deg)}.el.rotate.top.bottom,.el.rotate.bottom.bottom{transform:translate(-50%) rotate(90deg) scale(-1)}.el.rotate.left,.el.rotate.right{top:50%;transform:translateY(-50%)}.el.rotate.left.right,.el.rotate.right.right{transform:translateY(-50%) scale(-1)}.top{top:0}.bottom{bottom:0}.left{left:0}.right{right:0}
`,r=["left","right"],a=["top","bottom"],g=()=>s("selection-frame",l);class l extends i{render(){return o`
            <div class="border"></div>
            
            ${r.map(t=>a.map(e=>o`
	            <div class="el square ${t} ${e}"></div>
            `))}
            
            ${[...r,...a].map(t=>o`
            	<img class="el rotate ${t}" src="rotate-symbol.png" alt="null"
	                 @drag=${e=>this.emitDragEvent(t,e)}/>
            `)}
        `}fixUrl(t){return t.replace(/\/[^/]+/,"")}emitDragEvent(t,e){this.dispatchEvent(new CustomEvent("rotation-drag",{detail:{side:t,event:e}}))}}l.styles=[...n,p(m)];export{l as SelectionFrame,g as default};
