export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-auth',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', worker: 'bitter-brook-ba0a' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (path === '/api/new' && request.method === 'GET') {
      const name = url.searchParams.get('name') || Math.random().toString(36).substring(2, 10);
      const address = `${name}@joyful.dpdns.org`;
      return new Response(JSON.stringify({ success: true, address }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (path === '/api/mails' && request.method === 'GET') {
      const address = url.searchParams.get('address');
      return new Response(JSON.stringify({
        success: true,
        address,
        count: 0,
        mails: [],
        message: 'Emails logged to console via email() function'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (path === '/admin') {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Email Worker</title>
<style>body{font-family:Arial;padding:20px;}input,button{padding:8px;margin:5px;}button{background:#007acc;color:white;border:none;cursor:pointer;}</style>
</head><body>
<h1>Email Worker Admin</h1>
<div><input id="name" placeholder="prefix"><button onclick="create()">Create</button></div>
<div id="result"></div>
<script>
async function create(){
  const res=await fetch('/api/new?name='+document.getElementById('name').value);
  const d=await res.json();
  document.getElementById('result').innerHTML='<p>'+d.address+'</p>';
}
</script>
</body></html>`, { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
    }
    
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },
  
  // 处理邮件 - 只记录元数据
  async email(message, env, ctx) {
    const from = message.from;
    const to = message.to;
    const subject = message.headers.get('subject') || '(No subject)';
    
    // 记录邮件元数据
    console.log(JSON.stringify({
      type: 'email_received',
      from,
      to,
      subject,
      timestamp: new Date().toISOString(),
      note: 'Email received successfully, not bounced'
    }));
    
    // 不调用任何 reject 方法，邮件会被视为已处理
  }
};