var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
var emailStore = /* @__PURE__ */ new Map();
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-auth"
    };
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (path === "/api/new" && method === "GET") {
      const name = url.searchParams.get("name") || Math.random().toString(36).substring(2, 10);
      const address = `${name}@joyful.dpdns.org`;
      if (!emailStore.has(address)) {
        emailStore.set(address, []);
      }
      return new Response(JSON.stringify({
        success: true,
        address,
        message: "Email created successfully"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (path === "/admin/new_address" && method === "POST") {
      let name = "";
      try {
        const body = await request.json();
        name = body.name || body.prefix || "";
      } catch (e) {
      }
      if (!name) name = Math.random().toString(36).substring(2, 10);
      const address = `${name}@joyful.dpdns.org`;
      if (!emailStore.has(address)) {
        emailStore.set(address, []);
      }
      return new Response(JSON.stringify({
        success: true,
        address,
        message: "Email created successfully"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (path === "/api/mails" && method === "GET") {
      const address = url.searchParams.get("address");
      if (!address) {
        return new Response(JSON.stringify({ error: "Missing address" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const emails = emailStore.get(address) || [];
      const recentEmails = emails.slice(-10).map((e) => ({
        from: e.from,
        subject: e.subject,
        content: e.text || e.html || "",
        received: e.timestamp
      }));
      return new Response(JSON.stringify({
        success: true,
        address,
        count: emails.length,
        mails: recentEmails
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (path === "/admin") {
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
<\/script>
</body></html>`, { headers: { "Content-Type": "text/html", ...corsHeaders } });
    }
    return new Response(JSON.stringify({ error: "Not Found", path }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  },
  // 接收邮件
  async email(message, env, ctx) {
    const from = message.from;
    const to = message.to;
    const subject = message.headers.get("subject") || "(No subject)";
    let text = "";
    try {
      text = await message.text();
    } catch (e) {
      text = "[Unable to read text]";
    }
    let html = "";
    try {
      html = await message.html();
    } catch (e) {
      html = "";
    }
    if (!emailStore.has(to)) {
      emailStore.set(to, []);
    }
    const emails = emailStore.get(to);
    emails.push({
      from,
      subject,
      text,
      html,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (emails.length > 20) {
      emails.splice(0, emails.length - 20);
    }
    console.log(JSON.stringify({
      type: "email_received",
      from,
      to,
      subject,
      text: text.substring(0, 200)
    }));
  }
};

// C:/Users/liyuanzhi/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/liyuanzhi/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-5W13QZ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/liyuanzhi/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-5W13QZ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
