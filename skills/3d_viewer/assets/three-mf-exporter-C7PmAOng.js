import{cZ as B,c_ as S,z as k,d as w}from"./vendor-Cl6HNpc6.js";const L={printer_name:"Bambu Lab A1",filament:"Bambu PLA Basic @BBL A1",printableWidth:256,printableDepth:256,printableHeight:256,printableArea:["0x0","256x0","256x256","0x256"],printerSettingsId:"Bambu Lab A1 0.4 nozzle",printSettingsId:"0.20mm Standard @BBL A1",compression:"standard",different_settings_to_system:[],metadata:{Application:"BambuStudio-02.04.00.70",ApplicationTitle:"Exported 3D Model"}};async function P(d,l){const o=Object.assign({},L,l),g=o.compression==="standard"?6:0,r=[],m=[],b=[],v=t=>{t.updateMatrixWorld(!0);const y=t.geometry,p=y.attributes.position,h=y.index;let $=null;if(t.material){const s=new w,f=Array.isArray(t.material)?t.material[0]:t.material;f&&"color"in f&&f.color?s.copy(f.color):s.set(8421504);const M=m.find(I=>I.color.r===s.r&&I.color.g===s.g&&I.color.b===s.b);if(M)$=M;else{const I=m.length+1;$={id:m.length+1,color:s,name:t.name?`${t.name}_material`:`material_${m.length}`,extruder:I},m.push($)}}const x=r.length+1,u={id:x,type:"mesh",vertices:[],triangles:[],material:$,name:t.name||`Mesh-${x}`,subComponents:[],uuid:T()},j=new Map,_=s=>{const f=new k;f.fromBufferAttribute(p,s);const M=`${f.x},${f.y},${f.z}`;return j.has(M)||(j.set(M,u.vertices.length),u.vertices.push({x:f.x,y:f.y,z:f.z})),j.get(M)};if(h)for(let s=0;s<h.count;s+=3)u.triangles.push({v1:_(h.getX(s)),v2:_(h.getX(s+1)),v3:_(h.getX(s+2))});else for(let s=0;s<p.count;s+=3)u.triangles.push({v1:_(s),v2:_(s+1),v3:_(s+2)});return r.push(u),x},i=t=>{if(t.type==="Mesh")return v(t);if(t.type==="Group"||t.type==="Object3D"||t.type==="Scene"){const y=[];if(t.updateMatrixWorld(!0),t.children.forEach(p=>{const h=i(p);if(h!==-1){const $=p.matrixWorld.clone().premultiply(t.matrixWorld.clone().invert());y.push({objectId:h,transform:$})}}),y.length>0){const p=r.length+1;return r.push({id:p,type:"assembly",subComponents:y,name:t.name||`Group-${p}`,vertices:[],triangles:[],material:null,uuid:T()}),p}}return-1},a=d.type==="Scene"?d.children:[d],c=[];a.forEach(t=>{const y=i(t);if(y!==-1){t.updateMatrix();const p=t.matrix.clone(),h=r.find(x=>x.id===y),$=x=>x.type==="assembly"?x.subComponents.flatMap(u=>{const j=r.find(_=>_.id===u.objectId);return $(j).map(_=>_.clone().applyMatrix4(u.transform))}):x.vertices.map(u=>new k(u.x,u.y,u.z));$(h).forEach(x=>{x.applyMatrix4(p),c.push(x)}),b.push({objectId:y,transformMatrix:p,uuid:T()})}});let e={x:1/0,y:1/0,z:1/0},n={x:-1/0,y:-1/0,z:-1/0};c.length>0?c.forEach(t=>{e.x=Math.min(e.x,t.x),e.y=Math.min(e.y,t.y),e.z=Math.min(e.z,t.z),n.x=Math.max(n.x,t.x),n.y=Math.max(n.y,t.y),n.z=Math.max(n.z,t.z)}):(e={x:0,y:0,z:0},n={x:0,y:0,z:0});const F={x:(e.x+n.x)/2,y:(e.y+n.y)/2,z:(e.z+n.z)/2},z={x:o.printableWidth/2,y:o.printableDepth/2,z:0},A={x:z.x-F.x,y:z.y-F.y,z:z.z-e.z},C=U(r,b,A,o),X=W(r,b),D=R(m,o),E=B({"_rels/.rels":S(O()),"3D/3dmodel.model":S(C),"Metadata/model_settings.config":S(X),"Metadata/project_settings.config":S(D),"[Content_Types].xml":S(V())},{level:g});return new Blob([E],{type:"application/vnd.ms-package.3dmanufacturing-3dmodel+xml"})}function U(d,l,o,g){const r=[],m=g.metadata;r.push(`<metadata name="CreationDate">${new Date().toISOString()}</metadata>`);for(const i in m)r.push(`<metadata name="${i}">${m[i]}</metadata>`);const b=d.map(i=>{if(i.type==="assembly"){const a=i.subComponents.map(c=>{const e=c.transform.elements,n=`${e[0].toFixed(5)} ${e[1].toFixed(5)} ${e[2].toFixed(5)} ${e[4].toFixed(5)} ${e[5].toFixed(5)} ${e[6].toFixed(5)} ${e[8].toFixed(5)} ${e[9].toFixed(5)} ${e[10].toFixed(5)} ${e[12].toFixed(5)} ${e[13].toFixed(5)} ${e[14].toFixed(5)}`;return`<component objectid="${c.objectId}" transform="${n}" />`}).join("");return`<object id="${i.id}" type="model" name="${i.name}"><components>${a}</components></object>`}else{const a=i.vertices.map(e=>`<vertex x="${e.x.toFixed(5)}" y="${e.y.toFixed(5)}" z="${e.z.toFixed(5)}" />`).join(" "),c=i.triangles.map(e=>`<triangle v1="${e.v1}" v2="${e.v2}" v3="${e.v3}" />`).join(" ");return`<object id="${i.id}" type="model" name="${i.name}"><mesh><vertices>${a}</vertices><triangles>${c}</triangles></mesh></object>`}}).join(`
`),v=l.map(i=>{const a=i.transformMatrix.elements,c=a[12]+o.x,e=a[13]+o.y,n=a[14]+o.z,F=`${a[0].toFixed(5)} ${a[1].toFixed(5)} ${a[2].toFixed(5)} ${a[4].toFixed(5)} ${a[5].toFixed(5)} ${a[6].toFixed(5)} ${a[8].toFixed(5)} ${a[9].toFixed(5)} ${a[10].toFixed(5)} ${c.toFixed(5)} ${e.toFixed(5)} ${n.toFixed(5)}`;return`<item objectid="${i.objectId}" transform="${F}" printable="1" />`}).join(`
`);return`<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p">
    ${r.join(`
    `)}
    <resources>
${b}
    </resources>
    <build>
${v}
    </build>
</model>`}function W(d,l){let o="",g="",r="";return l.forEach((m,b)=>{const v=m.objectId,i=d.find(n=>n.id===v),a=[],c=n=>{n.type==="mesh"?a.push(n):n.subComponents.forEach(F=>c(d.find(z=>z.id===F.objectId)))};c(i);const e=a.map(n=>{const F=n.material?n.material.extruder:1;return`    <part id="${n.id}" subtype="normal_part">
      <metadata key="name" value="${n.name}"/>
      <metadata key="extruder" value="${F}"/>
      <mesh_stat edges_fixed="0" degenerate_facets="0" facets_removed="0" facets_reversed="0" backwards_edges="0"/>
    </part>`}).join(`
`);o+=`  <object id="${v}">
    <metadata key="name" value="${i.name}"/>
    <metadata key="extruder" value="1"/>
    <metadata key="thumbnail_file" value=""/>
${e}
  </object>
`,g+=`    <model_instance>
      <metadata key="object_id" value="${v}"/>
      <metadata key="instance_id" value="0"/>
      <metadata key="identify_id" value="${b+1}"/>
    </model_instance>
`,r+=`    <assemble_item object_id="${v}" instance_id="0" offset="0 0 0"/>
`}),`<?xml version="1.0" encoding="UTF-8"?>
<config>
${o}
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value="plate-1"/>
${g}
  </plate>
  <assemble>
${r}
  </assemble>
</config>`}function R(d,l){const o=d.map(m=>`#${m.color.getHexString()}`);for(;o.length<2;)o.push("#FFFFFF");const g=new Set(l.different_settings_to_system||[]),r={printable_area:l.printableArea,printable_height:l.printableHeight.toString(),bed_exclude_area:[],filament_colour:o,filament_settings_id:Array.from({length:o.length}).fill(l.filament),filament_diameter:Array.from({length:o.length}).fill("1.75"),filament_is_support:Array.from({length:o.length}).fill("0"),printer_model:l.printer_name,layer_height:"0.2",wall_loops:"2",sparse_infill_density:"15%",printer_settings_id:l.printerSettingsId,printer_variant:"0.4",nozzle_diameter:["0.4"],enable_support:"0",support_type:"normal(auto)",print_settings_id:l.printSettingsId};return l.seam_position&&(r.seam_position=l.seam_position,g.add("seam_position")),g.size>0&&(r.different_settings_to_system=Array.from(g)),JSON.stringify(r)}function O(){return`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rel-1" Target="/3D/3dmodel.model" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
  <Relationship Id="rel-2" Target="/Metadata/model_settings.config" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
  <Relationship Id="rel-3" Target="/Metadata/project_settings.config" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`}function V(){return`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="config" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="gcode" ContentType="text/x.gcode"/>
</Types>`}function T(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,d=>{const l=Math.random()*16|0;return(d==="x"?l:l&3|8).toString(16)})}export{L as defaultPrintConfig,P as exportTo3MF};
