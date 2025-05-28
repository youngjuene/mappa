# Mappa - Dynamic Isochrone Mapping

An innovative mapping application that warps base maps into "isochrone bubbles" where distances reflect real travel times for walking, cycling, or running.

## 🌟 Features

### Core Functions

- **Dynamic Isochrone Distortion** - Automatically warp base maps into "isochrone bubbles" where distances reflect real travel times
- **Polyline-Based Route Heatmap** - Aggregate anonymized path data to generate semi-transparent heatmap overlays showing popular routes
- **Time-Slider Control** - Draggable timeline to scrub through different times of day, updating isochrones and heatmaps in real-time
- **Real-Time ETA and Distance Calculator** - Tap any point for "as-the-crow-flies" vs "network path" estimates
- **Personalized Mode Profiles** - Save multiple profiles with custom speeds, path preferences, and fitness goals
- **Contextual POI Discovery** - Highlight points of interest within time-distorted boundaries
- **Social Sharing & Challenges** - Share isochrone snapshots and create fitness challenges
- **Offline & PWA Mode** - Cache maps and data for offline functionality

### Interaction Design

- 3-step onboarding tutorial with live demos
- Single-tap toggles between "flat view" and "spacetime view"
- Long-press to place destination pins
- Animated transitions with fluid morphing
- Smart tap & hold interactions
- Profile-driven defaults
- Responsive and accessible UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Distance Matrix API
  - Places API

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd mappa
   npm run install:all
   ```

2. **Configure Google Maps API:**

   ```bash
   # Create environment file
   cp frontend/.env.example frontend/.env

   # Edit the .env file and add your Google Maps API key
   # VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application.

## 🗂️ Project Structure

```
mappa/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── MapContainer.tsx
│   │   │   ├── TimeSlider.tsx
│   │   │   ├── ProfilePanel.tsx
│   │   │   └── ...
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── api/                # API routes
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   └── package.json
└── package.json            # Root package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Configuration
VITE_APP_NAME=Mappa
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEBUG_MODE=true
```

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## 🎮 Usage

### Creating a Profile

1. Click "Create Profile" when you first open the app
2. Set your travel mode (walking, cycling, running)
3. Configure your speed and preferences
4. Save your profile

### Exploring Isochrones

1. **Flat View**: Traditional map view
2. **Spacetime View**: Distorted view showing travel time as distance
3. **Single tap**: Toggle between views
4. **Long press**: Place destination pins for route calculation

### Time Controls

- Use the time slider at the bottom to see how isochrones change throughout the day
- Auto-play feature shows animated changes over time
- Different intensities indicate traffic and accessibility patterns

## 🛠️ Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers (frontend + backend)
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start
```

### Tech Stack

**Frontend:**

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Google Maps JavaScript API

**Backend:**

- Node.js with Express
- TypeScript
- RESTful API design

## 🎨 Design System

The application uses a custom design system with:

- **Colors**: Primary blues and purples for isochrone visualization
- **Typography**: Clean, readable fonts optimized for map overlays
- **Animations**: Smooth transitions between map states
- **Accessibility**: WCAG 2.1 AA compliant

## 📱 PWA Features

- Offline map caching
- Install as native app
- Background sync for route data
- Push notifications for challenges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**"Google Maps API key not found" error:**

- Make sure you've created a `.env` file in the `frontend/` directory
- Verify your API key is correct and has the required APIs enabled

**Map not loading:**

- Check browser console for errors
- Verify your API key has the correct permissions
- Ensure you're not exceeding API quotas

**Isochrones not calculating:**

- Verify Distance Matrix API is enabled
- Check that your location has sufficient road network data

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Google Maps API documentation](https://developers.google.com/maps/documentation)
- Contact the development team

---

Built with ❤️ by the Mappa Team
