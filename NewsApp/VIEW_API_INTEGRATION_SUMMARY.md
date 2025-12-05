# View API Integration Summary

## Overview
Updated the frontend to integrate with the new backend view tracking API endpoint `POST /articles/{article_id}/view`.

## Changes Made

### 1. API Endpoints (`src/services/api.js`)
- **Added**: `VIEW: (id) => `/articles/${id}/view` endpoint to the ARTICLES section
- **Purpose**: Enables frontend to call the backend view tracking API

### 2. Article Service (`src/services/articleService.js`)
- **Updated**: `trackArticleView()` method to call both backend API and local embedding service
- **Backend Integration**: Now sends view data to `POST /articles/{article_id}/view`
- **Local Tracking**: Still maintains local tracking for embedding service
- **Error Handling**: Falls back to local tracking if backend fails
- **Response**: Returns backend response data instead of hardcoded response

### 3. View Data Format Updates

#### ArticleDetail.js
- **Changed**: `view_duration_seconds` → `read_time_seconds`
- **Changed**: `percentage_read` → `interaction_strength` (0-1 scale)
- **Removed**: `swipe_direction` (not used by backend)
- **Kept**: `interaction_type`, `category`, `source`

#### ArticlePager.js
- **Updated**: All view tracking calls to use correct field names
- **Swipe Tracking**: Updated swipe interactions with proper field mapping
- **Tap Tracking**: Updated tap interactions with proper field mapping
- **End Swipe**: Updated end-of-content tracking

### 4. Field Mapping

| Frontend (Old) | Backend (New) | Notes |
|----------------|---------------|-------|
| `view_duration_seconds` | `read_time_seconds` | Time spent reading in seconds |
| `percentage_read` | `interaction_strength` | Converted to 0-1 scale |
| `swipe_direction` | (removed) | Not used by backend |
| `interaction_type` | `interaction_type` | Unchanged |
| `category` | `category` | Unchanged |
| `source` | `source` | Unchanged |

## Backend API Response

The backend view API returns:
```json
{
  "tracked": true,
  "article_id": "uuid",
  "interaction_type": "read_article",
  "read_time_seconds": 30,
  "interaction_strength": 0.8
}
```

## Benefits

1. **Dual Tracking**: Both backend and local tracking for comprehensive analytics
2. **Improved Recommendations**: Backend can use view data for better recommendations
3. **Fault Tolerance**: Local tracking continues even if backend fails
4. **Consistent Data**: Proper field mapping ensures data integrity

## Testing

Created `test_view_api_integration.js` to verify the integration works correctly.

## Files Modified

1. `src/services/api.js` - Added VIEW endpoint
2. `src/services/articleService.js` - Updated trackArticleView method
3. `src/screens/ArticleDetail.js` - Updated view data format
4. `src/screens/ArticlePager.js` - Updated all view tracking calls
5. `test_view_api_integration.js` - Test script for verification

## Next Steps

1. Test the integration with real article IDs
2. Monitor backend logs to ensure view tracking is working
3. Verify that recommendations improve with the new view data
4. Consider adding more detailed interaction tracking if needed 