# Backend Server Port Conflict Fix

## ❌ Problem: "EADDRINUSE: address already in use :::5000"

This happens when:
1. **Multiple nodemon restarts** - Saving multiple files at once causes nodemon to restart too quickly
2. **Previous process not killed** - Old server instance still running when new one tries to start
3. **Rapid file changes** - Creating/editing many files triggers multiple simultaneous restarts

## ✅ Solutions Implemented

### 1. **Increased Nodemon Delay** (nodemon.json)
```json
"delay": 2000  // Changed from 500ms to 2 seconds
```
- Waits 2 seconds after file changes before restarting
- Groups multiple file saves into single restart
- Prevents overlapping server instances

### 2. **Reduced Nodemon Verbosity** (nodemon.json)
```json
"verbose": false  // Less console spam
```
- Cleaner terminal output
- Easier to spot actual errors

### 3. **Better Error Handling** (server.js)
- Catches EADDRINUSE error specifically
- Shows helpful solutions in terminal
- Prevents silent crashes

### 4. **Manual Port Cleanup (if needed)**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill /F /PID <PID>
```

## 🚀 How to Use

### Normal Startup (Recommended)
```bash
# From project root
npm run dev:backend

# Or from backend folder
cd backend
npm run dev
```

### Stop Backend
- Press `Ctrl+C` in the terminal

### Check What's Running
```powershell
netstat -ano | findstr :5000
```

### Manual Kill (if needed)
```powershell
# Find PID
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill /F /PID <PID>
```

## 🔧 Best Practices to Avoid Port Conflicts

### 1. **Use npm Scripts**
Use `npm run dev:backend` from project root or `npm run dev` from backend folder

### 2. **Wait Between File Saves**
When editing multiple files:
- Save first file
- Wait 2-3 seconds
- Save next file
- OR save all at once and wait for single restart

### 3. **Don't Spam Saves**
Avoid rapid Ctrl+S spam - nodemon needs time to restart cleanly

### 4. **Close Terminals Properly**
- Use Ctrl+C to stop server properly
- Don't just close terminal window
- Ensures graceful shutdown

### 5. **One Backend Instance**
Only run ONE terminal with backend at a time

## 📊 Understanding Nodemon Behavior

### Old Config (PROBLEMATIC)
```json
{
  "delay": 500,      // Too fast!
  "verbose": true    // Too much output
}
```
**Result:** Multiple restarts when saving 3+ files = port conflicts

### New Config (FIXED)
```json
{
  "delay": 2000,     // Enough time to cleanup
  "verbose": false   // Cleaner output
}
```
**Result:** Single restart after all files saved = no conflicts

## 🐛 Troubleshooting

### Issue: Still getting port errors
**Solution:** 
1. Press `Ctrl+C` to stop the server
2. Find and kill port 5000: `netstat -ano | findstr :5000` then `taskkill /F /PID <PID>`
3. Wait 2-3 seconds
4. Start again: `npm run dev:backend`

### Issue: Nodemon not restarting
**Solution:**
- Check nodemon.json exists in backend/
- Verify file is in watch list
- Try manual restart: type `rs` and press Enter

### Issue: Changes not reflecting
**Solution:**
- Hard restart: Ctrl+C, then `npm run dev:backend`
- Clear browser cache
- Check correct file is being edited

### Issue: Multiple node processes
**Solution:**
```powershell
# Kill ALL node processes (CAREFUL!)
Get-Process node | Stop-Process -Force

# Then restart
npm run dev:backend
```

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `npm run dev:backend` (from root) or `npm run dev` (from backend/) |
| Stop backend | Ctrl+C |
| Kill specific PID | `taskkill /F /PID <number>` |
| View nodemon config | `cat backend\nodemon.json` |

## ✅ Verification

After changes, you should see:
```
🔍 Checking for processes using port 5000...
✅ Port 5000 is free!

🚀 Starting backend server...
Backend restarting...
✅ MongoDB Connected: cluster0.tbrui51.mongodb.net
📊 Database: green_leaf_project
🚀 Server is running on port 5000
```

No more port conflict errors! 🎉

## 📝 Notes

- These settings are optimized for development
- Production should use PM2 or similar process manager
- The 2-second delay is a good balance between responsiveness and stability
- If you need faster restarts, try 1500ms, but not lower than 1000ms
