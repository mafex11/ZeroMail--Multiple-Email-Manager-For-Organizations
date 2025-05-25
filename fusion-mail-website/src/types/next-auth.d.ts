import 'next-auth'
import { ISubscription, IGmailAccount } from '@/lib/models/User'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscription?: ISubscription
      accounts?: IGmailAccount[]
    }
  }

  interface User {
    id: string
    subscription?: ISubscription
    accounts?: IGmailAccount[]
  }
} 