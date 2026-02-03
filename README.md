# Goosedyssey 🪿

**The modern UI overhaul for the University of Waterloo's Odyssey exam schedule System.**

Goosedyssey transforms the standard (and slightly outdated) Odyssey table into a clean, responsive, and feature-rich dashboard. Stop squinting at rows of text—get countdowns, visual alerts for midterms, and one-click calendar exports.

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/jlbdageklahnfedmlblfbmickaajkbha?utm_source=item-share-cb)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)

## 📥 Install

**[Click here to add to Chrome](https://chromewebstore.google.com/detail/jlbdageklahnfedmlblfbmickaajkbha?utm_source=item-share-cb)**

*(No manual setup required. Just install and go!)*

## ✨ Key Features

* **🎨 Modern Dashboard:** Replaces the raw HTML table with a "Squircular" card-based interface inspired by Swiss typography.
* **⏳ Smart Countdowns:** Real-time tracking of days, hours, and minutes until your next assessment.
* **🚨 Exam Intelligence:** Automatically detects and highlights **Midterms (Orange)** and **Finals (Red)** so they’re impossible to miss.
* **📅 Calendar Export:** One-click generation of `.ics` files to sync your entire schedule with Google Calendar, Outlook, or Apple Calendar.
* **🔍 Powerful Filtering:** Focus on what matters by filtering assessments by specific courses (e.g., `MATH 136`).
* **🌙 Dark Mode:** Fully supports system-wide dark mode with a high-contrast aesthetic.
* **🔒 Privacy First:** Runs 100% client-side. No user data is collected, stored, or sent to any server.

## 🛠️ Usage

1.  **Dashboard:** Upon logging into [Odyssey](https://odyssey.uwaterloo.ca/teaching/schedule), the extension will automatically inject the new dashboard.
2.  **Filtering:** Use the "All Courses" dropdown to isolate specific subjects.
3.  **Past/Future:** Use the "Show Past" button to toggle completed assessments.
4.  **Export:** Click "Export Calendar" to download your schedule file (`odyssey_schedule.ics`).

## 🏗️ Built With

* **JavaScript (ES6+):** Core logic for DOM manipulation and date parsing.
* **CSS3 (Variables):** Advanced styling using CSS custom properties for theming.
* **Chrome Extension API (Manifest V3):** The modern standard for browser extensions.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or bug fixes:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Not affiliated with the University of Waterloo. This is a student-made tool.*
