# Ledger — Expense Tracker

A fully client-side personal expense tracker built with vanilla HTML, CSS, and JavaScript — no frameworks, no backend, no build step. All data is stored locally in the browser using `localStorage`.

**Live demo:** https://abhishek071700.github.io/expence-tracker/

![Made with HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Made with CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Made with JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)

---

## Overview

Ledger is a personal finance dashboard where users can register an account, log income and expenses, organize spending into categories, set monthly budgets, and visualize spending patterns over time — entirely in the browser, with no server required.

I built this project to practice designing a complete front-end application from scratch: authentication flow, CRUD operations, data visualization, and a cohesive design system, all without relying on a framework.

## Features

- **Authentication** — user registration and login, with each account's data kept separate
- **Dashboard** — current-month balance, income, and expense summary at a glance
- **Transaction management** — add, edit, and delete income or expense entries
- **Custom categories** — organize spending beyond the built-in defaults
- **Budgets** — set a monthly limit per category and track progress with a visual bar
- **Transaction history** — full log with category and type filters
- **Analytics**
  - Category breakdown for the current month (doughnut chart)
  - Income vs. expenses trend over the last 6 months (bar chart)
  - Top-category spending trend over time (line chart)
- **Logout** and session handling

## Tech stack

| Layer | Choice |
|---|---|
| Structure | HTML5 |
| Styling | Hand-written CSS (custom design system, no framework) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | [Chart.js](https://www.chartjs.org/) via CDN |
| Storage | Browser `localStorage` — no database or server |
| Hosting | GitHub Pages |

## Project structure
