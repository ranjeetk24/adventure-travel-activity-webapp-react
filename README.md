# Local Activity Booking Platform  

A **React-based MVP** for discovering, booking, and managing local activities — focused on local experiences.  

## ✨ Features  

- **Home**: landing page with background image and navigation.  
- **Search**:  
  - Keyword query  
  - Category filters  
  - Price sliders + numeric inputs (commit on blur/Enter)  
  - Sorting (relevance, price, name)  
  - Deduplication of activities  
- **Activity Detail**:  
  - Activity info with image + rating stars  
 
- **Booking**: booking flow for activities.  
- **Supplier Dashboard**:  
  - Controlled form with validation (name, category, price, rating, imageUrl) (Rating just to show (MVP)) 
  - Adds activity once (idempotent dedupe)  
  - Activities grid with images + tiny star ratings  
  - Calendar highlighting bookings  
  - Payout summary  
  - Utility: clear local storage (reset mock data)  MVP
- **Navbar**:  
  - Responsive (desktop + mobile menu)  
  - Brand logo (SafeImg with local `logo.svg`)  
  - Quick search  
  - Login dropdown (Sign In / Sign Up)  Not Implemented (MVP)
  - Dark/light mode toggle  

## 🛠️ Tech Stack  

- **Frontend**: React, React Router, Context  
- **Styling**:  Bootstrap (Navbar, dropdowns, utilities)  
- **Icons**: Bootstrap Icons  
- **Mock APIs**:  
  - `activityService.js`: activities, bookings, payouts (with picsum fallbacks)  
  - `reviewService.js`: reviews with get/add + seeding  
- **Utilities**:  
  - `SafeImg` (with fallback)  
  - `Stars` (tiny whole-star display only)  

## 🚀 Getting Started  

### 1. Clone the repo  
```bash
git clone https://github.com/your-username/local-activity-booking-platform.git
cd local-activity-booking-platform
```

### 2. Install dependencies  
```bash
npm install
# or
yarn install
```

### 3. Start the dev server  
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` (or your Vite port).  



## 🧩 Mock Data  

- Activities, bookings, and payouts are stored in memory (`activityService.js`).  
- Reviews are stored in memory (`reviewService.js`).  
- Local Storage is used to persist across reloads.  
- Use the **Clear Local Storage** button on Supplier Dashboard to reset.  

## 🎨 UI Preferences  

- Tiny star icons (no half-stars).  
- Minimal numeric labels (only where needed).  
- Responsive, clean layout with Tailwind utility classes + Bootstrap navbar.  

## 🔮 Roadmap  

- [ ] Map preview in ActivityDetail (Leaflet / OSM)  
- [ ] Promo codes in Booking (mock discounts + payout impact)  
- [ ] Q&A section (supplier answers user questions)  
- [ ] Real backend API integration  

---

📌 *This MVP is for prototyping and demonstration purposes — not production-ready.*  


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
