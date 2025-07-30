# Debug Console Usage Guide

## Quick Start

After importing the services in your React Native app, you can use these debug functions in your browser console or React Native debugger:

### 1. Import the Services

```javascript
// In your React Native app
import { embeddingService, LocalDatabase, debugEmbedding } from './src/services';
```

### 2. Available Debug Functions

#### Quick Overview
```javascript
// Get a comprehensive overview of the local embedding system
debugEmbedding.overview()
```

#### View Data
```javascript
// View all local interactions
debugEmbedding.viewInteractions()

// View interaction statistics
debugEmbedding.viewStats()

// View current settings
debugEmbedding.viewSettings()

// View local status
debugEmbedding.viewStatus()

// View stored embedding
debugEmbedding.viewEmbedding()
```

#### Test Functions
```javascript
// Test interaction tracking
debugEmbedding.testTracking()

// Compute current embedding
debugEmbedding.computeEmbedding()
```

#### Data Management
```javascript
// Export all data
debugEmbedding.exportData()

// Clear all data (with confirmation)
debugEmbedding.clearData()
```

### 3. Example Usage

```javascript
// 1. Start a session
await embeddingService.startSession();

// 2. Track some interactions
await embeddingService.trackArticleView('article-1', {
  view_duration_seconds: 30,
  category: 'technology',
  source: 'techcrunch'
});

await embeddingService.trackLike('article-2', {
  category: 'business',
  source: 'reuters'
});

// 3. Check the overview
await debugEmbedding.overview();

// 4. View detailed stats
await debugEmbedding.viewStats();

// 5. Compute embedding
await debugEmbedding.computeEmbedding();
```

### 4. Console Output Examples

#### Overview Output
```
🔍 Local Embedding System Overview
=====================================

📊 Summary:
Total Interactions: 15
Recent Activity: 8
Update Frequency: 10 articles
Sync Required: No
Embedding Stored: Yes

📋 Quick Actions:
- debugEmbedding.viewInteractions() - View all interactions
- debugEmbedding.viewStats() - View statistics
- debugEmbedding.viewSettings() - View settings
- debugEmbedding.viewStatus() - View status
- debugEmbedding.viewEmbedding() - View stored embedding
- debugEmbedding.testTracking() - Test interaction tracking
- debugEmbedding.computeEmbedding() - Compute current embedding
- debugEmbedding.exportData() - Export all data
- debugEmbedding.clearData() - Clear all data
```

#### Statistics Output
```
📈 Interaction Statistics: {
  total: 15,
  byType: { view: 8, like: 4, bookmark: 3 },
  byCategory: { technology: 6, business: 5, science: 4 },
  bySource: { techcrunch: 4, reuters: 3, nature: 2 },
  recentActivity: 8
}

📊 Breakdown:
Total Interactions: 15
Recent Activity (24h): 8

📊 By Type:
  view: 8
  like: 4
  bookmark: 3

📊 By Category:
  technology: 6
  business: 5
  science: 4

📊 By Source:
  techcrunch: 4
  reuters: 3
  nature: 2
```

### 5. Integration with Your App

To use these debug functions in your app:

1. **Import the services** in your main app file or where you need them
2. **Call the debug functions** from your browser console or React Native debugger
3. **Monitor the output** to understand how the local embedding system is working

### 6. Troubleshooting

If you see errors:

1. **Check if services are imported correctly**
2. **Verify AsyncStorage is available** (React Native environment)
3. **Check console logs** for detailed error messages
4. **Use `debugEmbedding.overview()`** to get a quick status check

### 7. Production vs Development

- **Development**: All debug functions are available
- **Production**: Debug functions are still available but won't auto-log
- **Privacy**: All data stays local, no sensitive information is logged

### 8. Data Export

The export function provides a complete snapshot of your local data:

```javascript
const data = await debugEmbedding.exportData();
console.log(data);
// Output:
// {
//   interactions: [...],
//   embedding: {...},
//   settings: {...},
//   exportDate: "2024-01-01T12:00:00.000Z"
// }
```

This is useful for:
- Debugging issues
- Data backup
- Migration between devices
- Analysis of user behavior patterns 