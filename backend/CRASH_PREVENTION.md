# Backend Crash Prevention & Stability Fixes

## 🔧 Changes Made to Prevent Server Crashes

### 1. **Global Error Handlers** (server.js)

#### Uncaught Exception Handler
```javascript
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error);
    process.exit(1);
});
```
- Catches synchronous errors that weren't handled
- Logs error details before gracefully shutting down
- Prevents silent crashes

#### Unhandled Promise Rejection Handler
```javascript
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION!');
    server.close(() => process.exit(1));
});
```
- Catches async errors from promises
- Ensures server closes before exit
- Common cause of "intermittent" crashes

### 2. **MongoDB Connection Resilience** (config/database.js)

#### Connection Event Handlers
- `error` - Logs connection errors without crashing
- `disconnected` - Warns when connection drops
- `reconnected` - Confirms successful reconnection

#### Auto-Retry Logic
```javascript
catch (error) {
    setTimeout(() => connectDB(), 5000);
}
```
- Retries connection every 5 seconds instead of crashing
- Allows MongoDB server to restart without app crash

### 3. **Graceful Shutdown** (server.js)

#### Signal Handlers
```javascript
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
```

#### Shutdown Process:
1. Stop accepting new requests
2. Close HTTP server
3. Close MongoDB connection
4. Exit cleanly
5. Force exit after 10s timeout (prevents hanging)

### 4. **Improved Error Middleware**

#### 404 Handler
```javascript
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});
```

#### General Error Handler
```javascript
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});
```

### 5. **Health Check Endpoint** (/health)

Monitor server health:
```bash
curl http://localhost:5000/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-03T...",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "rss": "50MB",
    "heapUsed": "30MB"
  }
}
```

### 6. **Nodemon Configuration** (nodemon.json)

- Watches relevant files only
- 500ms delay to prevent rapid restarts
- Ignores logs and node_modules
- Auto-restart on file changes

### 7. **PM2 Process Manager** (ecosystem.config.js)

For production deployment:

```bash
npm run pm2:start    # Start with PM2
npm run pm2:logs     # View logs
npm run pm2:restart  # Restart server
npm run pm2:stop     # Stop server
```

#### Features:
- **Auto-restart on crash** (up to 10 times)
- **Memory limit**: Restart if exceeds 500MB
- **Cluster mode**: Can run multiple instances
- **Log rotation**: Automatic log management
- **Graceful shutdown**: 5s timeout
- **Minimum uptime**: 10s before considering "started"

---

## 🚀 Running the Server

### Development Mode (with auto-restart)
```bash
cd backend
npm run dev
```

### Production Mode (simple)
```bash
cd backend
npm start
```

### Production Mode (with PM2)
```bash
cd backend
npm run pm2:start
```

---

## 🐛 Common Crash Causes (Now Fixed)

| Issue | Before | After |
|-------|--------|-------|
| Unhandled promise rejection | ❌ Silent crash | ✅ Logged & graceful shutdown |
| MongoDB disconnect | ❌ Crash permanently | ✅ Auto-retry connection |
| Ctrl+C termination | ❌ Hung process | ✅ Graceful cleanup |
| Memory leak | ❌ Crash when full | ✅ PM2 auto-restart at limit |
| Uncaught exception | ❌ Silent crash | ✅ Logged & controlled exit |
| File changes | ❌ Manual restart | ✅ Auto-restart with nodemon |

---

## 📊 Monitoring

### Check Server Health
```bash
curl http://localhost:5000/health
```

### PM2 Monitoring (if using PM2)
```bash
npm run pm2:monit    # Real-time monitoring
npm run pm2:logs     # View logs
```

### Manual Log Check
```bash
# Development logs (console)
npm run dev

# PM2 logs (files)
cat logs/err.log     # Errors
cat logs/out.log     # Standard output
```

---

## ⚠️ Important Notes

1. **Never ignore unhandled rejections** - All promises should have `.catch()` or `try/catch`
2. **Always validate environment variables** - Check `.env` file exists
3. **MongoDB connection string** - Ensure MONGODB_URI is correct
4. **Port conflicts** - Server will crash if port 5000 is already in use
5. **Memory usage** - Monitor with health endpoint or PM2

---

## 🔍 Debugging Crashes

If server still crashes:

1. **Check logs:**
   ```bash
   npm run dev  # Watch console output
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Check MongoDB connection:**
   ```bash
   # Verify MONGODB_URI in .env
   cat backend/.env | findstr MONGODB_URI
   ```

4. **Check for port conflicts:**
   ```bash
   netstat -ano | findstr :5000
   ```

5. **Enable debug mode:**
   ```bash
   set DEBUG=* && npm run dev
   ```

---

## ✅ Testing Stability

Test the crash prevention:

1. **Terminate with Ctrl+C** - Should see graceful shutdown message
2. **Kill MongoDB** - Should see retry attempts
3. **Invalid route** - Should get 404, not crash
4. **Send malformed request** - Should get 400/500, not crash
5. **Memory stress** - PM2 will restart if needed

---

**All crash prevention measures are now in place!** 🎉

The server should no longer crash unexpectedly and will handle errors gracefully.
