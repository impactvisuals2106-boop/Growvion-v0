# Email Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to send email" or "Authentication failed"

#### 1. **Check App Password Format**
Gmail App Passwords are **exactly 16 characters** (no spaces).
- The password you provided: `nrzh cuoi oyli qlno` (with spaces removed = 15 characters)
- **Action**: Please verify your App Password is exactly 16 characters

#### 2. **Verify App Password Generation**
1. Go to: https://myaccount.google.com/apppasswords
2. Make sure 2-Step Verification is **enabled**
3. Generate a NEW App Password
4. Copy the **entire 16-character password** (remove spaces when pasting)
5. Update `.env.local` with the new password

#### 3. **Restart the Server**
After updating `.env.local`, you MUST restart the server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### 4. **Check Server Logs**
Look at your terminal/console where the server is running. You should see:
- "Email server is ready to send messages" (if successful)
- Or error messages with details

#### 5. **Verify Environment Variables are Loaded**
The server needs to be restarted to load `.env.local`. Check if variables are loaded by looking for errors like:
- "Email configuration missing" (means .env.local not loaded)
- "Email server configuration is invalid" (means authentication failed)

### Quick Fix Steps:

1. **Get a fresh App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Delete old app password
   - Generate new one
   - Copy the 16-character password (no spaces)

2. **Update .env.local:**
   ```env
   EMAIL_USER=impactvisuals2106@gmail.com
   EMAIL_PASSWORD=your-16-char-password-here
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Test again** by submitting the contact form

### Still Not Working?

Check the browser console (F12) and server terminal for specific error messages. The improved error handling will now show:
- "Authentication failed. Please check your Gmail App Password." (EAUTH error)
- "Connection failed. Please check your internet connection." (ECONNECTION error)
- Other specific error messages




