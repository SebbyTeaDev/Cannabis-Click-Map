# InteractiveUSMap Component Templates

This directory contains all the template files needed to use the InteractiveUSMap component in your project.

## Quick Start

1. Copy the files from this directory to your project
2. Install the required dependencies (see `package.json.template`)
3. Update import paths to match your project structure
4. Customize routing/navigation as needed
5. Add the skeleton CSS to your stylesheet

## File Structure

```
your-project/
├── components/
│   ├── InteractiveUSMap.js    # Main map component
│   └── Skeleton.js            # Loading skeleton component
├── data/
│   └── states.js              # State data (name, status, flag)
├── styles/
│   ├── map.css               # Map component styles
│   └── skeleton.css          # Skeleton loading animation
└── package.json               # Dependencies (see package.json.template)
```

## Files Included

- **InteractiveUSMap.js** - Main interactive map component
- **Skeleton.js** - Loading skeleton component
- **states.js** - State data with names, statuses, and flag URLs
- **map.css** - CSS styles for the map component
- **skeleton.css** - CSS for skeleton loading animation
- **package.json.template** - Required npm dependencies
- **SETUP.md** - Detailed setup instructions

## Customization Required

1. **Import Paths**: Update `@/components`, `@/data`, and `@/styles` to match your project's path aliases
2. **Routing**: Replace Next.js router with your routing solution (see component comments)
3. **Resource Prefetching**: Remove or adapt the resource cache prefetching if not needed (optional)
4. **Client Directive**: Remove `'use client'` from `InteractiveUSMap.js` and `Skeleton.js` if not using Next.js App Router

## Dependencies

See `package.json.template` for the complete list. Core dependencies:
- `d3-geo` - Geographic projections
- `topojson-client` - TopoJSON parsing
- `framer-motion` - Animations
- `react` & `react-dom` - React framework

**Note**: Styles are now in separate CSS files (`map.css` and `skeleton.css`). Update the import path for `@/styles/map.css` to match your project structure if not using path aliases.

## External Resources

- TopoJSON data is loaded from: `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`
- No additional setup required - loaded automatically

## Next Steps

1. Read `SETUP.md` for detailed setup instructions
2. Review `InteractiveUSMap.js` comments for customization points
3. Test the component in your project
4. Customize colors, routing, and behavior as needed
