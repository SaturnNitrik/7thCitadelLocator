/* Author: Stephane 'Saturn' Demots */

// TODO
// save locally (or auto save ?)
// icon : numbers
// icons: leaf / skull / blueflag / star / a-Sword / a-Talk / 

const cICONOFFSET = 16;
const cMAPKEY = "map=";

var vCurrentTool = 0;
var vURLCode = "";
var vURLBase = "";
var mapHeight = (document.getElementById("idMap").style.height.substr(0,3))*1;
var mapWidth = (document.getElementById("idMap").style.width.substr(0,3))*1;
var mouseX =0
var mouseY =0
var rectHeightZ = 0
var rectWidthZ = 0
var vTimer=0;


function pageInit()
{
  // Default tool
  vCurrentTool = document.getElementById("flagp");

  // Load map
  let adr = window.location.href;
  let codeIdx = adr.search(cMAPKEY)+cMAPKEY.length;
  if(codeIdx > 5)
  {
    let code = adr.substring(codeIdx);
    fctLoadMap(code);
    vURLBase = adr.substring(0, codeIdx-(cMAPKEY.length+1));
  }
  else
  {
    vURLBase = adr;
  }
}

function fctSetTool(el)
{
  vCurrentTool = el.childNodes[0];
}

function fctLoadMap(seed)
{
  let i=0;
  let n,t,x,y;

  do
  {
    //Get item
    n = seed.substr(i,1);

    x = ((seed.substr(i+1,2))*1)/100*mapWidth;
    y = ((seed.substr(i+3,2))*1)/100*mapHeight;
    i+= 5;
    console.log("Item:" +n+":"+x+"."+y);
    switch(n)
    {
      case 'P': fctDrawItem(document.getElementById("flagp"),x,y); break;
      case 'Q': fctDrawItem(document.getElementById("flagb"),x,y); break;
      case 'S': fctDrawItem(document.getElementById("star"),x,y); break;
      case 'D': fctDrawItem(document.getElementById("death"),x,y); break;
      case 'A': fctDrawItem(document.getElementById("numb1"),x,y); break;
      case 'B': fctDrawItem(document.getElementById("numb2"),x,y); break;
      case 'C': fctDrawItem(document.getElementById("numb3"),x,y); break;
      case 'R':
      case 'B':
        if(n == 'R') t= "rectr";
        if(n == 'B') t= "rectb";
      
        let w = ((seed.substr(i,2))*1)/100*mapWidth;
        let h = ((seed.substr(i+2,2))*1)/100*mapHeight;
        i+= 4;
        fctDrawRect(document.getElementById(t),x,y,w,h);
        break;
      default: i = -1;
    }
  }while((i < seed.length) && (i>0));

  // no error, save the seed
  if(i>0)
  {
    vURLCode = seed;
    document.getElementById("idExportCode").value = cMAPKEY + vURLCode;
  }
}

function fctDrawItem(img, x,y)
{
  let canvas = document.getElementById("idCanvas");
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, x, y);

  fctUpdateURL(img.id, x, y);
}

function fctDrawRect(img,x,y,w,h)
{
  let canvas = document.getElementById("idCanvas");
  let ctx = canvas.getContext("2d");
  ctx.lineWidth = "2";
  
  if(img.id == "rectr")
    ctx.strokeStyle = "red";
  else
    ctx.strokeStyle = "blue";
  ctx.strokeRect(x, y, w, h);

  fctUpdateURL(img.id,x,y,w,h);
}

function fctClickDraw(ev)
{
  let tool = vCurrentTool.id.substr(0,4);
  
  if(tool != "rect")
  {
    fctDrawItem(vCurrentTool, ev.offsetX-cICONOFFSET,ev.offsetY-cICONOFFSET);
  }
  else 
  {
    let rect = document.getElementById("idRectTemplate");

    if( (((rect.style.height.replace("px",""))*1) < 5) || (((rect.style.width.replace("px",""))*1) < 5))
    {
      let rectColor;
      if(vCurrentTool.id == "rectr") rectColor='red';
      else rectColor='blue';

      rect.style.borderColor = rectColor;
      rect.classList.remove("clDisplayNone");
      rect.style.left = ev.offsetX + "px";
      rect.style.top = ev.offsetY + "px";
      rectHeightZ = ev.offsetY
      rectWidthZ = ev.offsetX
      rect.style.height = 1 + "px";
      rect.style.width = 1 + "px";

      document.onmousemove = handleMouseMove;
      if (vTimer != 0) clearInterval(vTimer);
      vTimer = setInterval(fctDrawRectangle, 20);
    }
    else
    {
      fctDrawRect(vCurrentTool,
                  rect.style.left.replace("px",""),
                  rect.style.top.replace("px",""),
                  rect.style.width.replace("px",""),
                  rect.style.height.replace("px",""));

      document.onmousemove = null;
      clearInterval(vTimer);
      vTimer = 0;

      rect.style.height = 1 + "px";
      rect.style.width = 1 + "px";
      rect.classList.add("clDisplayNone");
    }
  }
}

function fctDrawRectangle()
{
  let rect = document.getElementById("idRectTemplate");
  rect.style.height = mouseY - rectHeightZ - 10 + "px";
  rect.style.width = mouseX - rectWidthZ - 10 + "px";
}

function handleMouseMove(event)
{
  mouseX = event.offsetX
  mouseY = event.offsetY 
}


function fctBack()
{
  let i=0;
  let c;

  do
  {
    i++;
    c = (vURLCode.substr(vURLCode.length-i, 1));
  }while( (Number.isInteger(c*1)) && (i < vURLCode.length));
  
  if(i <= vURLCode.length)
  {
    vURLCode = vURLCode.substr(0, vURLCode.length-i);
    let e = document.getElementById("idExportCode");
    e.value = cMAPKEY +vURLCode;
    window.open(vURLBase + "?"+ e.value,"_self");
  }
  else
  {
    console.log("notFound");
  }
}

function fctUpdateURL(i,x,y,a,b)
{
  let code = fctGetItemCode(i)
  
  vURLCode+= code;
  vURLCode += (Math.round((x/mapWidth)*100)).pad(2);
  vURLCode += (Math.round((y/mapHeight)*100)).pad(2);
  
  if(a != undefined)
  {
    if((code == 'R') || (code == 'B'))
      vURLCode += (Math.round((a/mapWidth)*100)).pad(2);
  }

  if(b != undefined)
  {
    if((code == 'R') || (code == 'B'))
      vURLCode += (Math.round((b/mapHeight)*100)).pad(2);
  }

  document.getElementById("idExportCode").value = cMAPKEY +vURLCode;
  console.log("URL: " + vURLCode);
}

function fctGetItemCode(i)
{
  let r;

  switch(i)
  {
    case "flagp": r = 'P'; break;
    case "flagb": r = 'Q'; break;
    case "star": r = 'S'; break;
    case "death": r = 'D'; break;
    case "numb1": r = 'A'; break;
    case "numb2": r = 'B'; break;
    case "numb3": r = 'C'; break;
    case "rectr": r = 'R'; break;
    case "rectb": r = 'B'; break;
  }

  return r;
}

function fctExport()
{
  /* Get the text field */
  let copyText = document.getElementById("idExportCode");

  const el = document.createElement('textarea');
  el.value = vURLBase + "?"+ copyText.value;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand('copy');

  /* Alert the copied text */
  alert("Clipboard : " + el.value);

  document.body.removeChild(el);
}

function fctReset()
{
  window.open(vURLBase,"_self");
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}
