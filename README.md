# TechSpecs - Electronics Product Information Platform

A comprehensive electronics product database platform where users can browse products, read reviews, compare specifications, and shops can register to sell products.

## Live Demo

[View Live Demo](https://your-deployed-url.netlify.app) *(Update after deployment)*

## Features

### For Visitors (No Login Required)
- Browse all products across categories (Smartphones, Bikes, Vehicles, Electric Accessories)
- View detailed product specifications
- Read approved product reviews
- Compare up to 4 products side-by-side
- Search products by name, brand, or description
- Filter products by category
- View shop availability and pricing information

### For Registered Users
All visitor features plus:
- **Create an account** - Sign up with email and password
- **Write product reviews** - Share your experience with products
- **Rate products** - Give 1-5 star ratings
- **Vote on helpful reviews** - Help others find useful reviews
- **Register as a shop owner** - Apply to sell products on the platform

### For Shop Owners
All registered user features plus:
- **Shop Registration** - Submit shop information for approval
- **Manage Shop Profile** - Update shop details, address, contact info
- **List Product Availability** - Add products available in your shop
- **Update Pricing** - Set shop-specific pricing for products
- **Manage Stock Status** - Mark products as in stock, out of stock, or pre-order
- **Track Inventory** - Update stock quantities

### For Administrators
Full system access including:
- **Product Management** - Add, edit, and manage all products
- **Category Management** - Create and organize product categories
- **Shop Approval** - Approve or reject shop registration requests
- **Review Moderation** - Approve or reject user reviews
- **User Management** - View and manage user accounts
- **System Overview** - Monitor platform activity and statistics

---

## User Manual

### 1. Getting Started

#### Creating an Account
1. Click **"Sign In"** button in the top right corner
2. Click **"Sign up"** at the bottom of the modal
3. Enter your full name, email, and password (minimum 6 characters)
4. Click **"Sign Up"**
5. You're now logged in and can access all user features

#### Signing In
1. Click **"Sign In"** button in the top right corner
2. Enter your email and password
3. Click **"Sign In"**

### 2. Browsing Products

#### Navigation
- **Homepage**: `/` - Main product listing page
- **Category Filter**: Click category names in the header (Smartphones, Bikes, Vehicles, Accessories)
- **Search**: Use the search bar in the header to find products by name, brand, or description

#### Viewing Product Details
1. Click on any product card
2. View detailed specifications, images, and pricing
3. Switch between tabs:
   - **Specifications** - Technical details and specs
   - **Reviews** - User reviews and ratings
   - **Availability** - Shops selling this product with pricing

### 3. Writing Reviews

1. **Login Required** - Sign in to your account
2. Open any product detail page
3. Click the **"Reviews"** tab
4. Click **"Write a Review"** button
5. Fill in:
   - Star rating (1-5 stars)
   - Review title
   - Detailed review content
6. Click **"Submit Review"**
7. Your review will be pending admin approval before appearing publicly

### 4. Comparing Products

1. Browse the product listing
2. Select products you want to compare
3. Click the compare button (feature accessible from product listings)
4. View side-by-side comparison of:
   - Prices
   - Status
   - All technical specifications
5. Add or remove products (max 4 products)

### 5. Shop Registration

#### Becoming a Shop Owner
1. **Login Required** - Sign in to your account
2. Click **"Register Shop"** button on the homepage
3. Fill in shop information:
   - Shop Name (required)
   - Description
   - Phone number
   - Email address
   - Physical address
   - Website URL
4. Click **"Register Shop"**
5. Your registration will be reviewed by administrators
6. You'll receive approval/rejection notification

#### Managing Your Shop (After Approval)
1. Once approved, your role changes to "shop_owner"
2. Access **"My Shop"** from the user menu
3. Add product availability:
   - Select products from the catalog
   - Set your shop's price
   - Set stock status (In Stock, Out of Stock, Pre-Order)
   - Update stock quantities
4. Update shop information as needed

### 6. Admin Panel

**Admin Access Only** - Requires admin role

#### Accessing Admin Panel
- **URL**: Click **"Admin Panel"** button in the header (visible only to admins)
- **Direct Navigation**: The admin panel appears as a modal overlay

#### Admin Functions

##### Managing Products
1. Click **"Products"** tab
2. View all products in the system
3. See product details, status, and categories
4. Products can be added/managed through the database or future admin UI enhancements

##### Approving Shops
1. Click **"Shops"** tab
2. View all shop registration requests
3. For pending shops:
   - Click **✓ (green checkmark)** to approve
   - Click **✗ (red X)** to reject
4. Approved shops can immediately start listing products
5. Rejected shops can resubmit applications

##### Moderating Reviews
1. Click **"Reviews"** tab
2. View all submitted reviews (pending, approved, rejected)
3. For pending reviews:
   - Click **✓ (green checkmark)** to approve - Review becomes public
   - Click **✗ (red X)** to reject - Review is hidden
4. Review quality guidelines:
   - Must be relevant to the product
   - No spam or promotional content
   - Constructive feedback only

---

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Supabase account (database already configured)
- Netlify/Vercel account for hosting (or any static host)

### Option 1: Deploy to Netlify

#### Step 1: Prepare Your Project
```bash
# Clone from GitHub
git clone https://github.com/Armanislam527/test_production_webpage.git
cd test_production_webpage

# Install dependencies
npm install
```

#### Step 2: Build the Project
```bash
npm run build
```

#### Step 3: Deploy to Netlify

**Method A: Using Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Method B: Using Netlify Web Interface**
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the `test_production_webpage` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Click **"Deploy site"**

### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or use the [Vercel Dashboard](https://vercel.com/new):
1. Import your GitHub repository
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables (same as Netlify)
4. Deploy

### Option 3: Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

---

## Database Management

### Database Structure

The platform uses **Supabase PostgreSQL** with the following tables:

#### Tables Overview

1. **profiles** - User profile information
   - Links to Supabase auth.users
   - Stores role (user, shop_owner, admin)
   - User details (name, avatar, email)

2. **categories** - Product categories
   - Smartphones, Bikes, Vehicles, Electric Accessories
   - Expandable for future categories

3. **products** - Main product catalog
   - Product details, specifications, images
   - Linked to categories
   - Status tracking (active, discontinued, upcoming)

4. **shops** - Registered shop information
   - Shop details, contact info
   - Approval status tracking
   - Linked to shop owner profiles

5. **shop_products** - Product availability at shops
   - Shop-specific pricing
   - Stock status and quantities
   - Last updated timestamps

6. **reviews** - Product reviews and ratings
   - User ratings (1-5 stars)
   - Review content and titles
   - Moderation status
   - Helpful vote counts

7. **review_votes** - Tracks helpful votes on reviews
   - Prevents duplicate votes
   - Links users to reviews

### Accessing the Database

#### Via Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Table Editor** to view/edit data
4. Use **SQL Editor** for custom queries

#### Database Connection Details
- **URL**: `https://vbpepgysyzrllyegzety.supabase.co`
- Connection details are in `.env` file (not committed to Git for security)

### Database Migrations

All schema changes are versioned in `supabase/migrations/`:
- `20251011142415_create_core_schema.sql` - Initial schema

To apply migrations:
```bash
# Migrations are automatically applied via Supabase
# New migrations can be added to the migrations folder
```

### Creating Your First Admin User

Since the database is new, you'll need to create an admin user:

#### Method 1: Via Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Open the `profiles` table
3. Find your user record (created when you sign up)
4. Edit the `role` column
5. Change from `user` to `admin`
6. Save changes
7. Refresh your app - you'll now see the Admin Panel button

#### Method 2: Via SQL Editor
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Adding Sample Products

To populate the platform with products, use the SQL Editor:

```sql
-- Example: Adding a smartphone
INSERT INTO products (
  category_id,
  name,
  slug,
  brand,
  model,
  description,
  specifications,
  images,
  release_date,
  price,
  status
) VALUES (
  (SELECT id FROM categories WHERE slug = 'smartphones'),
  'iPhone 15 Pro Max',
  'iphone-15-pro-max',
  'Apple',
  'A2849',
  'The most powerful iPhone ever with titanium design',
  '{
    "display": "6.7-inch Super Retina XDR",
    "processor": "A17 Pro chip",
    "camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    "battery": "Up to 29 hours video playback",
    "storage": "256GB, 512GB, 1TB",
    "5g": "Yes",
    "water_resistance": "IP68"
  }'::jsonb,
  '["https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"]'::jsonb,
  '2023-09-22',
  1199.00,
  'active'
);
```

### Database Security

**Row Level Security (RLS)** is enabled on all tables:
- Users can only edit their own profiles and reviews
- Shop owners can only manage their own shops
- Admins have full access
- Public users can view approved content only

**Security Policies**:
- Authentication required for write operations
- Role-based access control enforced at database level
- Automatic timestamps for audit trails

### Backup and Recovery

Supabase automatically backs up your database:
- **Point-in-time recovery** available (paid plans)
- **Manual backups** via Supabase Dashboard
- **Export data** using SQL dumps

To create a manual backup:
1. Supabase Dashboard → Database → Backups
2. Click "Create Backup"
3. Download SQL dump

---

## Environment Variables

Required environment variables (in `.env` file):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Never commit `.env` file to Git. It's already in `.gitignore`.

For deployment, add these variables in your hosting platform's environment settings.

---

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel/GitHub Pages

---

## Project Structure

```
test_production_webpage/
├── src/
│   ├── components/          # React components
│   │   ├── AdminPanel.tsx   # Admin dashboard
│   │   ├── AuthModal.tsx    # Login/signup modal
│   │   ├── CompareProducts.tsx  # Product comparison
│   │   ├── Header.tsx       # Navigation header
│   │   ├── ProductCard.tsx  # Product grid item
│   │   ├── ProductDetail.tsx    # Product detail modal
│   │   ├── ProductList.tsx  # Product listing
│   │   ├── ReviewForm.tsx   # Review submission
│   │   ├── ReviewList.tsx   # Review display
│   │   └── ShopRegistration.tsx # Shop signup
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── lib/
│   │   └── supabase.ts      # Supabase client & types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── .env                     # Environment variables (not in Git)
├── package.json            # Dependencies
└── vite.config.ts          # Vite configuration
```

---

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

The app will be available at `http://localhost:5173`

### Adding New Features

The platform is designed to be easily extensible:

1. **New Product Categories**: Add to `categories` table
2. **New User Roles**: Extend role types in database and auth context
3. **New Product Fields**: Update `specifications` JSONB field
4. **New Features**: Add new components in `src/components/`

---

## Common Tasks

### Adding Products (Admin)
1. Access Supabase Dashboard
2. Go to Table Editor → products
3. Click "Insert row"
4. Fill in product details
5. Use JSONB format for specifications and images

### Approving Shops (Admin)
1. Login as admin
2. Click "Admin Panel" button
3. Go to "Shops" tab
4. Click green checkmark to approve pending shops

### Moderating Reviews (Admin)
1. Login as admin
2. Click "Admin Panel" button
3. Go to "Reviews" tab
4. Approve or reject pending reviews

### Updating Shop Prices (Shop Owner)
1. Login as shop owner
2. Navigate to your shop dashboard
3. Update product prices and stock status
4. Changes are immediately reflected

---

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Database Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure API keys are valid

### Authentication Issues
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify email confirmation is disabled (or handle confirmation emails)

### Deployment Issues
- Ensure environment variables are set in deployment platform
- Check build logs for errors
- Verify build command and output directory

---

## Security Best Practices

1. **Never commit** `.env` file to Git
2. **Rotate API keys** regularly
3. **Use strong passwords** for admin accounts
4. **Review shop registrations** before approval
5. **Moderate reviews** to prevent spam
6. **Keep dependencies updated**: `npm audit` and `npm update`

---

## Future Enhancements

Possible features to add:
- User profiles with avatars
- Product wishlists
- Email notifications for shop approvals
- Advanced search with filters
- Product ratings aggregation
- Shop ratings and reviews
- Product image uploads
- Bulk product import (CSV)
- Analytics dashboard
- Mobile app (React Native)
- Social sharing features
- Product recommendations

---

## Support

For issues or questions:
- Check this README for common solutions
- Review Supabase documentation
- Check GitHub Issues

---

## License

MIT License - Feel free to use and modify for your needs

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Changelog

### Version 1.0.0 (Initial Release)
- Product listing and search
- Category filtering
- Product comparison
- User authentication
- Review system
- Shop registration
- Admin panel
- Mobile responsive design

---

**Built with ❤️ for electronics enthusiasts**
