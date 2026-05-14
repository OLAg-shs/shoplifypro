const jwt = require('jsonwebtoken');
const { supabase } = require('../supabaseClient');

// ── protect ───────────────────────────────────────────────────────────────────
// Validates JWT AND ensures the account is in 'active' status.
// Pending/rejected users are blocked even if they hold a valid token.
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, is_verified')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // 🔐 SECURITY: Block pending/rejected accounts even with valid JWT
    if (user.status !== 'active') {
      return res.status(403).json({
        message: `Account is ${user.status}. ${
          user.status === 'pending'
            ? 'Awaiting admin approval.'
            : 'Access denied.'
        }`,
        status: user.status,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE]', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

// ── authorize ────────────────────────────────────────────────────────────────
// Role-based access control. Call after protect().
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };