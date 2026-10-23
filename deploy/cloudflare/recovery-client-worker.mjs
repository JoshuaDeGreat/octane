const LEGACY_ORIGIN="https://octane.joshua-h1997.workers.dev";
async function boundedText(response) {
 const reader=response.body.getReader(),chunks=[];let bytes=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4194304){await reader.cancel();throw Error("Configuration too large");}chunks.push(value);}}finally{reader.releaseLock();}
 const output=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(output);
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 try {
 if(url.pathname.startsWith("/api/")){
  const target=new URL(url.pathname+url.search,env.API_ORIGIN);
  const upstream=await fetch(new Request(target,request),{redirect:"manual"});
  const headers=new Headers(upstream.headers);headers.set("cache-control","no-store");headers.set("referrer-policy","no-referrer");
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
 }
 const configuration=url.pathname.startsWith("/configuration/");
 const target=new URL(url.pathname+url.search,configuration?LEGACY_ORIGIN:env.CLIENT_ORIGIN);
 const response=configuration?await env.OCTANE.fetch(new Request(target,request)):await fetch(new Request(target,request),{redirect:"manual"});
 if(configuration&&response.ok&&request.method!=="HEAD"&&/json|javascript|text\//i.test(response.headers.get("content-type")||"")){
  const text=(await boundedText(response)).replaceAll(LEGACY_ORIGIN,url.origin).replaceAll("https://polaris-polaris-hotel.up.railway.app",env.API_ORIGIN);
  const headers=new Headers(response.headers);for(const name of ["content-length","content-encoding","etag"])headers.delete(name);headers.set("cache-control","no-store");
  return new Response(text,{status:response.status,headers});
 }
 const headers=new Headers(response.headers);headers.set("referrer-policy","no-referrer");
 if(url.pathname==="/"||url.pathname==="/index.html")headers.set("cache-control","no-store");
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }catch{return new Response("The hotel is temporarily unavailable. Please retry shortly.",{status:502,headers:{"content-type":"text/plain;charset=utf-8","cache-control":"no-store"}});}
}};