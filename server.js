// A minimal PG Bank API implemented using only built‑in Node.js modules.
// This server implements the endpoints described in the provided OpenAPI spec
// without requiring any third‑party dependencies. It maintains in‑memory
// arrays for users, accounts and transactions. In production, these
// collections should be replaced with a persistent database.
import { useState } from "react";
import { useState } from "react";

const STEPS = ["Name", "Contact", "Identity", "Security"];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    email: "", phone: "",
    dob: "", ssn: "", annual_income: "",
    address: "", apt_number: "",
    username: "", password: ""
  });
  const [errors, setErrors] = useState({});

  function handleChange(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  function validate(currentStep) {
    const f = form, e = {};
    if (currentStep === 0) {
      if (!f.first_name) e.first_name = "First name required";
      if (!f.last_name) e.last_name = "Last name required";
    }
    if (currentStep === 1) {
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) e.email = "Valid email required";
      if (!f.phone) e.phone = "Phone required";
    }
    if (currentStep === 2) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dob)) e.dob = "Use YYYY-MM-DD";
      if (!f.ssn) e.ssn = "Enter SSN";
      if (!f.annual_income) e.annual_income = "Enter annual income";
    }
    if (currentStep === 3) {
      if (!f.username) e.username = "Username required";
      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(f.password)) {
        e.password = "Min 8 chars, upper+lower+number+symbol";
      }
    }
    return e;
  }

  async function next() {
    const e = validate(step); setErrors(e);
    if (Object.keys(e).length === 0) setStep(step + 1);
  }

  function back() { setStep(step - 1); }

  async function finish() {
    const e = validate(step); setErrors(e);
    if (Object.keys(e).length) return;

    const r = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!r.ok) { alert("Sign up failed"); return; }
    const user = await r.json();

    // (Optional) immediately fetch a token
    await fetch(`${import.meta.env.VITE_API_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type:"password", username: form.email, password: form.password })
    });

    onComplete?.(user);
  }

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto", padding: 16, background: "#fff", borderRadius: 8 }}>
      <Progress step={step} />
      {step === 0 && <NameStep form={form} errors={errors} onChange={handleChange} />}
      {step === 1 && <ContactStep form={form} errors={errors} onChange={handleChange} />}
      {step === 2 && <IdentityStep form={form} errors={errors} onChange={handleChange} />}
      {step === 3 && <SecurityStep form={form} errors={errors} onChange={handleChange} />}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {step > 0 && <button onClick={back}>Back</button>}
        {step < STEPS.length - 1
          ? <button onClick={next}>Next</button>
          : <button onClick={finish}>Create account</button>}
      </div>
    </div>
  );
}

function Progress({ step }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <strong>Step {step + 1} of 4:</strong> {["Name","Contact","Identity","Security"][step]}
      <div style={{ height: 6, background: "#eee", borderRadius: 3, marginTop: 8 }}>
        <div style={{ width: `${((step+1)/4)*100}%`, height: "100%", background: "#0d47a1", borderRadius: 3 }} />
      </div>
    </div>
  );
}

function Field({ label, error, ...rest }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display:"block", marginBottom: 4 }}>{label}</label>
      <input {...rest} style={{ width:"100%", padding:8, border:"1px solid #ccc", borderRadius:6 }} />
      {error && <div style={{ color:"crimson", marginTop:4, fontSize:12 }}>{error}</div>}
    </div>
  );
}

function NameStep({ form, errors, onChange }) {
  return <>
    <Field label="First name" value={form.first_name} onChange={e=>onChange("first_name", e.target.value)} error={errors.first_name}/>
    <Field label="Middle name (optional)" value={form.middle_name} onChange={e=>onChange("middle_name", e.target.value)} />
    <Field label="Last name" value={form.last_name} onChange={e=>onChange("last_name", e.target.value)} error={errors.last_name}/>
  </>;
}
function ContactStep({ form, errors, onChange }) {
  return <>
    <Field label="Email" type="email" value={form.email} onChange={e=>onChange("email", e.target.value)} error={errors.email}/>
    <Field label="Phone" value={form.phone} onChange={e=>onChange("phone", e.target.value)} error={errors.phone}/>
    <Field label="Address" value={form.address} onChange={e=>onChange("address", e.target.value)} />
    <Field label="Apt / Unit" value={form.apt_number} onChange={e=>onChange("apt_number", e.target.value)} />
  </>;
}
function IdentityStep({ form, errors, onChange }) {
  return <>
    <Field label="Date of birth (YYYY-MM-DD)" value={form.dob} onChange={e=>onChange("dob", e.target.value)} error={errors.dob}/>
    <Field label="SSN" type="password" value={form.ssn} onChange={e=>onChange("ssn", e.target.value)} error={errors.ssn}/>
    <Field label="Annual income (USD)" type="number" step="0.01" value={form.annual_income} onChange={e=>onChange("annual_income", e.target.value)} error={errors.annual_income}/>
  </>;
}
function SecurityStep({ form, errors, onChange }) {
  return <>
    <Field label="Username" value={form.username} onChange={e=>onChange("username", e.target.value)} error={errors.username}/>
    <Field label="Password" type="password" value={form.password} onChange={e=>onChange("password", e.target.value)} error={errors.password}/>
  </>;
}

const STEPS = ["Name", "Contact", "Identity", "Security"];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    email: "", phone: "",
    dob: "", ssn: "", annual_income: "",
    address: "", apt_number: "",
    username: "", password: ""
  });
  const [errors, setErrors] = useState({});

  function handleChange(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  function validate(currentStep) {
    const f = form, e = {};
    if (currentStep === 0) {
      if (!f.first_name) e.first_name = "First name required";
      if (!f.last_name) e.last_name = "Last name required";
    }
    if (currentStep === 1) {
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) e.email = "Valid email required";
      if (!f.phone) e.phone = "Phone required";
    }
    if (currentStep === 2) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dob)) e.dob = "Use YYYY-MM-DD";
      if (!f.ssn) e.ssn = "Enter SSN";
      if (!f.annual_income) e.annual_income = "Enter annual income";
    }
    if (currentStep === 3) {
      if (!f.username) e.username = "Username required";
      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(f.password)) {
        e.password = "Min 8 chars, upper+lower+number+symbol";
      }
    }
    return e;
  }

  async function next() {
    const e = validate(step); setErrors(e);
    if (Object.keys(e).length === 0) setStep(step + 1);
  }

  function back() { setStep(step - 1); }

  async function finish() {
    const e = validate(step); setErrors(e);
    if (Object.keys(e).length) return;

    const r = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!r.ok) { alert("Sign up failed"); return; }
    const user = await r.json();

    // (Optional) immediately fetch a token
    await fetch(`${import.meta.env.VITE_API_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type:"password", username: form.email, password: form.password })
    });

    onComplete?.(user);
  }

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto", padding: 16, background: "#fff", borderRadius: 8 }}>
      <Progress step={step} />
      {step === 0 && <NameStep form={form} errors={errors} onChange={handleChange} />}
      {step === 1 && <ContactStep form={form} errors={errors} onChange={handleChange} />}
      {step === 2 && <IdentityStep form={form} errors={errors} onChange={handleChange} />}
      {step === 3 && <SecurityStep form={form} errors={errors} onChange={handleChange} />}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {step > 0 && <button onClick={back}>Back</button>}
        {step < STEPS.length - 1
          ? <button onClick={next}>Next</button>
          : <button onClick={finish}>Create account</button>}
      </div>
    </div>
  );
}

function Progress({ step }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <strong>Step {step + 1} of 4:</strong> {["Name","Contact","Identity","Security"][step]}
      <div style={{ height: 6, background: "#eee", borderRadius: 3, marginTop: 8 }}>
        <div style={{ width: `${((step+1)/4)*100}%`, height: "100%", background: "#0d47a1", borderRadius: 3 }} />
      </div>
    </div>
  );
}

function Field({ label, error, ...rest }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display:"block", marginBottom: 4 }}>{label}</label>
      <input {...rest} style={{ width:"100%", padding:8, border:"1px solid #ccc", borderRadius:6 }} />
      {error && <div style={{ color:"crimson", marginTop:4, fontSize:12 }}>{error}</div>}
    </div>
  );
}

function NameStep({ form, errors, onChange }) {
  return <>
    <Field label="First name" value={form.first_name} onChange={e=>onChange("first_name", e.target.value)} error={errors.first_name}/>
    <Field label="Middle name (optional)" value={form.middle_name} onChange={e=>onChange("middle_name", e.target.value)} />
    <Field label="Last name" value={form.last_name} onChange={e=>onChange("last_name", e.target.value)} error={errors.last_name}/>
  </>;
}
function ContactStep({ form, errors, onChange }) {
  return <>
    <Field label="Email" type="email" value={form.email} onChange={e=>onChange("email", e.target.value)} error={errors.email}/>
    <Field label="Phone" value={form.phone} onChange={e=>onChange("phone", e.target.value)} error={errors.phone}/>
    <Field label="Address" value={form.address} onChange={e=>onChange("address", e.target.value)} />
    <Field label="Apt / Unit" value={form.apt_number} onChange={e=>onChange("apt_number", e.target.value)} />
  </>;
}
function IdentityStep({ form, errors, onChange }) {
  return <>
    <Field label="Date of birth (YYYY-MM-DD)" value={form.dob} onChange={e=>onChange("dob", e.target.value)} error={errors.dob}/>
    <Field label="SSN" type="password" value={form.ssn} onChange={e=>onChange("ssn", e.target.value)} error={errors.ssn}/>
    <Field label="Annual income (USD)" type="number" step="0.01" value={form.annual_income} onChange={e=>onChange("annual_income", e.target.value)} error={errors.annual_income}/>
  </>;
}
function SecurityStep({ form, errors, onChange }) {
  return <>
    <Field label="Username" value={form.username} onChange={e=>onChange("username", e.target.value)} error={errors.username}/>
    <Field label="Password" type="password" value={form.password} onChange={e=>onChange("password", e.target.value)} error={errors.password}/>
  </>;
}


const http = require('http');
const { randomUUID } = require('crypto');

// In‑memory data stores
const users = [];
const accounts = [];
const transactions = [];

/**
 * Utility to parse JSON bodies. Collects chunks from the request and
 * attempts to parse them as JSON. Invokes the callback with an error
 * if the JSON is malformed.
 * @param {IncomingMessage} req
 * @param {function(Error|null, Object=)} callback
 */
function parseJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    if (!body) {
      return callback(null, {});
    }
    try {
      const json = JSON.parse(body);
      callback(null, json);
    } catch (err) {
      callback(err);
    }
  });
}

/**
 * Send a JSON response with the given status code and payload.
 * @param {ServerResponse} res
 * @param {number} status
 * @param {Object} payload
 */
function sendJson(res, status, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

/**
 * Main request handler. Dispatches requests based on method and path.
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;

  // Handle signup
  if (req.method === 'POST' && pathname === '/signup') {
    return parseJsonBody(req, (err, body) => {
      if (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      const { name, email, phone, password } = body;
      if (!name || !email || !phone || !password) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const user = {
        id: randomUUID(),
        name,
        email,
        phone,
        kyc_status: 'pending',
      };
      users.push(user);
      return sendJson(res, 201, user);
    });
  }

  // Handle OAuth token generation (stub)
  if (req.method === 'POST' && pathname === '/oauth/token') {
    return parseJsonBody(req, (err, body) => {
      if (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      // In a real implementation, validate grant_type and credentials
      const token = randomUUID();
      return sendJson(res, 200, { access_token: token, token_type: 'Bearer' });
    });
  }

  // Handle accounts creation
  if (req.method === 'POST' && pathname === '/accounts') {
    return parseJsonBody(req, (err, body) => {
      if (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      const { user_id, name, currency } = body;
      if (!user_id || !name) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const account = {
        id: randomUUID(),
        user_id,
        name,
        currency: currency || 'USD',
        balance: 0,
      };
      accounts.push(account);
      return sendJson(res, 201, account);
    });
  }

  // Handle list accounts
  if (req.method === 'GET' && pathname === '/accounts') {
    return sendJson(res, 200, accounts);
  }

  // Handle get account by ID
  if (req.method === 'GET' && pathname.startsWith('/accounts/')) {
    const parts = pathname.split('/');
    const id = parts[2];
    const account = accounts.find(acc => acc.id === id);
    if (!account) {
      return sendJson(res, 404, { error: 'Account not found' });
    }
    return sendJson(res, 200, account);
  }

  // Handle transfers
  if (req.method === 'POST' && pathname === '/transfers') {
    return parseJsonBody(req, (err, body) => {
      if (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      const { from_account_id, to_account_id, amount } = body;
      if (!from_account_id || !to_account_id || !amount) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const transferId = randomUUID();
      const transaction = {
        id: transferId,
        type: 'transfer',
        from_account_id,
        to_account_id,
        amount,
        status: 'queued',
      };
      transactions.push(transaction);
      return sendJson(res, 201, { transfer_id: transferId, status: 'queued' });
    });
  }

  // Handle card authorization
  if (req.method === 'POST' && pathname === '/payments/card/authorize') {
    return parseJsonBody(req, (err, body) => {
      if (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
      const { card_token, terminal_id, amount } = body;
      if (!card_token || !terminal_id || !amount) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      return sendJson(res, 200, {
        auth_id: randomUUID(),
        approved: true,
        hold_amount: amount,
      });
    });
  }

  // Handle list transactions
  if (req.method === 'GET' && pathname === '/transactions') {
    const accountId = searchParams.get('account_id');
    let result = transactions;
    if (accountId) {
      result = transactions.filter(t => t.from_account_id === accountId || t.to_account_id === accountId);
    }
    return sendJson(res, 200, result);
  }

  // Default 404 for unknown routes
  sendJson(res, 404, { error: 'Not found' });
}

// Create and start the HTTP server
const PORT = process.env.PORT || 4000;
const server = http.createServer(requestHandler);
server.listen(PORT, () => {
  console.log(`PG Bank API (no deps) listening on port ${PORT}`);
});
// In Dashboard.jsx (web)
import { useEffect } from "react";

useEffect(() => {
  const id = setInterval(async () => {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/alerts?user_id=${user.id}`);
    if (!r.ok) return;
    const pending = await r.json();
    pending.forEach(a => {
      // Replace with your toast lib
      alert(`[${a.type}] ${a.message}`);
    });
  }, 5000);
  return () => clearInterval(id);
}, [user.id]);
// GET /alerts?user_id=...
// return and clear pending alerts for the user (for in-app toasts)
if (req.method === 'GET' && pathname === '/alerts') {
  const userId = searchParams.get('user_id');
  const out = alerts.filter(a => a.userId === userId);
  // optional: clear after read
  for (let i = alerts.length - 1; i >= 0; i--) if (alerts[i].userId === userId) alerts.splice(i,1);
  return sendJson(res, 200, out);
}

// POST /alerts/subscribe (store email/phone/push tokens — simple)
if (req.method === 'POST' && pathname === '/alerts/subscribe') {
  return parseJsonBody(req, (err, body) => {
    if (err) return sendJson(res, 400, { error: 'Invalid JSON' });
    // save { user_id, email?, phone?, expoPushToken? } to memory (or DB)
    // subscribers.push(body)
    return sendJson(res, 204, {});
  });
}
