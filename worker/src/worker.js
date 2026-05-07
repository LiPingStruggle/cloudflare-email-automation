export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-auth',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if ((url.pathname === '/api/new' && method === 'GET') || 
        (url.pathname === '/admin/new_address' && method === 'POST')) {
      let name = '';
      if (method === 'GET') {
        name = url.searchParams.get('name') || url.searchParams.get('prefix') || '';
      } else {
        try {
          const body = await request.json();
          name = body.name || body.prefix || '';
        } catch(e) {}
      }
      if (!name) name = Math.random().toString(36).substring(2, 10);
      const address = `${name}@joyful.dpdns.org`;
      try { await env.EMAIL_STORAGE.put(address, JSON.stringify([])); } catch(e) {}
      return new Response(JSON.stringify({ success: true, address }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (url.pathname === '/api/mails' && method === 'GET') {
      const address = url.searchParams.get('address') || '4c6zjhj47b@joyful.dpdns.org';
      let emails = [];
      try {
        const data = await env.EMAIL_STORAGE.get(address);
        if (data) emails = JSON.parse(data);
      } catch(e) {}
      
      if (emails.length === 0) {
        const keys = await env.EMAIL_STORAGE.list();
        for (const key of keys.keys) {
          try {
            const data = await env.EMAIL_STORAGE.get(key.name);
            if (data) {
              const ms = JSON.parse(data);
              emails = emails.concat(ms.map(m => ({ ...m, _address: key.name })));
            }
          } catch(e) {}
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        address,
        count: emails.length,
        mails: emails.slice(-10).map(e => ({
          from: e.from || 'unknown',
          subject: e.subject || '(No subject)',
          content: e.verificationCode || e.subject || '',
          received: e.timestamp || new Date().toISOString()
        }))
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    return new Response(JSON.stringify({ success: true, message: 'Worker running' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },
  
  async email(message, env, ctx) {
    const from = message.from;
    const to = message.to;
    const subject = message.headers.get('subject') || '(No subject)';
    
    console.log('Email received - From: ' + from + ', To: ' + to + ', Subject: ' + subject);
    
    // 直接从主题提取验证码（6位数字）
    let verificationCode = '';
    const codeMatch = subject.match(/(\d{6,})/);
    if (codeMatch) {
      verificationCode = codeMatch[1];
      console.log('Verification code extracted from subject: ' + verificationCode);
    }
    
    const emailData = { 
      from, 
      subject, 
      verificationCode,
      timestamp: new Date().toISOString() 
    };
    
    let emails = [];
    try {
      const data = await env.EMAIL_STORAGE.get(to);
      if (data) emails = JSON.parse(data);
    } catch(e) {}
    
    emails.push(emailData);
    if (emails.length > 20) emails = emails.slice(-20);
    
    try {
      await env.EMAIL_STORAGE.put(to, JSON.stringify(emails));
      console.log('Email saved for ' + to + ', code: ' + verificationCode);
    } catch(e) {
      console.log('KV write error: ' + e.message);
    }
  }
};