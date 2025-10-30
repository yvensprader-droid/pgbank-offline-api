// A minimal PG Bank API implemented using only built‑in Node.js modules.
// This server implements the endpoints described in the provided OpenAPI spec
// without requiring any third‑party dependencies. It maintains in‑memory
// arrays for users, accounts and transactions. In production, these
// collections should be replaced with a persistent database.

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