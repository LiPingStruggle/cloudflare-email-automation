export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-auth',
    };
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok',
        service: 'Cloudflare Temp Email Worker',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create temp email address
    if (path === '/api/new' && request.method === 'GET') {
      const prefix = url.searchParams.get('prefix') || url.searchParams.get('name');
      const name = prefix || Math.random().toString(36).substring(2, 10);
      const address = `${name}@joyful.dpdns.org`;
      
      return new Response(JSON.stringify({
        success: true,
        address,
        message: 'Email address created successfully',
        warning: 'This is a demo implementation. For production, use KV storage.'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Webhook for Email Routing
    if (path === '/webhook' && request.method === 'POST') {
      try {
        const email = await request.json();
        console.log('Received email:', JSON.stringify(email));
        
        // Extract verification code (customize based on email format)
        // This is where you'd parse the email to get verification codes
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Email received successfully'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }
    
    // Get emails (demo)
    if (path === '/api/mails' && request.method === 'GET') {
      const address = url.searchParams.get('address');
      
      return new Response(JSON.stringify({
        success: true,
        address,
        count: 0,
        mails: [],
        message: 'Demo mode - no emails stored. Configure KV for production.'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Admin page
    if (path === '/admin') {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Temp Email Worker</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
    input, button { padding: 8px; margin: 5px; }
    button { background: #007acc; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Cloudflare Temp Email Worker</h1>
  
  <div class="section">
    <h2>Create Email Address</h2>
    <input type="text" id="prefix" placeholder="Custom prefix (optional)">
    <button onclick="createEmail()">Create</button>
    <div id="result"></div>
  </div>
  
  <div class="section">
    <h2>Check Emails</h2>
    <input type="email" id="address" placeholder="email@joyful.dpdns.org">
    <button onclick="checkEmails()">Check</button>
    <div id="emails"></div>
  </div>
  
  <script>
    async function createEmail() {
      const prefix = document.getElementById('prefix').value;
      const url = '/api/new' + (prefix ? '?prefix=' + encodeURIComponent(prefix) : '');
      const res = await fetch(url);
      const data = await res.json();
      document.getElementById('result').innerHTML = 
        '<p><strong>' + (data.success ? '✅ Success' : '❌ Error') + '</strong></p>' +
        '<p>Address: <code>' + (data.address || data.error) + '</code></p>';
    }
    
    async function checkEmails() {
      const address = document.getElementById('address').value;
      if (!address) return;
      const res = await fetch('/api/mails?address=' + encodeURIComponent(address));
      const data = await res.json();
      document.getElementById('emails').innerHTML = 
        '<p><strong>' + (data.success ? '✅ Found' : '❌ Error') + '</strong></p>' +
        '<p>Email count: ' + data.count + '</p>' +
        '<p><em>' + data.message + '</em></p>';
    }
  </script>
</body>
</html>`;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      error: 'Not Found',
      path,
      available_endpoints: ['/health', '/api/new', '/api/mails', '/webhook', '/admin']
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};