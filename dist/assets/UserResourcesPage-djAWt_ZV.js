import{c as r,r as c,t as x,v as m,j as e,w as j}from"./index-BE4tGBkf.js";import{L as _}from"./LiveFeed-C2RzM2tD.js";import{f as v,h as g}from"./issueService-CJ2VCvVW.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M13 2a9 9 0 0 1 9 9",key:"1itnx2"}],["path",{d:"M13 6a5 5 0 0 1 5 5",key:"11nki7"}],["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],N=r("phone-call",C);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M9 12h6",key:"1c52cq"}],["path",{d:"M12 9v6",key:"199k2o"}]],f=r("shield-plus",b);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}],["path",{d:"m14 5 3-3 3 3",key:"1sorif"}],["path",{d:"m14 10 3-3 3 3",key:"1jyi9h"}],["path",{d:"M17 14V2",key:"8ymqnk"}],["path",{d:"M17 14H7l-5 8h20Z",key:"13ar7p"}],["path",{d:"M8 14v8",key:"1ghmqk"}],["path",{d:"m9 14 5 8",key:"13pgi6"}]],q=r("tent-tree",M);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]],P=r("truck",A),R="_page_xamje_1",L="_quickCard_xamje_6",S="_resourcePanel_xamje_7",T="_resourceCard_xamje_26",I="_resourceList_xamje_31",t={page:R,quickCard:L,resourcePanel:S,resourceCard:T,resourceList:I},w={PhoneCall:N,TentTree:q,ShieldPlus:f,Truck:P},d=[{label:"Emergency hotline",value:"108",icon:"PhoneCall"},{label:"Nearest shelter",value:"Checking...",icon:"TentTree"},{label:"Medical relay",value:"Checking...",icon:"ShieldPlus"},{label:"Supply drop points",value:"Checking...",icon:"Truck"}];function V(){const[o,h]=c.useState([]),[l,u]=c.useState([]),[p,y]=c.useState(d);c.useEffect(()=>{const s=x(m(j,"config","quickActions"),a=>{if(a.exists()){const k=a.data();y(d.map(n=>({...n,value:k[n.label]??n.value})))}});return()=>s()},[]),c.useEffect(()=>{i();const s=setInterval(i,5e3);return()=>clearInterval(s)},[]);const i=async()=>{try{const s=await v(),a=await g();h(s||[]),u(a||[])}catch(s){console.error("Resource fetch error:",s)}};return e.jsxs("div",{className:t.page,children:[e.jsx("section",{className:"grid grid-4",children:p.map(s=>{const a=w[s.icon];return e.jsxs("article",{className:t.quickCard,children:[a&&e.jsx(a,{size:18}),e.jsx("strong",{children:s.value}),e.jsx("span",{children:s.label})]},s.label)})}),e.jsxs("section",{className:"grid grid-2",children:[e.jsxs("div",{className:t.resourcePanel,children:[e.jsx("p",{className:"section-eyebrow",children:"Recommended support"}),e.jsx("h3",{children:"Nearby resources matched to your issue"}),e.jsx("div",{className:t.resourceList,children:o.length?o.map(s=>e.jsxs("article",{className:t.resourceCard,children:[e.jsxs("div",{children:[e.jsx("strong",{children:s.title}),e.jsx("p",{children:s.type})]}),e.jsx("span",{children:s.eta}),e.jsx("small",{children:s.note})]},s.id)):e.jsx("p",{children:"No resources available yet"})})]}),e.jsx(_,{title:"Resource alerts",items:l.length?l:[{title:"No updates yet",detail:"",time:""}]})]})]})}export{V as default};
