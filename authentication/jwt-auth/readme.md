# Node.js JWT Authentication System with EJS

A complete authentication system built with Node.js, Express.js, EJS templates, and JWT tokens. Features secure user registration, login, and a protected dashboard.

## 🚀 Features

- **User Authentication**: Secure signup and login with bcrypt password hashing
- **JWT Tokens**: Stateless authentication with HTTP-only cookies
- **Protected Routes**: Dashboard accessible only to authenticated users
- **EJS Templates**: Server-side rendered views with responsive design
- **Session Management**: Automatic token expiration and logout
- **Form Validation**: Client and server-side validation
- **Security**: CSRF protection via HTTP-only cookies
- **Demo Account**: Pre-configured test user

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or create the project directory:**

   ```bash
   mkdir nodejs-jwt-auth
   cd nodejs-jwt-auth
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create the required directories:**

   ```bash
   mkdir views
   mkdir public
   ```

4. **Set up the files:**

   - Copy `server.js` to the root directory
   - Copy `package.json` to the root directory
   - Copy all `.ejs` files to the `views/` directory

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm start
   ```

6. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
nodejs-jwt-auth/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── views/
│   ├── layout.ejs         # Base template layout
│   ├── login.ejs          # Login page
│   ├── signup.ejs         # Registration page
│   ├── dashboard.ejs      # Protected dashboard
│   └── error.ejs          # Error page
├── public/                # Static files (optional)
└── README.md             # Documentation
```

## 🔐 Demo Credentials

**Email:** `demo@example.com`  
**Password:** `password123`

## 🎯 API Endpoints

### Authentication Routes

- `GET /` - Redirects to login
- `GET /login` - Login page
- `GET /signup` - Registration page
- `POST /login` - Process login
- `POST /signup` - Process registration
- `POST /logout` - Logout user

### Protected Routes

- `GET /dashboard` - User dashboard (requires authentication)

### API Routes

- `GET /api/user` - Get current user data (JSON)

## 🔧 Configuration

### Environment Variables

Create a `.env` file for production:

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key-here
PORT=3000
```

### JWT Configuration

- **Token Expiration:** 24 hours
- **Storage:** HTTP-only cookies
- **Security:** Automatic cleanup on invalid tokens

## 🛡️ Security Features

1. **Password Hashing**: Uses bcryptjs with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **HTTP-only Cookies**: Prevents XSS attacks
4. **Input Validation**: Server-side validation for all inputs
5. **Protected Routes**: Middleware-based route protection
6. **Session Management**: Automatic token verification and cleanup

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Gradient backgrounds and smooth animations
- **Form Validation**: Real-time feedback and error handling
- **Auto-hide Alerts**: Messages disappear after 5 seconds
- **User Dashboard**: Statistics and profile information

## 📊 Dashboard Features

- User profile information
- Login statistics
- Member since date
- Days active calculation
- Quick action buttons
- Session security indicator

## 🔄 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Adding New Features

1. **New Routes**: Add routes in `server.js`
2. **New Templates**: Create `.ejs` files in `views/`
3. **Middleware**: Add custom middleware for additional security
4. **Database**: Replace in-memory storage with MongoDB/PostgreSQL

## 📝 Usage Examples

### Creating New Users

```javascript
// POST /signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### User Login

```javascript
// POST /login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

## 🚀 Production Deployment

1. **Set environment variables:**

   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   ```

2. **Use a process manager:**

   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

3. **Set up reverse proxy** (Nginx/Apache)
4. **Use HTTPS** for secure token transmission
5. **Implement rate limiting** for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
