# Destinations and Cities Section

This component provides a multi-select interface for selecting destinations and cities in the itinerary form.

## Features

- **Multi-select destinations**: Select multiple destinations using the MultiSelect component
- **Dynamic city loading**: Cities are loaded based on selected destinations
- **Form integration**: Uses React Hook Form with useFormContext
- **React Query caching**: Efficient data fetching with caching and error handling
- **Loading states**: Visual feedback during data loading
- **Error handling**: Displays error messages when API calls fail

## API Integration Examples

### Real API Implementation

Replace the mock functions with actual API calls:

```typescript
// Real API implementation for destinations
const fetchDestinations = async (): Promise<Destination[]> => {
  try {
    const response = await fetch('/api/destinations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch destinations: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.destinations || data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error; // Re-throw to let React Query handle the error
  }
};

// Real API implementation for cities
const fetchCitiesByDestinations = async (destinationIds: string[]): Promise<City[]> => {
  try {
    const queryParams = new URLSearchParams({
      destinationIds: destinationIds.join(','),
    });
    
    const response = await fetch(`/api/cities?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.cities || data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error; // Re-throw to let React Query handle the error
  }
};
```

### API Endpoints

Your backend should provide these endpoints:

#### GET /api/destinations

**Response:**
```json
{
  "destinations": [
    {
      "id": "1",
      "name": "Nepal",
      "slug": "nepal",
      "content": "Beautiful country in the Himalayas",
      "featured": false,
      "currency": "NPR",
      "languages": ["Nepali", "English"],
      "cities": [],
      "images": [],
      "faqs": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/cities?destinationIds=1,2,3

**Response:**
```json
{
  "cities": [
    {
      "id": "c1",
      "name": "Kathmandu",
      "slug": "kathmandu",
      "destinationId": "1"
    },
    {
      "id": "c2",
      "name": "Pokhara",
      "slug": "pokhara",
      "destinationId": "1"
    }
  ]
}
```

## Form Schema

The component expects the form to have these fields:

```typescript
// From itinerary-form-schema.ts
destinations: z.array(destinationSelectionSchema).optional().default([]),
cities: z.array(citySelectionSchema).optional().default([]),

// Where:
const destinationSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const citySelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  destinationId: z.string().optional(),
});
```

## Usage

The component is automatically integrated into the itinerary form:

```typescript
// In itinerary-form/index.tsx
import { DestinationsCitiesSection } from './sections';

// Used in the form tabs
{
  value: "destinations",
  label: "Destinations",
  content: <DestinationsCitiesSection />,
}
```

## Error Handling

The component handles various error states:

- **Network errors**: When API calls fail
- **Loading states**: Shows loading indicators
- **Empty states**: When no data is available
- **Validation errors**: Form validation messages

## Performance Optimizations

- **React Query caching**: Data is cached for 10 minutes
- **Stale time**: Data is considered fresh for 5 minutes
- **Memoized dependencies**: Prevents unnecessary re-renders
- **Conditional queries**: Cities are only fetched when destinations are selected

## Customization

You can customize the component by:

1. **Modifying the MultiSelect props**: Change labels, placeholders, etc.
2. **Adjusting query options**: Change cache times, retry logic
3. **Adding custom validation**: Extend the form schema
4. **Styling**: Modify the Card and FormField components