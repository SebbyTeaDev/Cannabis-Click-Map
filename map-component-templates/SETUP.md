# Setup Instructions

## Step 1: Install Dependencies

Copy the dependencies from `package.json.template` to your `package.json`:

```bash
npm install d3-geo topojson-client framer-motion
```

If using React:
```bash
npm install react react-dom
```

If using Next.js:
```bash
npm install next react react-dom
```

## Step 2: Copy Files

Copy the template files to your project:

```
components/InteractiveUSMap.js
components/Skeleton.js
data/states.js
styles/map.css
styles/skeleton.css
```

## Step 3: Update Import Paths

### For Next.js (with path aliases)

If you have `@/` aliased to `src/` in `jsconfig.json` or `tsconfig.json`, the imports should work as-is.

### For React (without path aliases)

Update imports in `InteractiveUSMap.js`:

```javascript
// Change from:
import { Skeleton } from '@/components/Skeleton';
import { states } from '@/data/states';
import '@/styles/map.css';

// To:
import { Skeleton } from '../components/Skeleton';
import { states } from '../data/states';
import '../styles/map.css';
```

Or set up path aliases in your build tool (Vite, Webpack, etc.).

## Step 4: Update Routing

The component uses Next.js router by default. To use a different router:

### React Router

```javascript
// In InteractiveUSMap.js, replace:
import { useRouter } from 'next/navigation';

// With:
import { useNavigate } from 'react-router-dom';

// Then update handleStateClick:
const navigate = useNavigate();
const handleStateClick = useCallback((code) => {
  navigate(`/states/${code}`);
}, [navigate]);
```

### Custom Router

```javascript
// Replace handleStateClick with your navigation logic:
const handleStateClick = useCallback((code) => {
  // Your custom navigation here
  window.location.href = `/states/${code}`;
  // or
  yourRouter.navigate(`/states/${code}`);
}, []);
```

## Step 5: Add CSS

The component imports CSS files automatically. Make sure both CSS files are accessible:

1. **map.css** - Imported in `InteractiveUSMap.js` (update import path if needed)
2. **skeleton.css** - Add to your stylesheet:
   - Copy contents to your main CSS file, OR
   - Import `skeleton.css` in your component/app entry point

If not using path aliases, update the import in `InteractiveUSMap.js`:
```javascript
// Change from:
import '@/styles/map.css';

// To:
import '../styles/map.css'; // or your relative path
```

## Step 6: Optional - Remove Resource Prefetching

If you don't need resource prefetching, remove or comment out:

1. Lines 211-219 in `handleStateClick`
2. Lines 282-290 in the `onPointerEnter` handler

## Step 7: Customize Colors

Update status colors in `InteractiveUSMap.js`:

- `STATUS_COLORS` (lines 74-81) - Base state colors
- `STATUS_HOVER_COLORS` (lines 83-90) - Hover state colors

## Step 8: Test

1. Import and render the component:
   ```javascript
   import InteractiveUSMap from './components/InteractiveUSMap';
   
   function App() {
     return <InteractiveUSMap />;
   }
   ```

2. Verify:
   - Map loads and displays all 50 states
   - States are colored correctly
   - Hover effects work
   - Click navigation works
   - Loading skeleton displays

## Troubleshooting

### Map doesn't load
- Check browser console for errors
- Verify TopoJSON URL is accessible
- Check network tab for failed requests

### States not colored
- Verify `states.js` is imported correctly
- Check that state codes match between `states.js` and FIPS mapping

### Routing doesn't work
- Verify router is set up correctly
- Check that `handleStateClick` is using your router

### Styling issues
- Ensure both `map.css` and `skeleton.css` are loaded
- Verify the CSS import path in `InteractiveUSMap.js` matches your project structure
- Check that CSS files are accessible from the component location
