# Aircraft Information System

A modern, real-time aircraft fleet management dashboard built with Next.js, TypeScript, and Tailwind CSS. Monitor, track, and manage your aircraft fleet with intuitive controls and interactive visualizations.

🚀 **Live Demo:** [https://aircraft-info-ui.vercel.app/](https://aircraft-info-ui.vercel.app/)

⚡ **Development Time:** 65 minutes from concept to deployment

## Features

- **Real-time Fleet Overview**: Interactive dashboard with aircraft status summaries
- **Interactive Map**: Leaflet-powered map visualization showing aircraft locations
- **Advanced Filtering**: Filter aircraft by tail number, model, and status
- **Status Management**: Click-to-edit aircraft status (Available, AOG, Maintenance)
- **Responsive Design**: Modern, mobile-friendly interface with gradient designs
- **Local Storage**: Persistent data storage for status updates
- **Real-time Updates**: Instant UI updates with smooth animations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Deployment**: Vercel
- **Icons**: Heroicons (SVG)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Aircraft-Info-UI
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Running the Application

After starting the development server, the application will be available at `http://localhost:3000`. The interface includes:

1. **Header Dashboard**: Overview of aircraft counts by status
2. **Interactive Map**: Click aircraft markers for details
3. **Filter Controls**: Search and filter aircraft by various criteria
4. **Aircraft Table**: Comprehensive list with click-to-edit status updates

### Updating Aircraft Status

- Click on any aircraft row in the table
- Select a new status from the dropdown (Available, AOG, Maintenance)
- Changes are saved automatically to local storage

### Map Interaction

- Zoom and pan to explore aircraft locations
- Click markers to highlight aircraft in the table
- Different colors represent different aircraft statuses

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── AircraftMap.tsx    # Main map wrapper component
│   │   └── LeafletMap.tsx     # Leaflet map implementation
│   ├── api/
│   │   └── aircraft/          # API routes for aircraft data
│   ├── page.tsx               # Main dashboard page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
└── data/                      # Sample aircraft data
```

## API Endpoints

- `GET /api/aircraft` - Retrieve all aircraft data
- Aircraft data includes tail numbers, models, status, and GPS coordinates

## Development Notes

This project was rapidly developed in **65 minutes** as a demonstration of modern web development capabilities, showcasing:

- Component-based architecture
- TypeScript for type safety
- Responsive design patterns
- Interactive data visualization
- Real-time state management

## Deployment

The application is deployed on Vercel and automatically deploys from the main branch.

**Live Application**: [https://aircraft-info-ui.vercel.app/](https://aircraft-info-ui.vercel.app/)

To deploy your own instance:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically build and deploy your application

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [React Leaflet](https://react-leaflet.js.org/) - React components for Leaflet maps
- [TypeScript](https://www.typescriptlang.org/docs/) - typed JavaScript

## License

This project is open source and available under the MIT License.
