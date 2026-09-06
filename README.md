# Ledger — Expense Tracker

A static, client-side expense tracker built with plain HTML, CSS, and JavaScript. All data is stored in the browser's `localStorage` — there is no backend or database.

## Features
- User registration and login (multiple users supported, each with their own data)
- Dashboard with current-month balance, income, and expenses
- Add / edit / delete transactions (income or expense)
- Custom expense categories
- Category-wise spending chart (Chart.js)
- Monthly budget setting per category with progress bars
- Full transaction history with filtering
- Logout

## Tech notes
- No build step — just static files.
- Chart.js is loaded from a CDN in `dashboard.html`.
- Data is namespaced per user in `localStorage`, so multiple accounts can be created in the same browser without mixing data.

## Deploy to GitHub Pages

1. **Create a new GitHub repository** (e.g. `expense-tracker`) — public, no README/gitignore needed since you already have files.
2. **Push these files to the repo:**
   ```bash
   cd expense-tracker
   git init
   git add .
   git commit -m "Initial commit: expense tracker app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/expense-tracker.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - Go to your repo on GitHub → **Settings** → **Pages** (left sidebar).
   - Under "Build and deployment", set **Source** to `Deploy from a branch`.
   - Set **Branch** to `main` and folder to `/ (root)`. Click **Save**.
4. **Wait ~1 minute**, then refresh the Pages settings page — it will show your live URL, typically:
   `https://<your-username>.github.io/expense-tracker/`
5. Visit that URL — `index.html` (the login/register page) loads automatically.

That's it — every push to `main` will redeploy the site automatically.

## Deploy to EC2 (optional, to demonstrate AWS)
1. Launch an Ubuntu EC2 instance.
2. In the instance's **Security Group**, allow inbound **HTTP (TCP 80)** from anywhere.
3. SSH in and install Apache:
   ```bash
   sudo apt update
   sudo apt install apache2 -y
   ```
4. Upload the project files into `/var/www/html/` (replacing the default index):
   ```bash
   scp -i your-key.pem -r ./* ubuntu@<ec2-public-ip>:/tmp/expense-tracker
   ssh -i your-key.pem ubuntu@<ec2-public-ip>
   sudo rm -rf /var/www/html/*
   sudo cp -r /tmp/expense-tracker/* /var/www/html/
   ```
5. Visit `http://<ec2-public-ip>/` in your browser.
