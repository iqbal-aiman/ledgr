# Ledgr 📒

**A fully offline billing and inventory management app built for small businesses.**

Ledgr helps shopkeepers and small business owners generate bills, track sales and purchases, manage customers, and monitor inventory — all without needing an internet connection.

---

## ✨ Features

- 🧾 **Bill Generation** — Create professional bills instantly
- 💰 **Sales & Purchases** — Quick sale entry and purchase tracking
- 👥 **Customer Management** — Full customer profiles with itemized bill history
- 📦 **Inventory Tracking** — Real-time stock levels with low stock alerts
- 📊 **Reports** — Business insights at a glance
- 🔌 **100% Offline** — No internet required, all data stored locally on-device
- 🔐 **Login/Auth Screen** — Secure access to your business data

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Mobile Wrapper | Capacitor |
| Local Storage | Capacitor Preferences |
| Platform | Android |

---

## 📱 Screens

- Login
- Dashboard
- Generate Bill
- Add Sale
- Add Purchase
- Customers / Customer Detail
- Inventory (with low stock alerts)
- Reports
- Settings

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Android Studio installed
- Capacitor CLI

### Installation

```bash
git clone https://github.com/iqbal-aiman/ledgr.git
cd ledgr
npm install
```

### Run in development

```bash
npm run dev
```

### Build the Android app

```bash
npm run build
npx cap sync android
```

Then open the `android` folder in Android Studio and build the APK from there
(**Build → Build Bundle(s) / APK(s) → Build APK(s)**).

---

## 📂 Project Structure

```
ledgr/
├── src/
│   ├── screens/        # All app screens (Dashboard, Reports, etc.)
│   ├── components/      # Reusable UI components
│   └── ...
├── android/              # Capacitor Android native project
├── public/
└── package.json
```

---

## 🎯 Why I Built This

Most billing apps require constant internet access and subscriptions, which isn't practical for small shopkeepers with unreliable connectivity. Ledgr solves this by keeping everything local and offline.

---

## 📄 License

This project is for portfolio/demonstration purposes.

---

## 👩‍💻 Author

**Aiman Iqbal**
BS Computer Science, UET Lahore

---

## 🔮 Roadmap

- [ ] Add data export (CSV/PDF)
- [ ] Multi-language support (Urdu/English)
- [ ] Cloud backup option
- [ ] Dark mode
[GitHub](https://github.com/iqbal-aiman)

---
*actively maintained and improved*
