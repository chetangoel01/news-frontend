# Secure Configuration Setup

This guide shows you how to manage Supabase credentials securely without exposing them in your GitHub repository.

## 🚨 Security Best Practices

### **Never Commit API Keys to GitHub:**
- ❌ Don't put real API keys in `app.json`
- ❌ Don't commit `.env` files with secrets
- ❌ Don't hardcode keys in source code

### **Safe to Commit:**
- ✅ Placeholder values (`YOUR_SUPABASE_ANON_KEY`)
- ✅ Public URLs (Supabase project URL)
- ✅ Configuration structure

## 🔧 Secure Setup Options

### **Option 1: Environment Variables (Recommended)**

1. **Create a `.env` file** (already in .gitignore):
   ```bash
   # .env (not committed to GitHub)
   SUPABASE_URL=https://fdtupnezbxurutavplfh.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Use `app.config.js`** (already configured):
   ```javascript
   // app.config.js reads from environment variables
   supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
   ```

3. **Start Expo with environment variables:**
   ```bash
   SUPABASE_ANON_KEY=your-key-here expo start
   ```

### **Option 2: Build Scripts**

Create a build script that injects keys during build:

```bash
#!/bin/bash
# build-with-config.sh

# Set your keys
export SUPABASE_ANON_KEY="your-actual-key"

# Build the app
expo build:android
```

### **Option 3: CI/CD Secrets**

For production builds, use CI/CD secrets:

```yaml
# .github/workflows/build.yml
env:
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 🛠️ Current Setup

### **What's Safe (Already Committed):**
- ✅ `app.json` with placeholder values
- ✅ `app.config.js` with environment variable support
- ✅ Configuration structure

### **What You Need to Do:**

1. **Create a `.env` file** (not committed):
   ```bash
   # Create .env file
   echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > .env
   ```

2. **Start development with environment variables:**
   ```bash
   SUPABASE_ANON_KEY=your-key expo start
   ```

3. **For production builds:**
   ```bash
   SUPABASE_ANON_KEY=your-key expo build:android
   SUPABASE_ANON_KEY=your-key expo build:ios
   ```

## 📱 Development Workflow

### **Local Development:**
```bash
# Set environment variable and start
SUPABASE_ANON_KEY=your-key expo start

# Or use .env file
echo "SUPABASE_ANON_KEY=your-key" > .env
expo start
```

### **Testing:**
```bash
# Test with your key
SUPABASE_ANON_KEY=your-key npm test
```

### **Production Build:**
```bash
# Build with production key
SUPABASE_ANON_KEY=your-production-key expo build:android
```

## 🔐 Security Checklist

- ✅ **No real keys in `app.json`**
- ✅ **No real keys in source code**
- ✅ **`.env` file in `.gitignore`**
- ✅ **Environment variables for builds**
- ✅ **CI/CD secrets for production**

## 🚀 Quick Setup

1. **Create `.env` file:**
   ```bash
   echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > .env
   ```

2. **Start development:**
   ```bash
   expo start
   ```

3. **Test OAuth:**
   - The app will use the key from `.env`
   - OAuth should work properly

## 🎯 Benefits

- ✅ **Secure** - no keys in GitHub
- ✅ **Flexible** - different keys for dev/prod
- ✅ **CI/CD ready** - works with build systems
- ✅ **Team friendly** - each developer can use their own keys

This approach keeps your keys secure while making development easy! 