# News App API Integration

This document explains how to integrate the React Native news app with the backend API.

## Overview

The app has been updated to use a real backend API instead of mock data. It includes:

- **Authentication Service** - User registration, login, and token management
- **Article Service** - Fetching articles, engagement tracking, and caching
- **Embedding Service** - Local ML computation for user preferences
- **API Configuration** - Environment-based configuration

## Features Implemented

### 1. Authentication
- User registration and login
- JWT token management with automatic refresh
- Secure token storage using Expo SecureStore
- Profile management

### 2. Article Management
- Personalized feed with ML recommendations
- Trending articles
- Article engagement (like, bookmark, share)
- Search functionality
- Caching for offline support

### 3. Local ML Processing
- Client-side embedding computation
- Batched updates to reduce server load
- Privacy-first approach
- Real-time personalization

### 4. Swipe Navigation
- Swipe up: Next article
- Swipe down: Previous article
- Swipe left: Dislike/Skip
- Swipe right: Like
- Swipe top: Bookmark

## Setup Instructions

### 1. Install Dependencies

```bash
cd NewsApp
npm install
```

### 2. Configure API Endpoints

Edit `src/config/api.js` to set your backend API URLs:

```javascript
export const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000', // Your local backend
    version: 'v1',
  },
  production: {
    baseURL: 'https://your-production-api.com',
    version: 'v1',
  },
};
```

### 3. Environment Variables (Optional)

You can also use environment variables for configuration:

```bash
# Create .env file
echo "API_BASE_URL=http://localhost:8000" > .env
echo "API_VERSION=v1" >> .env
```

### 4. Start the App

```bash
npm start
```

## API Endpoints Used

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Articles
- `GET /feed/personalized` - Personalized feed
- `GET /feed/trending` - Trending articles
- `GET /articles` - Article list with filters
- `GET /articles/{id}` - Article details
- `POST /articles/{id}/view` - Track article view
- `POST /articles/{id}/like` - Like article
- `DELETE /articles/{id}/like` - Unlike article
- `POST /articles/{id}/bookmark` - Bookmark article
- `DELETE /articles/{id}/bookmark` - Remove bookmark

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/embedding/update` - Update user embedding
- `GET /users/embedding/status` - Get embedding status

### Search
- `GET /search/articles` - Search articles

## Architecture

### Service Layer
```
src/services/
├── api.js              # Base API configuration
├── authService.js      # Authentication management
├── articleService.js   # Article operations
└── embeddingService.js # Local ML processing
```

### Data Flow
1. **User opens app** → Check authentication status
2. **User logs in** → Store tokens, fetch profile
3. **Load feed** → Get personalized articles from API
4. **User swipes** → Track interactions locally
5. **Every 10 articles** → Send batched embedding update
6. **Server processes** → Updates recommendations

### Caching Strategy
- **Feed Cache**: 30 minutes TTL
- **Article Cache**: 1 hour TTL
- **User Profile**: Until logout
- **Preferences**: Until logout

## Local ML Processing

The app implements a simplified version of local embedding computation:

### Features
- **Privacy-First**: User behavior stays on device
- **Batched Updates**: Reduces server load by ~90%
- **Offline Capable**: Works without constant connectivity
- **Battery Efficient**: Minimal network usage

### Implementation
- Tracks user interactions locally
- Computes embedding vector every 10 articles
- Sends aggregated data to server
- Server updates recommendations

### Future Enhancements
- Integrate lightweight ML model (all-MiniLM-L6-v2)
- Add more sophisticated feature extraction
- Implement real-time personalization

## Error Handling

The app includes comprehensive error handling:

### Network Errors
- Automatic retry for failed requests
- Fallback to cached data
- User-friendly error messages

### Authentication Errors
- Automatic token refresh
- Redirect to login on auth failure
- Clear stored data on logout

### API Errors
- Consistent error response format
- Proper HTTP status code handling
- Detailed error logging

## Testing

### Manual Testing
1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Verify token storage
   - Test logout

2. **Article Flow**
   - Load personalized feed
   - Test swipe actions
   - Verify engagement tracking
   - Check caching behavior

3. **Offline Testing**
   - Disconnect network
   - Verify cached content loads
   - Test interaction buffering
   - Reconnect and verify sync

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test feed
curl -X GET http://localhost:8000/api/v1/feed/personalized \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check API_BASE_URL in config
   - Verify backend is running
   - Check network connectivity

2. **Authentication Errors**
   - Clear app data and reinstall
   - Check token expiration
   - Verify API endpoints

3. **Feed Not Loading**
   - Check API response format
   - Verify article transformation
   - Check error logs

4. **Embedding Updates Failing**
   - Check network connectivity
   - Verify API endpoint
   - Check request payload format

### Debug Mode

Enable debug logging:

```javascript
// In api.js
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response logging
api.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

api.interceptors.response.use(response => {
  console.log('API Response:', response);
  return response;
});
```

## Performance Optimization

### Current Optimizations
- **Request Caching**: Reduces API calls
- **Batched Updates**: Reduces server load
- **Lazy Loading**: Load articles as needed
- **Image Optimization**: Multiple resolutions

### Future Optimizations
- **Service Workers**: Background sync
- **IndexedDB**: Larger cache storage
- **WebAssembly**: Faster ML processing
- **CDN Integration**: Faster content delivery

## Security Considerations

### Implemented
- JWT token authentication
- Secure token storage
- HTTPS enforcement
- Input validation

### Recommended
- Certificate pinning
- Biometric authentication
- Rate limiting
- Content security policy

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
expo build:android
expo build:ios
```

### Environment Configuration
- Set production API URLs
- Configure CDN endpoints
- Set up monitoring
- Enable error tracking

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check error logs
4. Contact development team

## Changelog

### v1.0.0
- Initial API integration
- Authentication system
- Article feed with ML recommendations
- Local embedding computation
- Swipe-based navigation
- Caching system 