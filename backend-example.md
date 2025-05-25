# Backend API Implementation Example

This is an example of how to implement the backend API for the subscription system. You can use any backend framework (Node.js/Express, Python/FastAPI, etc.).

## Required Endpoints

### 1. Check Subscription Status
```javascript
// GET /api/subscription/status
app.get('/api/subscription/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check with Stripe or your payment processor
    const subscription = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1
    });

    const isActive = subscription.data.length > 0;
    
    res.json({
      isActive,
      plan: isActive ? subscription.data[0].items.data[0].price.id : null,
      currentPeriodEnd: isActive ? subscription.data[0].current_period_end : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});
```

### 2. Get Subscription Details
```javascript
// GET /api/subscription/details
app.get('/api/subscription/details', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      limit: 10
    });

    res.json({
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        plan: sub.items.data[0].price.nickname,
        amount: sub.items.data[0].price.unit_amount / 100,
        currency: sub.items.data[0].price.currency,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});
```

### 3. Create Checkout Session
```javascript
// POST /api/subscription/create-checkout
app.post('/api/subscription/create-checkout', authenticateUser, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      customer: userId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      trial_period_days: 7, // 7-day free trial
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

### 4. Cancel Subscription
```javascript
// POST /api/subscription/cancel
app.post('/api/subscription/cancel', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptions.data[0];
    
    // Cancel at period end (don't immediately cancel)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    res.json({ 
      message: 'Subscription will be canceled at the end of the current period',
      cancelAt: subscription.current_period_end
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});
```

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
```

## Stripe Webhook Handler

```javascript
// POST /api/webhooks/stripe
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update your database with subscription changes
      updateUserSubscription(subscription.customer, subscription);
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Handle successful payment
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Handle failed payment
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

## Database Schema Example

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50),
  plan_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  feature_name VARCHAR(100),
  usage_date DATE,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, feature_name, usage_date)
);
```

## Deployment

1. **Deploy your backend** to services like:
   - Vercel (for Node.js)
   - Railway
   - Heroku
   - AWS Lambda
   - Google Cloud Functions

2. **Set up Stripe**:
   - Create products and prices in Stripe Dashboard
   - Set up webhooks pointing to your deployed API
   - Configure your domain for checkout sessions

3. **Update the extension**:
   - Replace `https://your-backend-api.com` in `subscriptionService.js` with your actual API URL
   - Test the integration thoroughly

## Testing

```javascript
// Test the subscription service locally
const testSubscription = async () => {
  const service = new SubscriptionService();
  
  // Test subscription check
  const hasSubscription = await service.hasActiveSubscription();
  console.log('Has subscription:', hasSubscription);
  
  // Test usage tracking
  const usage = await service.trackUsage('aiQueries');
  console.log('Current usage:', usage);
  
  // Test limits
  const exceeded = await service.hasExceededLimit('aiQueries');
  console.log('Exceeded limit:', exceeded);
};
``` 