Here is a professional and comprehensive **README.md** file for your project. This is designed to be the "face" of your repository, explaining what the app does, how it’s built, and how to get it running.

***

# 📖 Royal Road Reader

A high-performance, native mobile application built with **React Native** and **Expo** designed for searching, downloading, and reading web fictions from Royal Road. 

Unlike most web-based readers, this app uses a custom native scraper and a native `ScrollView` rendering engine to provide a smooth, "Apple-style" reading experience with offline support.

## ✨ Features

- **🔍 Live Search:** Real-time scraping of the Royal Road database to find your favorite fictions.
- **📥 Smart Downloader:** 
  - Download entire novels for offline reading.
  - Individual chapter download support.
  - Background cover image caching using `expo-file-system`.
- **📱 Premium Reader Experience:**
  - **Apple Typography:** Default high-quality Sans-Serif font stack.
  - **Justified Text:** Clean, book-like formatting for better readability.
  - **Customizable UI:** Toggleable settings to change font size (A-/A+) and font styles (Apple Sans, Serif, Mono).
  - **Native Performance:** Uses native components instead of heavy WebViews for a lag-free experience.
- **💾 Local Persistence:** 
  - Powered by **SQLite** (`expo-sqlite`) to store novel metadata, chapter content, and reading progress.
- **🛡️ Resilience:** Robust Regex-based scraping engine designed to handle layout changes without crashing the app.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (via [Expo SDK 54](https://expo.dev/))
- **Networking:** [Axios](https://axios-http.com/)
- **Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Storage:** [Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- **Navigation:** [React Navigation v6](https://reactnavigation.org/)
- **Scraping:** Custom Regex Engine (Optimized for mobile environments)

---

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI (DownloadButton, ChapterItem, NovelCard)
├── constants/      # Configuration, Colors, and URL definitions
├── navigation/     # AppNavigator and routing logic
├── screens/        # Main views (Library, Search, NovelDetail, Reader)
└── services/       
    ├── scraper.js  # The heart of the app: logic for fetching web data
    ├── database.js # SQLite logic for CRUD operations
    └── downloader.js # Logic for chapter and cover downloads
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- Expo Go app on your [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS](https://apps.apple.com/us/app/expo-go/id982107779) device.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/royal-road-reader.git
   cd royal-road-reader
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with your device to start testing.

---

## 🏗️ Building for Production (APK)

This project uses **EAS Build** for cloud-based APK generation:

1. Install EAS CLI: `npm install -g eas-cli`
2. Configure: `eas build:configure`
3. Build the APK (Preview):
   ```bash
   eas build -p android --profile preview
   ```

---

## ⚙️ Configuration
You can customize the look and feel of the app in `src/constants/config.js`:
- `COLORS`: Change primary, accent, and reader theme colors.
- `DEFAULT_FONT_SIZE`: Set the base reading size.
- `REQUEST_DELAY_MS`: Adjust the delay between requests to remain polite to Royal Road's servers.

---

## 📜 Legal Disclaimer
This application is intended for **personal use only**. It is a third-party tool and is not affiliated with, endorsed by, or sponsored by Royal Road. Users should respect the Terms of Service of Royal Road and the intellectual property rights of the authors. 

---

## 🤝 Contributing
Feel free to open issues or submit pull requests to improve the scraper resilience or add new reader themes!

---

## 📝 License
MIT License - Copyright (c) 2024
