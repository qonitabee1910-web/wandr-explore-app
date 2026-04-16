# PYU-GO - Explore App & Admin Dashboard

A comprehensive ride-sharing and shuttle management platform with a production-ready admin dashboard.

## 📱 Application Modules

### User-Facing App (Client)
- **Ride Booking** - Request rides with real-time tracking
- **Shuttle Booking** - Book shuttle services with seat selection
- **Hotel Search** - Discover and book accommodations
- **Promo Integration** - Apply discount codes and track savings
- **Booking History** - View past bookings and manage account

### Admin Dashboard (Management)
- **📊 Dashboard** - Real-time analytics and KPIs
- **👥 Driver Management** - Approve, track, and manage drivers
- **🚗 Ride Monitoring** - Monitor active rides with tracking
- **🚌 Shuttle Operations** - Manage routes, schedules, and occupancy
- **💰 Pricing Control** - Dynamic pricing and surge multipliers
- **🎫 Promo Management** - Create and track promotional campaigns
- **📢 Ads Management** - Manage advertisements and campaigns
- **⚙️ Settings** - Configure payment gateways, email, and app settings

## 🛠️ Tech Stack

### Frontend
- **React 18+** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend & Services
- **Supabase** - PostgreSQL database + Auth + Real-time
- **PostgreSQL** - Powerful relational database
- **JWT Authentication** - Secure auth tokens
- **Row-Level Security** - Data protection policies

### Development
- **ESLint** - Code quality
- **Vitest** - Unit testing
- **npm/bun** - Package managers

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 16+, npm or bun, Supabase account
```

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd wandr-explore-app
npm install
```

2. **Setup Environment**
```bash
# Create .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. **Start Development**
```bash
npm run dev
```

4. **Access Applications**
- **User App:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin/dashboard

## 📚 Documentation

### User Application
- [README.md](./README.md) - Main project overview
- [Fare API Integration](./docs/fare-api-integration.md) - Pricing system
- [Fare System Schema](./docs/fare-system-schema.sql) - Database schema

### Admin Dashboard
- **[Admin Quick Start](./docs/ADMIN_QUICKSTART.md)** ⭐ START HERE
- [Admin Complete Guide](./docs/ADMIN_DASHBOARD_GUIDE.md) - Full documentation
- [Admin README](./docs/ADMIN_README.md) - Feature overview
- [Database Migrations](./src/admin/migrations/) - SQL schema files

## 📁 Project Structure

```
wandr-explore-app/
├── src/
│   ├── admin/                    # Admin Dashboard
│   │   ├── pages/                # Dashboard pages (8 modules)
│   │   ├── services/             # API service layer
│   │   ├── components/           # UI components
│   │   ├── types/                # TypeScript types
│   │   ├── hooks/                # Custom React hooks
│   │   └── migrations/           # Database migrations
│   │
│   ├── components/               # User App UI Components
│   ├── pages/                    # User App Pages
│   ├── services/                 # User App Services
│   ├── types/                    # User App Types
│   ├── data/                     # Mock/dummy data
│   └── App.tsx                   # Main application
│
├── docs/
│   ├── ADMIN_QUICKSTART.md       # 📍 Admin Setup Guide
│   ├── ADMIN_DASHBOARD_GUIDE.md  # Complete admin docs
│   ├── ADMIN_README.md           # Admin features
│   └── fare-api-integration.md   # Pricing docs
│
├── public/                       # Static assets
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies

```

## 🎯 Key Features

### For Users
✅ One-click ride booking  
✅ Real-time driver tracking  
✅ Shuttle pre-booking with seat selection  
✅ Hotel discovery and booking  
✅ Promo code application  
✅ Booking history and reviews  
✅ Multiple payment methods  

### For Admins
✅ Real-time dashboard analytics  
✅ Driver approval workflow  
✅ Active ride monitoring  
✅ Dynamic pricing control  
✅ Promotional campaign management  
✅ Advertisement management  
✅ Payment & email configuration  
✅ System-wide settings  

## 🔐 Security

- **JWT Authentication** - Secure token-based auth
- **Row-Level Security** - Database-level data protection
- **Role-Based Access** - Admin permissions (super_admin, admin, moderator, analyst)
- **HTTPS Ready** - SSL/TLS support
- **Audit Logging** - Track all admin actions
- **Encrypted Credentials** - Secure storage of sensitive data

## 📊 Database Schema

The application uses 11+ core tables:

### Admin Tables
- `administrators` - Admin users and roles
- `admin_roles` - Role definitions
- `admin_permissions` - Permission mappings

### Configuration Tables
- `payment_gateway_settings` - Payment processor configs
- `email_settings` - SMTP configuration
- `notification_templates` - Email templates
- `app_settings` - Global app settings

### Business Tables
- `pricing_rules` - Dynamic pricing rules
- `surge_multipliers` - Surge pricing config
- `promos` - Promotional codes
- `promo_usage` - Usage tracking
- `advertisements` - Ad placements
- `ad_campaigns` - Campaign management
- `ad_metrics` - Performance metrics

See [Database Migrations](./src/admin/migrations/) for complete schema.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
```bash
vercel deploy
```

### Deploy to Other Platforms
1. Build: `npm run build`
2. Upload `dist/` folder
3. Configure environment variables
4. Set up routing for SPA

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📞 Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev)

### Learning
- [Admin Quick Start](./docs/ADMIN_QUICKSTART.md) - Get started in 5 minutes
- [Complete Admin Guide](./docs/ADMIN_DASHBOARD_GUIDE.md) - Comprehensive reference
- API Services Documentation - In guides above

## 🎓 Next Steps

### New to the Project?
1. Start with [Admin Quick Start](./docs/ADMIN_QUICKSTART.md)
2. Explore each of the 8 admin modules
3. Read [Complete Admin Guide](./docs/ADMIN_DASHBOARD_GUIDE.md)

### Setting Up Admin Dashboard?
1. Configure `.env.local`
2. Run database migrations
3. Access `/admin/dashboard`
4. Login with admin credentials

### Developing Features?
1. Check existing patterns in services
2. Follow TypeScript type definitions
3. Add proper error handling
4. Use real-time subscriptions for live data

## 📈 Project Status

- ✅ **User App**: Core features complete
- ✅ **Admin Dashboard**: Production-ready, all 8 modules implemented
- ✅ **Database**: Schema with RLS policies
- ✅ **Documentation**: Comprehensive guides
- ✅ **Testing**: Unit tests framework ready
- ✅ **Deployment**: Ready for production

## 📄 License

All Rights Reserved - PYU-GO Platform

---

**Last Updated:** April 16, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
