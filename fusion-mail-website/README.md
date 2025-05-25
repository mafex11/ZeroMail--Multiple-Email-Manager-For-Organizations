# Fusion Mail Website

A full-stack Next.js website for the Fusion Mail Chrome extension with authentication, subscription management, and Razorpay payment integration.

## Features

- 🔐 **Authentication**: Google OAuth integration with NextAuth.js
- 💳 **Payment Processing**: Razorpay integration for subscription plans
- 📊 **User Dashboard**: Profile management and subscription details
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🗄️ **Database**: MongoDB with Mongoose ODM
- 📱 **Responsive**: Mobile-first design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **Payments**: Razorpay
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- Google OAuth credentials
- Razorpay account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fusion-mail
# For production: mongodb+srv://username:password@cluster.mongodb.net/fusion-mail

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-here

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# JWT Secret for additional security
JWT_SECRET=your-jwt-secret-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fusion-mail-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all the required environment variables

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API and Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Configure webhook endpoints for payment verification

### MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

## API Routes

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Subscription Management
- `POST /api/subscription/create-order` - Create Razorpay order
- `POST /api/subscription/verify-payment` - Verify payment and update subscription

## Database Schema

### User Model
```typescript
interface IUser {
  email: string
  name: string
  image?: string
  provider: string
  providerId: string
  accounts: IGmailAccount[]
  subscription: ISubscription
  createdAt: Date
  updatedAt: Date
}

interface IGmailAccount {
  email: string
  accessToken: string
  refreshToken: string
  profilePicture?: string
  isActive: boolean
  addedAt: Date
}

interface ISubscription {
  plan: 'free' | 'weekly' | 'monthly' | 'lifetime'
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  startDate?: Date
  endDate?: Date
  razorpaySubscriptionId?: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  amount?: number
  currency?: string
  features: {
    aiQueries: number // -1 for unlimited
    emailSummaries: number // -1 for unlimited
    advancedSearch: boolean
    otpAutoFill: boolean
    prioritySupport: boolean
    earlyAccess: boolean
  }
}
```

## Subscription Plans

| Plan | Price | AI Queries | Email Summaries | Features |
|------|-------|------------|-----------------|----------|
| Free | ₹0 | 3/day | Top 3 emails only | Basic features |
| Weekly | ₹6.99/week | 20/day | Unlimited | Priority support |
| Monthly | ₹9.99/month | Unlimited | Unlimited | All features + Early access |
| Lifetime | ₹14.99 one-time | Unlimited | Unlimited | All features + Lifetime updates |

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables**
   - Add all environment variables in Vercel dashboard
   - Update `NEXTAUTH_URL` to your production domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   ├── pricing/        # Pricing page
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── Navbar.tsx     # Navigation component
│   └── PricingPlans.tsx # Pricing component
├── lib/               # Utilities and configurations
│   ├── models/        # MongoDB models
│   ├── auth.ts        # NextAuth configuration
│   ├── mongodb.ts     # Database connection
│   └── utils.ts       # Utility functions
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@fusionmail.com or join our Discord community.

## Roadmap

- [ ] Email analytics dashboard
- [ ] Team collaboration features
- [ ] Advanced AI features
- [ ] Mobile app
- [ ] API for third-party integrations
