# Razorpay Payment Integration

This document outlines the Razorpay payment integration for the Fusion Mail pricing page.

## Overview

The payment system integrates Razorpay for handling subscription payments with the following features:
- Multiple pricing plans (Weekly, Monthly, Lifetime)
- Secure payment processing
- Subscription management in MongoDB
- User authentication integration

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_r6To98pWgKldl6
```

**Note**: Currently using test key without secret key. For production, you should:
1. Get a production Razorpay key ID
2. Add a secret key for signature verification
3. Update the webhook configuration

## API Routes

### 1. Create Order (`/api/payment/create-order`)
- **Method**: POST
- **Purpose**: Creates a Razorpay order for payment processing
- **Authentication**: Required (NextAuth session)
- **Body**: `{ planType: 'weekly' | 'monthly' | 'lifetime' }`
- **Response**: Order details including order ID and amount

### 2. Verify Payment (`/api/payment/verify`)
- **Method**: POST
- **Purpose**: Verifies payment and activates subscription
- **Authentication**: Required (NextAuth session)
- **Body**: Razorpay payment response data
- **Response**: Subscription activation confirmation

### 3. Get Subscription (`/api/user/subscription`)
- **Method**: GET
- **Purpose**: Retrieves current user subscription status
- **Authentication**: Required (NextAuth session)
- **Response**: Current subscription details

### 4. Get Payment History (`/api/user/payments`)
- **Method**: GET
- **Purpose**: Retrieves comprehensive payment and subscription data
- **Authentication**: Required (NextAuth session)
- **Response**: Complete user data including:
  - Payment history with detailed transaction records
  - Subscription history with all past subscriptions
  - Payment statistics (total payments, amount spent)
  - Current active subscription with features

## Pricing Plans

| Plan | Price (INR) | Duration | Features |
|------|-------------|----------|----------|
| Weekly | ₹699 | 7 days | 20 chat queries/day, Full summaries |
| Monthly | ₹999 | 30 days | Unlimited chat, All features |
| Lifetime | ₹1499 | Forever | All features, Lifetime updates |

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  
  // Current active subscription details
  currentSubscription: {
    subscriptionId: ObjectId,
    planType: String,        // 'weekly', 'monthly', 'lifetime'
    planName: String,        // User-friendly plan name
    status: String,          // 'active', 'expired', 'cancelled'
    startDate: Date,
    endDate: Date,           // null for lifetime
    durationInDays: Number,  // null for lifetime
    features: [String],      // Array of plan features
    isActive: Boolean,
    lastPaymentId: ObjectId,
    lastPaymentDate: Date
  },
  
  // Complete subscription history
  subscriptionHistory: [{
    subscriptionId: ObjectId,
    planType: String,
    startDate: Date,
    endDate: Date,
    status: String,
    paymentId: ObjectId
  }],
  
  // Tracking timestamps
  lastSubscriptionUpdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  userEmail: String,
  userName: String,
  
  // Subscription details
  planType: String,        // 'weekly', 'monthly', 'lifetime'
  planName: String,        // User-friendly plan name
  status: String,          // 'active', 'expired', 'cancelled'
  
  // Duration details
  startDate: Date,
  endDate: Date,           // null for lifetime
  durationInDays: Number,  // null for lifetime
  
  // Payment reference
  paymentId: ObjectId,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  
  // Pricing details
  amount: Number,          // Amount in paise
  currency: String,        // 'INR'
  
  // Features based on plan
  features: [String],      // Array of plan features
  
  // Subscription metadata
  isActive: Boolean,
  autoRenew: Boolean,      // false for lifetime
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastAccessedAt: Date
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  userEmail: String,
  subscriptionId: ObjectId,
  
  // Razorpay payment details
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payment amount and currency
  amount: Number,          // Amount in paise
  currency: String,        // 'INR'
  
  // Plan details
  planType: String,        // 'weekly', 'monthly', 'lifetime'
  planName: String,        // User-friendly plan name
  
  // Payment status and metadata
  paymentStatus: String,   // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: String,   // 'razorpay'
  isTestPayment: Boolean,  // true for mock payments
  
  // Timestamps
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Enhanced Data Storage

### Comprehensive User Records
The system now stores detailed information about:
- **Current Subscription**: Full details including features, dates, and payment references
- **Subscription History**: Complete audit trail of all user subscriptions
- **Payment Records**: Detailed transaction history with Razorpay references
- **Plan Features**: Dynamic feature lists based on subscription type

### Data Relationships
- Users ↔ Subscriptions (one-to-many)
- Users ↔ Payments (one-to-many)
- Subscriptions ↔ Payments (one-to-one)
- Cross-referenced with ObjectIds for data integrity

### Data Storage Features
- **Automatic Expiration Handling**: System checks and updates expired subscriptions
- **Payment Tracking**: Complete Razorpay transaction details
- **Feature Management**: Dynamic feature assignment based on plans
- **Audit Trail**: Full history of subscription changes
- **Statistics**: Real-time calculation of payment and subscription metrics

## Frontend Integration

### useRazorpay Hook
Custom hook that handles:
- Loading Razorpay script
- Creating payment orders
- Processing payments
- Handling success/error states

### Pricing Page
- Interactive pricing cards
- Authentication checks
- Payment initiation
- Loading states

### UserDashboard Component
Comprehensive dashboard displaying:
- Current subscription status with features
- Payment history with transaction details
- Subscription statistics
- Past subscription records

## Security Considerations

### Current Limitations
- No secret key for signature verification
- Mock orders for testing without proper Razorpay setup
- No webhook verification

### Production Requirements
1. **Add Secret Key**: Get Razorpay secret key for signature verification
2. **Webhook Setup**: Configure webhooks for payment status updates
3. **SSL Certificate**: Ensure HTTPS for secure payments
4. **Error Handling**: Implement comprehensive error handling
5. **Logging**: Add payment logging for audit trails

## Testing

### Test Mode
- Uses Razorpay test key
- Creates mock orders when API fails
- Simulates payment flow

### Test Cards
Use Razorpay test cards for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002

## Usage

1. User selects a pricing plan
2. System checks authentication
3. Creates Razorpay order via API
4. Opens Razorpay checkout modal
5. User completes payment
6. System verifies payment
7. Activates subscription in database
8. Updates user interface

## Error Handling

- Authentication errors redirect to login
- Payment failures show error messages
- Network errors are handled gracefully
- Subscription status is validated on each request

## Future Enhancements

1. **Webhook Integration**: Real-time payment status updates
2. **Subscription Management**: Cancel/upgrade functionality
3. **Invoice Generation**: PDF invoices for payments
4. **Analytics**: Payment and subscription analytics
5. **Refund System**: Automated refund processing 