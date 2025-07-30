# Local-First User Embedding System

## Overview

This document describes the new local-first approach for user embedding updates in the news recommender app. Instead of sending every individual interaction to the server, we now:

1. **Store interactions locally** on the device using AsyncStorage
2. **Compute embeddings locally** using a lightweight model
3. **Send only final embeddings** to the server periodically
4. **Keep important interactions** (likes, bookmarks, shares) on the server for immediate feedback

## Architecture

### Local Storage (`localDatabase.js`)

- **User Interactions**: Stored locally with timestamps
- **Embedding Vectors**: Cached locally after computation
- **Settings**: User preferences for embedding behavior
- **Statistics**: Local analytics and usage data

### Embedding Service (`embeddingService.js`)

- **Local Computation**: Uses stored interactions to compute embeddings
- **Batch Updates**: Sends embeddings to server every N articles (default: 10)
- **Privacy-First**: Detailed interaction data stays on device
- **Offline Capable**: Works without internet connection

### Server Integration

- **Embedding Updates**: Receives final embeddings, not individual interactions
- **Important Actions**: Still tracks likes, bookmarks, shares for immediate feedback
- **Recommendations**: Uses server-side embeddings for article recommendations

## Key Benefits

### Privacy
- **No individual view tracking** on server
- **Local interaction storage** with user control
- **Minimal data transmission** to server
- **User-controlled data retention**

### Performance
- **Reduced network traffic** (batched updates)
- **Faster response times** (local computation)
- **Offline functionality** (local storage)
- **Reduced server load** (fewer API calls)

### User Experience
- **Immediate feedback** for important actions
- **Smooth operation** even with poor connectivity
- **User control** over data and settings
- **Transparent operation** with status display

## Data Flow

### Interaction Tracking
```
User Action → Local Storage → Local Computation → Server Update (periodic)
```

### Embedding Updates
```
Local Interactions → Embedding Computation → Server Sync → Recommendation Updates
```

### Important Actions
```
User Action → Local Storage + Server Update → Immediate Feedback
```

## Configuration

### Settings (`embeddingService.js`)
- `updateFrequency`: Number of articles before server update (default: 10)
- `embeddingModel`: Local model type (default: 'local')
- `privacyLevel`: Privacy settings (default: 'high')
- `syncEnabled`: Whether to sync with server (default: true)

### Storage Limits
- **Interactions**: Max 1000 stored locally
- **Auto-cleanup**: Removes interactions older than 30 days
- **Manual control**: User can clear data anytime

## API Changes

### Removed Endpoints
- `POST /articles/{id}/view` - View tracking now local only

### Updated Endpoints
- `POST /users/embedding/update` - Now receives final embeddings only
- `GET /users/embedding/status` - Returns local + server status

### Unchanged Endpoints
- `POST /articles/{id}/like` - Still tracked on server
- `POST /articles/{id}/bookmark` - Still tracked on server
- `POST /articles/{id}/share` - Still tracked on server

## Migration

### Database Changes
- Removed `user_article_views` table
- Updated `users` table relationships
- Added migration script: `migrations/remove_user_article_views.sql`

### Frontend Changes
- New `LocalDatabase` service for local storage
- Updated `EmbeddingService` for local-first approach
- New `EmbeddingStatus` component for user control
- Updated `ArticleService` to use local tracking

## Usage Examples

### Basic Usage
```javascript
import embeddingService from './services/embeddingService';

// Start session
await embeddingService.startSession();

// Track interactions (automatically stored locally)
await embeddingService.trackArticleView(articleId, { view_duration_seconds: 30 });
await embeddingService.trackLike(articleId, { category: 'technology' });
await embeddingService.trackBookmark(articleId, { source: 'techcrunch' });

// End session (triggers server update if needed)
await embeddingService.endSession();
```

### Status Monitoring
```javascript
// Get local status
const status = await embeddingService.getLocalStatus();
console.log('Sync required:', status.sync_required);
console.log('Articles since update:', status.articles_since_update);

// Get interaction statistics
const stats = await embeddingService.getInteractionStats();
console.log('Total interactions:', stats.total);
console.log('Recent activity:', stats.recentActivity);
```

### Settings Management
```javascript
// Update settings
await embeddingService.updateSettings({
  updateFrequency: 15,
  privacyLevel: 'maximum',
  syncEnabled: false
});

// Export data for backup
const data = await embeddingService.exportData();
console.log('Exported data:', data);
```

## Privacy Features

### Data Minimization
- Only essential interactions sent to server
- Detailed view data stays local
- User controls data retention

### Transparency
- Clear status display showing what data is stored
- User can view all local interactions
- Export/import functionality for data portability

### User Control
- Toggle sync on/off
- Clear old data automatically
- Manual data export/import
- Complete data deletion option

## Performance Considerations

### Local Storage
- AsyncStorage has size limits (~6MB on iOS, ~50MB on Android)
- Automatic cleanup prevents storage bloat
- Efficient JSON serialization

### Computation
- Lightweight embedding model for mobile devices
- Batch processing to reduce CPU usage
- Background computation to avoid UI blocking

### Network
- Batched updates reduce API calls
- Offline queue for failed updates
- Graceful degradation when offline

## Future Enhancements

### Advanced Features
- **Differential Privacy**: Add noise to local embeddings
- **Federated Learning**: Collaborative model updates
- **Edge Computing**: Local ML model updates
- **Cross-Device Sync**: Encrypted data sharing

### Performance Improvements
- **WebAssembly**: Faster local computation
- **TensorFlow Lite**: Optimized ML models
- **Background Processing**: Offline embedding updates
- **Caching Strategy**: Smart data retention

### User Experience
- **Visual Analytics**: Interaction patterns display
- **Privacy Dashboard**: Detailed privacy controls
- **Data Export**: Multiple format support
- **Backup/Restore**: Cloud sync for user data

## Troubleshooting

### Common Issues
1. **Storage Full**: Clear old interactions
2. **Sync Failed**: Check network, retry manually
3. **Performance Issues**: Reduce update frequency
4. **Privacy Concerns**: Disable sync, clear data

### Debug Tools
- `EmbeddingStatus` component for monitoring
- Console logging for detailed debugging
- Data export for analysis
- Settings reset for troubleshooting

## Security Considerations

### Data Protection
- Local storage is app-scoped
- No sensitive data in server logs
- User controls data lifecycle
- Encryption for data export

### Network Security
- HTTPS for all API calls
- Token-based authentication
- Rate limiting on server
- Input validation on both ends

### Privacy Compliance
- GDPR-compliant data handling
- User consent for data collection
- Right to data deletion
- Data portability features 