# Product Requirements Document (PRD)
**Project:** Dairy Management System
**Platform:** Web Dashboard & Mobile App

## 1. Introduction
The Dairy Management System is a comprehensive platform designed to manage daily milk collection, milk dispatch, livestock tracking, and feed inventory. It bridges the gap between on-field workers and administrative managers.

## 2. Target Audience
* **Admin / Managers:** Will use the Web Dashboard to monitor daily metrics, view reports, and manage finances.
* **Farm Workers / Drivers / Collection Agents:** Will use the Mobile Application for quick data entry (milking volumes, feed usage, collection inputs).

## 3. Core Features & Capabilities

### 3.1 Milk Management
* **Milk Collection (In):**
  * Log morning and evening milk collection.
  * Classify by source (Cow vs. Buffalo).
  * Record Fat and SNF (Solid Not Fat) percentages if applicable.
  * Record Volume (in Liters).
* **Milk Dispatch (Out):**
  * Log outgoing milk volumes.
  * Track buyer/destination details.

### 3.2 Livestock Management
* **Livestock Count:**
  * Track total count of Cows and Buffaloes.
  * Track status (Milking, Dry, Heifer, Calves).
* **Health & Medical Logs:**
  * Basic log for veterinary visits and vaccinations.

### 3.3 Inventory & Financial Management
* **Feed Tracking:**
  * Log incoming feed inventory (Dry fodder, Green fodder, Concentrates).
  * Log daily consumption.
  * Low-stock alerts / visual indicators on the dashboard.
* **Equipment / Medicine:**
  * Basic tracking for farm tools and medical supplies.
* **Financial Tracking (Money Track):**
  * **Income:** Track daily revenue from milk sales (by Fat/SNF calculations and volume).
  * **Expenses:** Log payments made for feed stock, livestock purchases, and medical supplies.
  * **Ledger:** Maintain a running balance/ledger for individual farmers (if buying milk) or for the overall farm (if owned livestock).

### 3.4 Dashboard & Analytics (Web)
* **Overview Metrics:** Total milk collected today, total dispatched, active livestock count, current financial balance.
* **Charts/Graphs:** Milk collection trends over the week/month, Income vs. Expense charts.
* **Inventory Status:** Quick view of current feed levels.

## 4. Platform Specifications

### 4.1 Web Dashboard
* **Architecture:** Single Page Application (Next.js or React preferred).
* **Design Guidelines:** Premium, responsive aesthetic with modern tables and chart visualizations. Dark/Light mode support.

### 4.2 Mobile Application
* **Architecture:** Cross-platform (React Native / Expo).
* **Design Guidelines:** Large, touch-friendly buttons for easy data entry. High contrast, works well in outdoor/farm settings. Offline-first capabilities (optional phase 2) but highly responsive.

## 5. Non-Functional Requirements
* **Performance:** Daily entry logs must sync to the dashboard with less than 2 seconds latency.
* **Usability:** The mobile app must require minimal typing (use number pads, dropdowns, and large switches).
* **Data Integrity:** Historical collection data must be immutable by standard workers, editable only by admins.
