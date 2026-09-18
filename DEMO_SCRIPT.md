# Fasalo: Smart India Hackathon 2026 Demo Script

**Target Time:** 3 minutes  
**Goal:** Show a complete end-to-end flow from farm to table, highlighting AI pricing, escrow protection, and logistics.

## Before presenting
1. Open a terminal in the **root `fasalo` folder** and run:
   ```bash
   npm run dev
   ```
   *(This starts the backend, frontend, and AI microservice simultaneously via concurrently).*
2. Open your browser to `http://localhost:3000`.

---

## The Script (Action-by-Action)

### Step 1: The Landing Page (0:00 - 0:20)
* **Action**: Scroll through the homepage.
* **Talking point**: "Welcome to Fasalo! We are directly connecting farmers with consumers and bulk buyers to solve Problem Statement 26033. Our platform features AI pricing, escrow protection, and smart logistics."
* **Action**: Click the **Login** button.

### Step 2: Farmer Listing & AI Pricing (0:20 - 1:10)
* **Action**: On the login page, click the pre-filled **"Farmer Demo"** card (Ramesh Kumar) and hit Login.
* **Action**: You'll land on the Farmer Dashboard. Briefly show the "Tomato Market Trend" graph and the top crop metrics.
* **Action**: Navigate to **"My Listings"** using the top navbar.
* **Action**: Click "Create New Listing". 
* **Talking point**: "Let's list some fresh Tomatoes. Notice that as soon as we type 'Tomato' and our location, our AI Service calls the backend to predict the best market price based on historical eNAM data."
* **Action**: Fill in the crop details and hit **Publish**.
* **Action**: Click the user profile icon (top right) and click **Sign out**.

### Step 3: Consumer Purchase & Escrow (1:10 - 2:00)
* **Action**: Click the **"Consumer Demo"** card (Priya Sharma) and login.
* **Talking point**: "Now, switching to the consumer's perspective. We skip all the middlemen."
* **Action**: Go to **Browse** and click on the Tomato listing Ramesh just created.
* **Action**: Click **Buy Now**.
* **Talking point**: "The payment is now locked securely in Escrow. The farmer only gets paid once Priya confirms delivery."
* **Action**: Go to **My Orders** to show the pending order in "Payment in Escrow" state.
* **Action**: Sign out.

### Step 4: Logistics & Completion (2:00 - 3:00)
* **Action**: Log back in as **Ramesh (Farmer)**.
* **Action**: Go to **Logistics**.
* **Talking point**: "Ramesh sees the confirmed order and can now arrange transport. We also show nearby cold-storage capacities to prevent spoilage."
* **Action**: Schedule the transport. Show the beautiful timeline progress bar tracking the shipment status.
* **Action**: Go to **Advisories** to show the Live Weather integration and eNAM market prices.
* **Action (Optional final wow factor)**: Click the **"हिंदी"** language button in the navbar to show the entire UI translating instantly via our integration!
* **Talking point**: "With Fasalo, farmers get paid more, consumers pay less, and nothing goes to waste. Thank you!"
