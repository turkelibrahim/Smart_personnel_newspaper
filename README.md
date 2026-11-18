# 📰 Smart Personnel Newspaper — Kişiselleştirilmiş Dijital Gazete

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/NLP%20%26%20RecSys-10B981?style=flat-square" alt="NLP & RecSys" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
</p>

An AI-assisted personalized news aggregation and digital newspaper platform that curates daily editions based on reader interest profiles, reading habits, and multi-source NLP categorization.

![Smart Personnel Newspaper Dashboard](./preview.webp)

---

## ✨ Key Capabilities

- **Multi-Source News Ingestion & Deduplication:** Automated RSS/crawler pipelines with source citation tracking and duplicate cluster detection.
- **NLP Categorization & Explainable Recommendations:** Multi-label topic classification (`Gündem`, `Finans`, `Yapay Zekâ`, `Eğitim`, `Kültür-Sanat`) with match-score explanations (e.g., `%76 Sana Özel`).
- **Reader Persona & Pacing Modes:** Tailored daily feeds for morning, evening, night, or mixed reading styles.
- **Trending Story Clustering & Print-Ready PDF Export:** Groups related coverage across sources and exports A4/tabloid digital newspaper editions.

---

## 🏗️ System Architecture

1. **Ingestion Layer:** Scheduled crawlers & RSS connectors normalize articles and remove near-duplicates.
2. **NLP & Ranking Engine:** Computes semantic similarity, category weights, and user-interest match scores.
3. **Web Application & PDF Edition Service:** Delivers the interactive newspaper dashboard, saved bookmarks, calendar events, and downloadable PDF editions.

---

## 👤 Author

**İbrahim Türkel** — [ibrahimturkel.com.tr](https://ibrahimturkel.com.tr) · [GitHub](https://github.com/turkelibrahim) · [LinkedIn](https://www.linkedin.com/in/ibrahim-t%C3%BCrkel-065283261/)
