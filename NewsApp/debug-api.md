# API Debug Guide

## Recent Changes Made

### 1. Fixed API Configuration
- **Problem**: App was trying to access `/api/v1/auth/register` but backend serves `/auth/register`
- **Solution**: Removed version prefix from API configuration
- **Files Changed**: `src/config/api.js`, `src/services/api.js`

### 2. Increased Timeout
- **Problem**: 10-second timeout was too short for feed requests
- **Solution**: Increased timeout to 30 seconds
- **Files Changed**: `src/services/api.js`

### 3. Added Debug Logging
- **Added**: Request/response logging to help identify issues
- **Files Changed**: `src/services/api.js`

## Current Status

✅ **Registration**: Working correctly
✅ **Login**: Working correctly  
✅ **Feed Endpoint**: Working correctly (tested with curl)
✅ **API Configuration**: Fixed

## Debugging Steps

### 1. Check Console Logs
Look for these log messages in your React Native console:

```
🌐 API Request: GET /feed/personalized
⏱️  Timeout: 30000ms
✅ API Response: 200 /feed/personalized
```

### 2. Common Issues

#### Timeout Errors
```
⏰ Timeout Error: /feed/personalized (30000ms)
```
**Solution**: The backend is taking too long. This could be due to:
- Database performance issues
- Complex ML computations
- Network latency

#### Network Errors
```
🌐 Network Error: Network Error (/feed/personalized)
```
**Solution**: Check network connectivity between your device and the backend.

#### Authentication Errors
```
❌ API Error: 401 /feed/personalized
```
**Solution**: Token might be expired. Try logging in again.

### 3. Testing Commands

Test the backend directly:
```bash
# Test registration
curl -X POST http://192.168.1.187:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","username":"testuser","display_name":"Test User","preferences":{"categories":["technology"],"language":"en","content_type":"mixed"}}'

# Test feed (replace TOKEN with actual token)
curl -X GET http://192.168.1.187:8000/feed/personalized \
  -H "Authorization: Bearer TOKEN" \
  --max-time 30
```

### 4. Performance Optimization

If timeouts persist, consider:

1. **Reduce Feed Size**: Change `limit` parameter from 50 to 20
2. **Enable Caching**: The app already has caching implemented
3. **Backend Optimization**: Check backend performance and database queries

### 5. Fallback Strategy

The app includes fallback mechanisms:
- Returns cached data if API fails
- Graceful error handling
- User-friendly error messages

## Next Steps

1. Test the app with the new configuration
2. Monitor console logs for any remaining issues
3. If timeouts persist, consider reducing the feed limit or optimizing the backend 