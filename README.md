# Finnish Company Search Application

A modern web application that provides a streamlined interface for searching Finnish companies using the Finnish Patent and Registration Office (PRH) API.

## Features

- **Company Search**: Search companies by:
  - Business ID (Finnish format: 1234567-8)
  - Town name (e.g., Helsinki)
  - Registration date range
- **Validation**: Input validation for all search fields
- **Pagination**: Browse through large result sets (100 companies per page)
- **Company Details**: View comprehensive information for each company
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Tech Stack

### Frontend

- **React**: Chosen for its component-based architecture and efficient rendering
- **TypeScript**: Provides static typing to improve code quality and developer experience
- **Vite**: Fast, modern build tool that significantly improves development experience
- **Material UI**: Comprehensive component library with a clean, modern design system
- **React Query**: Manages server state with built-in caching and optimistic updates
- **DayJS**: Lightweight date manipulation library for handling registration dates

### API

- **PRH Open Data API**: Official Finnish Patent and Registration Office API for company information

## Design Decisions

- **React Query**: Used for state management and data fetching with built-in caching, which improves performance when navigating between pages
- **Material UI**: Provides consistent, accessible UI components that follow Material Design principles
- **TypeScript**: Ensures type safety across the application, reducing runtime errors
- **Vite**: Chosen over Create React App for faster startup and hot module replacement
- **Modular Architecture**: Components are designed to be reusable and maintainable

## Getting Started

### Prerequisites

- Node.js (version 16 or later)
- npm or pnpm (pnpm recommended)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd finnish-company-search
```

2. Install dependencies

```bash
# Using pnpm (recommended)
pnpm install
```

#### Development Mode

```bash
# Using pnpm
pnpm dev
```

This will start the development server at http://localhost:5173
