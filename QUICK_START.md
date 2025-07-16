# 🚀 Quick Start Guide - Game Theory Simulator

## ✅ Status: Ready to Launch!

Your Game Theory Simulator is now fully configured and ready to run!

## 🏃‍♂️ Quick Start Steps

### 1. **Ensure MongoDB is Running**
```bash
# Start MongoDB (if not already running)
mongod
```

### 2. **Seed the Database** (First time only)
```bash
cd backend
npm run seed:philosophers
cd ..
```

### 3. **Start the Application**
```bash
npm run dev:full
```

### 4. **Access Your Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎮 What You Can Do Now

### **🔐 Authentication**
- **Register**: Create a new account with email/username/password
- **Login**: Access existing account
- **Guest Mode**: Try the app without registration
- **Upgrade**: Convert guest account to full account

### **🧠 Philosopher Guidance**
Get strategic advice from 5 historical philosophers:
- **Aristotle** (384-322 BCE) - Virtue Ethics
- **Immanuel Kant** (1724-1804) - Deontological Ethics  
- **John Stuart Mill** (1806-1873) - Utilitarianism
- **John Rawls** (1921-2002) - Justice as Fairness
- **Carol Gilligan** (1936-) - Ethics of Care

### **📊 Moral Alignment Tracking**
Monitor your ethical development across 5 dimensions:
- **Utilitarian** - Greatest good for greatest number
- **Deontological** - Duty-based moral principles
- **Virtue** - Character-focused decision making
- **Contractual** - Fairness and reciprocity
- **Care** - Relationship and empathy-based choices

### **🎯 Game Features**
- **Real-time moral analysis** of your strategic decisions
- **Progress tracking** and achievement unlocking
- **Level system** with feature unlocks
- **Global leaderboards** across multiple categories
- **Cross-device synchronization** for registered users

## 🛠 Troubleshooting

### **MongoDB Issues**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB manually
mongod
```

### **Port Conflicts**
- Frontend: Port 3000
- Backend: Port 3001
- Make sure these ports are available

### **Module Resolution Issues**
If you see import errors, the relative imports should now work correctly.

### **Environment Variables**
- Check `.env.local` for frontend settings
- Check `backend/.env` for backend configuration

## 📋 Available Commands

```bash
# Development
npm run dev:full          # Run both frontend and backend
npm run dev               # Frontend only
npm run dev:backend       # Backend only

# Production
npm run build:full        # Build both applications
npm run start:full        # Start production servers

# Database
cd backend && npm run seed:philosophers  # Seed philosopher data

# Setup
npm run setup            # Complete setup process
```

## 🎉 You're All Set!

The Game Theory Simulator is now a comprehensive full-stack application featuring:

✅ **User Authentication & Profiles**
✅ **Philosopher Guidance System** 
✅ **Moral Alignment Analysis**
✅ **Progress Tracking & Achievements**
✅ **Global Leaderboards & Statistics**
✅ **Cross-Device Synchronization**
✅ **Multiple Themes & Responsive Design**

**Ready to explore the fascinating world of game theory with philosophical insights!** 🧠✨

---

*For detailed information, see README.md and IMPLEMENTATION_SUMMARY.md*