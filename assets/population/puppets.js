/* Rounded population puppets. Design coordinates: rightward x, downward y; ground = 0.
   SPEC describes high quality. Low uses 8 locomotion frames with proportionate fps.
   speed in design units / second = stride * atlas.fps[name].walk / frameCount.
   All drawing is deferred until buildAtlas; pose and SPEC have no platform dependency. */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2, sprites = {}, rigs = {
    titan1: { h:33, hip:16, chest:24, head:29, rx:3.2, ry:4, torso:3.2, leg:8.7, arm:7, stride:10, skin:'#e9c2a6', lean:0.7, hair:1 },
    titan2: { h:29, hip:11.5, chest:19, head:25, rx:3.7, ry:3.9, torso:5.3, leg:6.4, arm:5.5, stride:7, skin:'#d9a184', lean:-0.4, belly:1 },
    titan3: { h:31, hip:15, chest:22, head:26.5, rx:3, ry:3.6, torso:3.8, leg:8.3, arm:9.1, stride:9, skin:'#c98d72', lean:3, hunch:1, hair:1 },
    titan4: { h:25, hip:9, chest:15, head:21, rx:4.5, ry:4.6, torso:3.9, leg:5.1, arm:4.7, stride:6, skin:'#f0d0b5', lean:0.3, baby:1 },
    titan5: { h:32, hip:16, chest:23.2, head:28, rx:3.1, ry:4.5, torso:2.6, leg:8.7, arm:7.3, stride:9.5, skin:'#d8ac8a', lean:1.3, jaw:1 },
    titan6: { h:19, hip:10.5, chest:12, head:14, rx:3.6, ry:3.6, torso:3.5, leg:6.5, arm:6.7, stride:12, skin:'#bc866e', lean:7, quad:1 },
    wallTitan: { h:46, hip:23, chest:35, head:41, rx:3.7, ry:4.8, torso:5.3, leg:12, arm:10, stride:12, skin:'#b45448', lean:0.2, muscle:1 }
  };
  function anim(frames, fps, back) { return { frames:frames, fps:fps, views:back ? ['f','b'] : ['f'] }; }
  Object.keys(rigs).forEach(function (n) {
    var r=rigs[n], a={walk:anim(12,n==='wallTitan'?7: n==='titan6'?11:8,true)};
    if(n!=='wallTitan'){ a.idle=anim(12,3,false); a.reach=anim(12,6,false); }
    sprites[n]={anims:a,baseHeight:r.h,stride:r.stride};
  });
  sprites.titanLying={anims:{idle:anim(12,3,false)},baseHeight:12,stride:0};
  for(var i=1;i<=4;i++) sprites['civ'+i]={anims:{walk:anim(12,14,true),run:anim(12,21,true),idle:anim(12,3,false)},baseHeight:11,stride:i===4?4:4.6,runStride:i===4?6:7};
  sprites.rider={anims:{walk:anim(12,15,true),idle:anim(12,3,false)},baseHeight:21,stride:17};
  sprites.cannon={anims:{idle:anim(1,1,false),fire:anim(8,14,false)},baseHeight:12,stride:0};
  sprites.steam={anims:{puff:anim(12,12,false)},baseHeight:34,stride:0};
  var SPEC={sprites:sprites};
  function cycle(t){ t=Number(t)||0; return ((t%1)+1)%1; }
  function pt(x,y){return {x:x,y:y};}
  function add(a,x,y){return pt(a.x+x,a.y+y);}
  function mix(a,b,t){return a+(b-a)*t;}
  function smooth(t){return t*t*(3-2*t);}
  // Stance travels linearly opposite world motion. Hermite swing retains the
  // same horizontal velocity at both contacts; sin-squared lift has zero slope.
  function foot(t,stride,lift,stance){
    t=cycle(t); stance=stance||0.62;
    var a=stride*stance/2;
    if(t<stance)return pt(a-stride*t,0);
    var q=(t-stance)/(1-stance), q2=q*q, q3=q2*q, v=-stride*(1-stance);
    return pt((2*q3-3*q2+1)*(-a)+(q3-2*q2+q)*v+(-2*q3+3*q2)*a+(q3-q2)*v,-lift*Math.pow(Math.sin(Math.PI*q),2));
  }
  function ik(a,b,l1,l2,bend){
    var dx=b.x-a.x,dy=b.y-a.y, d=Math.max(0.0001,Math.hypot(dx,dy));
    var z=Math.min(l1-0.00001,Math.max(-l1+0.00001,(l1*l1-l2*l2+d*d)/(2*d)));
    var off=Math.sqrt(Math.max(0,l1*l1-z*z))*(bend||1);
    return pt(a.x+dx*z/d+dy*off/d,a.y+dy*z/d-dx*off/d);
  }
  function human(r,an,t){
    var w=TAU*t, moving=an==='walk'||an==='run', run=an==='run', reach=an==='reach';
    var breath=Math.sin(w), bob=moving?0.36*Math.cos(2*w)+0.12*Math.sin(w):0.16*breath;
    var lean=r.lean+(run?1.8:0)+(moving?0.22*Math.sin(w+0.4):0.3*Math.sin(w));
    var hip=pt(0,-r.hip+bob), chest=pt(lean,-r.chest+bob), head=pt(lean+0.6,-r.head+bob+0.15*Math.sin(w-0.3));
    var p={hip:hip,chest:chest,head:head,lean:lean,bob:bob,legs:[],arms:[]};
    for(var j=0;j<2;j++){
      var phase=cycle(t+j/2), side=j?1:-1, f=moving?foot(phase,r.stride*(run?1.5:1),run?2.2:1.2,run?0.43:0.62):pt(side*1.4,0);
      var a=add(hip,side*0.9,side*0.28), b=pt(f.x+side*0.65,f.y+side*0.28);
      p.legs.push({hip:a,knee:ik(a,b,r.leg,r.leg,1),ankle:b});
      var sh=add(chest,side*1.2,-0.4), hand,elbow;
      if(reach){
        hand=pt(lean+9+0.8*Math.sin(w+j*1.6),-r.chest-r.arm*1.25+1.2*Math.sin(w+j*1.6));
        elbow=ik(sh,hand,r.arm,r.arm,side);
      }else{
        var swing=moving?Math.sin(w+j*Math.PI+0.25)*(run?0.85:0.44):0.08*breath;
        hand=pt(sh.x+Math.sin(swing)*r.arm*1.7+0.4,sh.y+Math.cos(swing)*r.arm*1.65);
        if(run) hand.y-=r.arm*0.5;
        elbow=ik(sh,hand,r.arm,r.arm,-1);
      }
      p.arms.push({shoulder:sh,elbow:elbow,hand:hand});
    }
    if(r.quad && !reach){
      p.hip=pt(-4,-r.hip+bob);p.chest=pt(4,-r.chest+bob);p.head=pt(9,-r.head+bob);
      for(var q=0;q<2;q++){
        var hf=moving?foot(t+q/2,r.stride,2,0.6):pt(q?1.8:-1.8,0);
        var ff=moving?foot(t+q/2+0.38,r.stride,1.5,0.6):pt(q?1:-1,0);
        var hh=add(p.hip,q?0.6:-0.6,0), aa=pt(hf.x-5,hf.y+(q?0.4:-0.4));
        var ss=add(p.chest,q?0.7:-0.7,0), ha=pt(ff.x+7,ff.y+(q?0.4:-0.4));
        p.legs[q]={hip:hh,knee:ik(hh,aa,r.leg,r.leg,-1),ankle:aa};
        p.arms[q]={shoulder:ss,elbow:ik(ss,ha,r.arm,r.arm,1),hand:ha};
      }
    }
    return p;
  }
  function civilianRig(){return {hip:4.7,chest:7.4,head:9.5,leg:2.7,arm:2.1,stride:4.6,lean:0.4};}
  function pose(name,an,t){
    if(!sprites[name]||!sprites[name].anims[an])throw new Error('Unknown puppet or animation: '+name+'/'+an);
    t=cycle(t); var w=t*TAU;
    if(rigs[name])return human(rigs[name],an,t);
    if(name.indexOf('civ')===0){
      var count=name==='civ1'||name==='civ2'?2:1, people=[];
      for(var i=0;i<count;i++){
        var cr=civilianRig(),phase=t+i*0.17;
        cr.stride=an==='run'?sprites[name].runStride/1.5:sprites[name].stride;
        if(name==='civ2'&&i===1){cr.stride/=1.28;phase=t*2+0.17;}
        people.push(human(cr,an,cycle(phase)));
      }
      var wheel=an==='idle'?0:w*(an==='run'?3:2);
      return {people:people,cartSpokePhase:{cos:Math.cos(wheel),sin:Math.sin(wheel)},bundleBob:Math.sin(w*2)*0.12};
    }
    if(name==='titanLying')return {hip:pt(-5,-3.2),chest:pt(2,-4.7-0.22*Math.sin(w)),head:pt(9,-5.1),breath:Math.sin(w)*0.22,legs:[{hip:pt(-5,-3),knee:pt(-10,-2.1),ankle:pt(-16,-1)},{hip:pt(-5,-3.6),knee:pt(-9,-5),ankle:pt(-16,-3)}],arms:[{shoulder:pt(3,-4.8),elbow:pt(-1,-1.3),hand:pt(5,-0.8)},{shoulder:pt(2,-5),elbow:pt(-3,-7),hand:pt(1,-8)}]};
    if(name==='rider'){
      var active=an==='walk', bob=active?Math.cos(w)*0.65:Math.sin(w)*0.12, legs=[];
      for(var k=0;k<4;k++){
        var front=k>1, phase=t+[0,0.12,0.49,0.61][k], f=active?foot(phase,17,3.3,0.37):pt(0,0);
        var hip=pt(front?5:-5,-7.9+bob),ankle=pt((front?5:-5)+f.x,f.y);
        legs.push({hip:hip,knee:ik(hip,ankle,5.1,5.1,front?1:-1),ankle:ankle});
      }
      return {body:pt(0,-9.7+bob),head:pt(9.5,-13.3+bob),rider:pt(-0.5,-17.9+bob),legs:legs,bob:bob,tail:Math.sin(w)*0.6,lean:active?0.7+0.16*Math.sin(w):0.1};
    }
    if(name==='cannon')return {recoil:an==='fire'?-1.2*Math.pow(Math.sin(Math.PI*Math.min(t*3,1)),2):0,flash:an==='fire'?Math.max(0,1-t*4):0,smoke:an==='fire'?Math.sin(Math.PI*t):0,progress:t};
    return {progress:t,rise:25*t,radius:3+10*t,opacity:Math.pow(Math.sin(Math.PI*t),0.8)};
  }
  function tint(hex,v){var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return 'rgb('+[r,g,b].map(function(c){return Math.round(v>=0?c+(255-c)*v:c*(1+v));}).join(',')+')';}
  function shade(ctx,x,y,rx,ry,color,far,high){
    var g=ctx.createLinearGradient(x-rx*0.75,y-ry*0.7,x+rx,y+ry*0.45),d=far?-0.21:0;
    g.addColorStop(0,tint(color,high?0.3+d:0.2+d));
    if(high){g.addColorStop(0.27,tint(color,0.12+d));g.addColorStop(0.62,tint(color,-0.06+d));}
    g.addColorStop(1,tint(color,-0.4+d));return g;
  }
  function oval(c,x,y,rx,ry,color,far,high,rot){
    c.save();c.translate(x,y);c.rotate(rot||0);c.fillStyle=shade(c,0,0,rx,ry,color,far,high);c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);c.fill();c.restore();
  }
  function segment(c,a,b,r1,r2,col,far,high){
    var dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(dy,dx)-Math.PI/2);
    c.fillStyle=shade(c,0,len*0.4,Math.max(r1,r2),len*0.6,col,far,high);
    c.beginPath();c.moveTo(-r1,0);c.bezierCurveTo(-r1,-r1*1.4,r1,-r1*1.4,r1,0);c.lineTo(r2,len);c.bezierCurveTo(r2,len+r2*1.3,-r2,len+r2*1.3,-r2,len);c.closePath();c.fill();c.restore();
  }
  function line(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(function(p,i){if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);});c.stroke();}
  function shadow(c,rx,high,x){
    c.save();c.translate(x||0,0.65);c.scale(1,0.27);
    if(high){var g=c.createRadialGradient(-1,0,0,0,0,rx);g.addColorStop(0,'rgba(0,0,0,.32)');g.addColorStop(0.6,'rgba(0,0,0,.14)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;}
    else c.fillStyle='rgba(0,0,0,.18)';
    c.beginPath();c.ellipse(0,0,rx,rx,0,0,TAU);c.fill();c.restore();
  }
  function hand(c,p,s,col,far,h){oval(c,p.x,p.y,s,s*1.3,col,far,h,-0.2);if(h)for(var i=0;i<3;i++)oval(c,p.x+(i-1)*s*0.42,p.y+s*0.8,s*0.22,s*0.58,col,far,h,-0.15);}
  function titanArm(c,a,r,far,h){var thick=r.baby?1.1:r.muscle?1.65:r.hunch?1:0.95;segment(c,a.shoulder,a.elbow,thick*1.3,thick,r.skin,far,h);segment(c,a.elbow,a.hand,thick,thick*0.6,r.skin,far,h);hand(c,a.hand,thick*0.85,r.skin,far,h);if(r.muscle)line(c,[add(a.shoulder,-0.25,0),add(a.elbow,-0.25,0),a.hand],'#e5bca0',0.25);}
  function titanLeg(c,l,r,far,h){var thick=r.baby?1.4:r.muscle?2:r.belly?1.65:1.25;segment(c,l.hip,l.knee,thick,thick*0.8,r.skin,far,h);segment(c,l.knee,l.ankle,thick*0.8,thick*0.48,r.skin,far,h);oval(c,l.ankle.x+0.7,l.ankle.y-0.1,thick*1.25,thick*0.53,r.skin,far,h);if(r.muscle)line(c,[add(l.hip,0.1,0),l.knee,l.ankle],'#e6bca2',0.3);}
  function titanHead(c,p,r,back,h){
    var x=p.x,y=p.y,rx=r.rx,ry=r.ry;
    oval(c,x,y,rx,ry,r.skin,false,h,-0.08);
    oval(c,x-rx*0.65,y+0.2,rx*0.27,ry*0.31,r.skin,true,h);
    if(back){
      if(r.hair){oval(c,x-0.4,y-ry*0.48,rx*0.94,ry*0.61,'#514138',false,h);}
      else if(h)line(c,[pt(x-0.4,y+ry*0.3),pt(x-0.5,y+ry*0.8)],tint(r.skin,-0.18),0.3);
      return;
    }
    if(r.hair){oval(c,x-0.5,y-ry*0.66,rx*0.86,ry*0.43,'#514138',false,h,-0.22);}
    // Rightward nose and offset facial plane remain legible at tiny sizes.
    oval(c,x+rx*0.88,y+0.1,rx*0.32,ry*0.23,r.muscle?'#e3c6a8':r.skin,false,h,-0.2);
    var eyeY=y-ry*0.18;
    oval(c,x+rx*0.06,eyeY,rx*0.22,ry*0.16,r.muscle?'#382c2a':'#6c493b',true,false,0.1);
    oval(c,x+rx*0.66,eyeY-0.07,rx*0.13,ry*0.13,'#604032',true,false);
    if(!r.muscle){
      oval(c,x+rx*0.12,eyeY-0.06,rx*0.11,ry*0.085,'#eee0c9',false,false);
      oval(c,x+rx*0.16,eyeY,rx*0.047,ry*0.078,'#352c28',false,false);
      var mw=rx*(r.jaw?0.94:0.76),my=y+ry*0.47;
      oval(c,x+rx*0.34,my,mw,ry*(r.jaw?0.31:0.22),'#51372e',false,false,-0.09);
      oval(c,x+rx*0.37,my-ry*0.035,mw*0.88,ry*0.1,'#eee0c4',false,h,-0.09);
      if(h){for(var i=0;i<5;i++)line(c,[pt(x-rx*0.17+i*rx*0.24,my-0.24),pt(x-rx*0.15+i*rx*0.24,my+0.12)],'#987862',0.12);}
      oval(c,x-rx*0.15,y+ry*0.19,rx*0.28,ry*0.22,r.skin,false,h);
    }else{
      oval(c,x+rx*0.24,y+ry*0.56,rx*0.72,ry*0.23,'#e4c6a6',false,h);
      line(c,[pt(x-rx*0.25,y+ry*0.56),pt(x+rx*0.82,y+ry*0.52)],'#65504a',0.24);
      line(c,[pt(x+rx*0.36,y),pt(x+rx*0.22,y+ry*0.28),pt(x+rx*0.58,y+ry*0.28)],'#673f38',0.35);
      for(var j=0;j<4;j++)line(c,[pt(x-rx*0.52+j*rx*0.36,y-ry*0.82),pt(x-rx*0.45+j*rx*0.35,y-ry*0.4)],'#e4b99c',0.32);
    }
  }
  function titan(c,name,an,t,view,h){
    var r=rigs[name],p=pose(name,an,t),back=view==='b';shadow(c,r.quad?12:r.torso+4,h);
    titanArm(c,p.arms[0],r,true,h);titanLeg(c,p.legs[0],r,true,h);titanLeg(c,p.legs[1],r,false,h);
    segment(c,p.hip,p.chest,r.torso*0.72,r.torso,r.skin,false,h);
    var tx=mix(p.hip.x,p.chest.x,0.44),ty=mix(p.hip.y,p.chest.y,0.44);
    oval(c,tx,ty,r.torso*(r.belly?1.18:0.93),r.belly?5.8:r.quad?3.7:(r.chest-r.hip)*0.52,r.skin,false,h,r.quad?-1.25:-0.1);
    if(h&&!r.quad){oval(c,p.chest.x-0.9,p.chest.y+0.3,r.torso*0.58,1.5,r.skin,false,h,-0.15);}
    segment(c,add(p.chest,0,-0.3),add(p.head,0,r.ry*0.6),r.torso*0.5,r.rx*0.54,r.skin,false,h);
    if(r.muscle){
      for(var k=0;k<5;k++){
        var yy=p.chest.y+1.2+k*1.6;
        line(c,[pt(p.chest.x-r.torso*0.65,yy-0.5),pt(p.chest.x,yy+0.5),pt(p.chest.x+r.torso*0.65,yy-0.4)],'#e3b399',h?0.32:0.24);
      }
      line(c,[p.chest,p.hip],'#f0cfb1',0.35);
    }
    titanHead(c,p.head,r,back,h);titanArm(c,p.arms[1],r,false,h);
    if(r.muscle){c.save();c.globalAlpha=0.16;for(var j=0;j<3;j++){var q=cycle(t+j/3);oval(c,-5+j*5+Math.sin(q*TAU),-35-q*12,1+q*1.3,3+q*1.4,'#e1d8c4',false,false);}c.restore();}
  }
  function lying(c,t,h){
    var p=pose('titanLying','idle',t),r={skin:'#d7ad91',baby:false,hunch:true,rx:3.7,ry:3.9};shadow(c,17,h,-1);
    titanLeg(c,p.legs[1],r,true,h);titanArm(c,p.arms[1],r,true,h);
    segment(c,p.hip,p.chest,1.6,2.6,r.skin,false,h);oval(c,1,-4.1-p.breath,4.4,2.6,r.skin,false,h);
    titanLeg(c,p.legs[0],r,false,h);titanHead(c,p.head,r,false,h);titanArm(c,p.arms[0],r,false,h);
  }
  function person(c,p,col,back,h,cap,carry,pull){
    var skin='#d8b393',pants='#4c4942';
    function arm(a,far){segment(c,a.shoulder,a.elbow,0.65,0.45,col,far,h);segment(c,a.elbow,a.hand,0.46,0.3,col,far,h);oval(c,a.hand.x,a.hand.y,0.36,0.43,skin,far,h);}
    function leg(l,far){segment(c,l.hip,l.knee,0.62,0.45,pants,far,h);segment(c,l.knee,l.ankle,0.45,0.31,pants,far,h);oval(c,l.ankle.x+0.3,l.ankle.y-0.12,0.66,0.34,'#3b3029',far,h);}
    arm(p.arms[0],true);leg(p.legs[0],true);leg(p.legs[1],false);
    segment(c,p.hip,p.chest,1.25,1.15,col,false,h);oval(c,p.hip.x,p.hip.y-0.3,1.28,1.25,col,false,h);
    oval(c,p.head.x,p.head.y,1.05,1.25,skin,false,h,-0.1);
    if(!back){oval(c,p.head.x+0.9,p.head.y+0.15,0.35,0.32,skin,false,h);oval(c,p.head.x+0.55,p.head.y-0.1,0.13,0.14,'#4a392f',false,false);}
    if(cap){oval(c,p.head.x-0.1,p.head.y-0.65,1.16,0.7,cap,false,h);if(cap==='#e7dcc0')segment(c,add(p.head,-0.65,-0.2),add(p.chest,-0.8,0.5),0.55,0.65,cap,false,h);else oval(c,p.head.x+0.45,p.head.y-0.55,1.15,0.23,cap,false,h);}
    var near=p.arms[1];
    if(carry)near={shoulder:near.shoulder,elbow:add(p.chest,2,1.1),hand:add(p.chest,2.9,-0.1)};
    if(pull)near={shoulder:near.shoulder,elbow:add(p.chest,-1.6,1.2),hand:add(p.chest,-3.4,2.5)};
    arm(near,false);
  }
  function cart(c,t,an,h){
    oval(c,-7.8,-1.1,2.25,2.25,'#4b3c2c',true,h);segment(c,pt(-11,-4),pt(-5,-3.6),0.65,0.65,'#94734b',false,h);
    c.fillStyle=shade(c,-8,-4.5,4,2,'#7a5a3c',false,h);c.beginPath();c.moveTo(-12,-6);c.lineTo(-5,-6);c.lineTo(-5.3,-2.4);c.lineTo(-11,-2.4);c.closePath();c.fill();
    oval(c,-9,-6,2.4,1.4,'#b2a487',false,h);oval(c,-6.7,-6.2,1.6,1.6,'#807d67',false,h);
    line(c,[pt(-10.5,-3.3),pt(-1,-4.1)],'#aa8b60',0.45);
    oval(c,-8,-1.1,2.25,2.25,'#866840',false,h);oval(c,-8,-1.1,1.67,1.67,'#342f27',false,h);
    var a=an==='idle'?0:t*TAU*(an==='run'?0.375:0.25);for(var j=0;j<8;j++){var z=a+j*Math.PI/4;line(c,[pt(-8,-1.1),pt(-8+Math.cos(z)*1.75,-1.1+Math.sin(z)*1.75)],'#ab8c5d',0.24);}oval(c,-8,-1.1,0.38,0.38,'#b69a70',false,h);
  }
  function civilians(c,name,an,t,view,h){
    var p=pose(name,an,t),back=view==='b';shadow(c,name==='civ4'?9:6,h,name==='civ4'?-4:0);
    if(name==='civ4')cart(c,t,an,h);
    if(name==='civ1'||name==='civ2'){
      c.save();c.translate(-3.7,-0.7);if(name==='civ2')c.scale(0.64,0.64);person(c,p.people[1],name==='civ2'?'#a65a3a':'#5d7c95',back,h,'#e7dcc0');c.restore();
      if(name==='civ2')line(c,[pt(-1.8,-4.8),pt(0.2,-5.4)],'#ccac8b',0.48);
    }
    if(name==='civ3'){oval(c,-1.5,-8+p.bundleBob,2.5,2.85,'#a49770',false,h,-0.3);line(c,[pt(-3.5,-9),pt(0,-6)],'#695d45',0.24);}
    person(c,p.people[0],name==='civ1'?'#7a5a3c':name==='civ2'?'#5d7c95':name==='civ3'?'#a65a3a':'#e7dcc0',back,h,name==='civ3'?'#e7dcc0':'#65543d',name==='civ3',name==='civ4');
    if(name==='civ3'){oval(c,3,-7+p.bundleBob,2.2,2.2,'#c3b48d',false,h);line(c,[pt(1.7,-8.7),pt(3.7,-5.4)],'#78694b',0.3);}
  }
  function horse(c,an,t,view,h){
    var p=pose('rider',an,t),col='#82644b',back=view==='b';shadow(c,12,h);
    function leg(l,far){segment(c,l.hip,l.knee,0.9,0.52,col,far,h);segment(c,l.knee,l.ankle,0.5,0.28,col,far,h);oval(c,l.ankle.x+0.25,l.ankle.y-0.1,0.7,0.45,'#312e2a',far,h);}
    leg(p.legs[0],true);leg(p.legs[2],true);
    line(c,[pt(-7,-10+p.bob),pt(-10,-9+p.bob),pt(-11.5,-5+p.tail)],'#3c322a',1.3);
    oval(c,p.body.x,p.body.y,7,3.15,col,false,h,-0.03);oval(c,-4.6,-9.3+p.bob,2.8,3.3,col,false,h);
    segment(c,pt(4,-10+p.bob),pt(7.7,-14+p.bob),2.6,1.65,col,false,h);
    oval(c,p.head.x,p.head.y,2.7,1.5,col,false,h,0.48);oval(c,11.5,-12.3+p.bob,1.1,1,'#a38b70',false,h);
    segment(c,pt(7.8,-14.5+p.bob),pt(7.4,-17+p.bob),0.6,0.14,col,false,h);
    line(c,[pt(6.7,-15+p.bob),pt(4.3,-11+p.bob)],'#342d27',1.1);
    oval(c,9.7,-13.8+p.bob,0.23,0.25,'#282722',false,false);
    leg(p.legs[1],false);leg(p.legs[3],false);
    oval(c,-0.3,-12+p.bob,3.1,0.85,'#44382b',false,h);
    segment(c,pt(0,-14+p.bob),pt(2,-10+p.bob),0.95,0.7,'#d6c8a8',false,h);segment(c,pt(2,-10+p.bob),pt(1,-7.7+p.bob),0.65,0.55,'#44382e',false,h);
    var x=p.rider.x,y=p.rider.y;
    segment(c,pt(x,-12.6+p.bob),pt(x+p.lean,y+2),1.8,1.4,'#6a7954',false,h);
    c.fillStyle=shade(c,x-1,y+3,3,4,'#496449',false,h);c.beginPath();c.moveTo(x+1,y+1);c.quadraticCurveTo(x-1,y+0.4,x-2,y+2);c.quadraticCurveTo(x-3.7,y+5,x-5.3,y+5.3+Math.sin(t*TAU)*0.5);c.quadraticCurveTo(x-1.8,y+7,x+1.2,y+4.5);c.closePath();c.fill();
    segment(c,pt(x+1,y+2),pt(4,-13+p.bob),0.63,0.4,'#687952',false,h);
    line(c,[pt(4,-13+p.bob),pt(9,-12.9+p.bob)],'#c7b797',0.2);
    oval(c,x+p.lean,y,1.35,1.5,back?'#56714d':'#d5b697',false,h);
    oval(c,x+p.lean-0.4,y-0.65,1.32,1.1,'#4d694b',false,h,-0.2);
    if(!back)oval(c,x+p.lean+1,y+0.15,0.4,0.4,'#d5b697',false,h);
  }
  function cannon(c,an,t,h){
    var p=pose('cannon',an,t);shadow(c,11,h);
    c.save();c.translate(-7,0);c.scale(0.88,0.88);person(c,human(civilianRig(),'idle',t),'#9c7853',false,h,'#9e7753');c.restore();
    oval(c,-1,-2,2.7,2.7,'#403b31',true,h);
    segment(c,pt(-3,-3),pt(3,-3),1.3,0.8,'#7d5b38',false,h);
    segment(c,pt(-4+p.recoil,-5.4),pt(7+p.recoil,-7.2),2,1.35,'#526166',false,h);
    oval(c,7+p.recoil,-7.2,0.65,1.35,'#222b2c',false,h,0.17);
    oval(c,-2,-1.3,3,3,'#8e704a',false,h);oval(c,-2,-1.3,2.25,2.25,'#36362f',false,h);
    for(var j=0;j<6;j++){var a=j*TAU/6;line(c,[pt(-2,-1.3),pt(-2+Math.cos(a)*2.3,-1.3+Math.sin(a)*2.3)],'#b19360',0.35);}oval(c,-2,-1.3,0.55,0.55,'#c1a071',false,h);
    if(p.flash){c.save();c.globalAlpha=p.flash;c.fillStyle='#f2a344';c.beginPath();c.moveTo(8,-7);c.lineTo(13,-11);c.lineTo(12,-8);c.lineTo(18,-8);c.lineTo(13,-6.5);c.lineTo(15,-3.5);c.closePath();c.fill();oval(c,10,-7,3.2,1.2,'#fff0b0',false,h);c.restore();}
    if(p.smoke){c.save();c.globalAlpha=p.smoke*0.46;for(var k=0;k<4;k++)oval(c,10+k*1.7+t*5,-8-k*0.9-t*5,1.4+t*3,1.5+t*2,'#c8c4b3',false,h);c.restore();}
  }
  function steam(c,t,h){
    var p=pose('steam','puff',t);c.save();c.globalAlpha=p.opacity*0.56;
    for(var i=0;i<7;i++){var a=i*2.4,x=Math.sin(a)*p.radius*0.55+Math.sin(t*TAU+i)*1.1,y=-3-p.rise*(0.48+i*0.075);oval(c,x,y,p.radius*(0.4+(i%3)*0.1),p.radius*(0.5+(i%2)*0.16),'#e7e1d1',i%3===0,h);}
    c.restore();
  }
  function bounds(name,an){
    if(name==='steam')return [-16,-36,16,3];
    if(name==='titanLying')return [-20,-11,18,6];
    if(name==='rider')return [-15,-22,17,4];
    if(name==='cannon')return an==='fire'?[-12,-20,24,4]:[-12,-12,10,4];
    if(name.indexOf('civ')===0)return [name==='civ4'?-15:-8,-13,8,4];
    if(name==='wallTitan')return [-14,-54,12,4];
    var r=rigs[name],left=r.quad?-14:r.belly?-10:-9,right=r.quad?16:r.hunch?14:r.belly?11:r.baby?11:10;
    if(an==='idle'&&!r.quad){left=-Math.ceil(r.torso+4.5);right=Math.ceil(Math.max(r.torso+4.5,r.lean+r.rx+2));}
    return [left,-(an==='reach'?Math.max(r.h+1,r.chest+r.arm*1.25+4):r.h+2),an==='reach'?(r.quad?19:16):right,4];
  }
  function pack(items,max){
    var best=null;
    for(var width=Math.min(max,512);width<=max;width+=128){
      var x=0,y=0,row=0,out=[];
      for(var i=0;i<items.length;i++){
        var it=items[i];if(it.w>width){y=max+1;break;}if(x+it.w>width){y+=row;x=0;row=0;}
        out.push({item:it,x:x,y:y});x+=it.w;row=Math.max(row,it.h);
      }
      var height=y+row;if(height<=max&&(!best||width*height<best.w*best.h))best={w:width,h:height,positions:out};
    }
    if(!best)throw new Error('Atlas exceeds '+max+'px budget at this unit');return best;
  }
  function buildAtlas(options){
    options=options||{};var high=options.quality!=='low',unit=Number(options.unit)|| (high?3:1.6);
    if(!(unit>0&&Number.isFinite(unit)))throw new Error('unit must be positive');
    var items=[],frames={},fps={},pad=2;
    Object.keys(sprites).forEach(function(name){frames[name]={};fps[name]={};Object.keys(sprites[name].anims).forEach(function(an){
      var spec=sprites[name].anims[an],n=!high&&spec.frames===12&&an!=='puff'?8:spec.frames,b=bounds(name,an);frames[name][an]={};fps[name][an]=spec.fps*n/spec.frames;
      spec.views.forEach(function(view){frames[name][an][view]=new Array(n);for(var i=0;i<n;i++)items.push({name:name,an:an,view:view,i:i,n:n,b:b,w:Math.ceil((b[2]-b[0])*unit)+pad*2,h:Math.ceil((b[3]-b[1])*unit)+pad*2});});
    });});
    items.sort(function(a,b){return b.h-a.h||b.w-a.w;});var packed=pack(items,high?2048:1024);
    var make=options.createCanvas||function(w,h){if(typeof document!=='undefined'){var el=document.createElement('canvas');el.width=w;el.height=h;return el;}if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);throw new Error('buildAtlas requires createCanvas outside a browser');};
    var canvas=make(packed.w,packed.h);canvas.width=packed.w;canvas.height=packed.h;var c=canvas.getContext('2d');if(!c)throw new Error('A 2D canvas context is required');
    packed.positions.forEach(function(entry){var it=entry.item,ax=pad-it.b[0]*unit,ay=pad-it.b[1]*unit;
      frames[it.name][it.an][it.view][it.i]={x:entry.x,y:entry.y,w:it.w,h:it.h,ax:ax,ay:ay};
      c.save();c.beginPath();c.rect(entry.x,entry.y,it.w,it.h);c.clip();c.translate(entry.x+ax,entry.y+ay);c.scale(unit,unit);
      var t=it.i/it.n;
      if(rigs[it.name])titan(c,it.name,it.an,t,it.view,high);
      else if(it.name==='titanLying')lying(c,t,high);
      else if(it.name.indexOf('civ')===0)civilians(c,it.name,it.an,t,it.view,high);
      else if(it.name==='rider')horse(c,it.an,t,it.view,high);
      else if(it.name==='cannon')cannon(c,it.an,t,high);
      else steam(c,t,high);
      c.restore();
    });
    return {canvas:canvas,unit:unit,frames:frames,fps:fps};
  }
  root.Puppets={SPEC:SPEC,pose:pose,buildAtlas:buildAtlas};
})(typeof globalThis!=='undefined'?globalThis:this);
