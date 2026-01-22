'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// TODO: Replace with your routing solution
// Next.js: import { useRouter } from 'next/navigation';
// React Router: import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation'; // REMOVE if not using Next.js
import { motion } from 'framer-motion';
import { geoAlbersUsa, geoPath, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
// TODO: Update import paths to match your project structure
import { Skeleton } from '@/components/Skeleton';
import { states } from '@/data/states';
import '@/styles/map.css';

const MAP_WIDTH = 980;
const MAP_HEIGHT = 610;
const TOPO_JSON_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const FIPS_TO_STATE = {
  '01': 'al',
  '02': 'ak',
  '04': 'az',
  '05': 'ar',
  '06': 'ca',
  '08': 'co',
  '09': 'ct',
  '10': 'de',
  '11': 'dc',
  '12': 'fl',
  '13': 'ga',
  '15': 'hi',
  '16': 'id',
  '17': 'il',
  '18': 'in',
  '19': 'ia',
  '20': 'ks',
  '21': 'ky',
  '22': 'la',
  '23': 'me',
  '24': 'md',
  '25': 'ma',
  '26': 'mi',
  '27': 'mn',
  '28': 'ms',
  '29': 'mo',
  '30': 'mt',
  '31': 'ne',
  '32': 'nv',
  '33': 'nh',
  '34': 'nj',
  '35': 'nm',
  '36': 'ny',
  '37': 'nc',
  '38': 'nd',
  '39': 'oh',
  '40': 'ok',
  '41': 'or',
  '42': 'pa',
  '44': 'ri',
  '45': 'sc',
  '46': 'sd',
  '47': 'tn',
  '48': 'tx',
  '49': 'ut',
  '50': 'vt',
  '51': 'va',
  '53': 'wa',
  '54': 'wv',
  '55': 'wi',
  '56': 'wy'
};

// TODO: Customize these colors to match your design
const STATUS_COLORS = {
  Legalized: '#15803d',
  'Medical & Decriminalized': '#209D50',
  Medical: '#4ade80',
  Decriminalized: '#f97316',
  'CBD Only': '#6B7280',
  'Fully Illegal': '#EF4444'
};

const STATUS_HOVER_COLORS = {
  Legalized: '#1f9a4b',
  'Medical & Decriminalized': '#2eb965',
  Medical: '#6ee7b7',
  Decriminalized: '#fb923c',
  'CBD Only': '#94A3B8',
  'Fully Illegal': '#f87171'
};

const LABEL_CONFIG = {
  ak: { dy: 0, fontSize: 13 },
  hi: { dx: -40, dy: 0, fontSize: 13, line: true, lineLabelOffsetX: 18 },
  fl: { dx: 18, dy: 4 },
  ma: { dx: 32, dy: -10, line: true },
  la: { dx: -10 },
  ri: { dx: 40, dy: -6, line: true },
  ct: { dx: 28, dy: 12, line: true },
  nj: { dx: 24, dy: 12, line: true },
  de: { dx: 26, dy: 18, line: true },
  md: { dx: 26, dy: 35, line: true },
  mi: { dx: 14, dy: 28 },
  dc: { dx: 20, dy: -6, line: true },
  vt: { dy: -10 },
  nh: { dy: 10 },
  me: { dy: -7 }
};

const smallTextStates = new Set(['ri', 'ct', 'nj', 'de', 'md', 'dc']);

export default function InteractiveUSMap() {
  // TODO: Replace with your routing solution
  const router = useRouter(); // REMOVE if not using Next.js
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCode, setHoveredCode] = useState('');
  const hoverFrame = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    async function loadTopology(retryAttempt = 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(TOPO_JSON_URL, {
          signal: controller.signal,
          cache: 'force-cache'
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch US topology: ${response.status} ${response.statusText}`);
        }
        
        const topology = await response.json();
        if (!isMounted) return;

        if (!topology || !topology.objects || !topology.objects.states) {
          throw new Error('Invalid topology data structure');
        }

        const { features: geoFeatures } = feature(topology, topology.objects.states);
        if (!isMounted) return;

        setFeatures(geoFeatures);
        setError('');
        setIsLoading(false);
      } catch (err) {
        console.error('Interactive map failed to load', err);
        
        if (!isMounted) return;

        if (retryAttempt < MAX_RETRIES && err.name !== 'AbortError') {
          retryCount = retryAttempt + 1;
          setTimeout(() => {
            if (isMounted) {
              loadTopology(retryCount);
            }
          }, RETRY_DELAY * (retryCount));
        } else {
          setError('Unable to load the map right now. Please try again in a moment.');
          setIsLoading(false);
        }
      }
    }

    loadTopology();

    return () => {
      isMounted = false;
    };
  }, []);

  const projection = useMemo(
    () => geoAlbersUsa().scale(1200).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2.2]),
    []
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const scheduleHoverUpdate = useCallback((nextCode) => {
    if (hoverFrame.current) {
      cancelAnimationFrame(hoverFrame.current);
    }
    hoverFrame.current = requestAnimationFrame(() => {
      setHoveredCode((prev) => (prev === nextCode ? prev : nextCode));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hoverFrame.current) {
        cancelAnimationFrame(hoverFrame.current);
      }
    };
  }, []);

  // TODO: Update this function to use your routing solution
  const handleStateClick = useCallback(
    async (code) => {
      const stateData = states[code];
      if (!stateData) return;

      // OPTIONAL: Remove resource prefetching if not needed
      // This prefetches resources for the clicked state
      if (typeof window !== 'undefined') {
        // Remove or adapt this if you don't have resourceCache
        // import('@/lib/resourceCache').then(({ fetchResourcesWithCache }) => {
        //   fetchResourcesWithCache(code).catch(error => {
        //     console.error(`Error prefetching resources for ${code}:`, error);
        //   });
        // });
      }

      // TODO: Replace with your navigation logic
      router.push(`/${code}`); // Next.js example
      // Full URL: window.location.href = `https://distru.com/states/${code}`;
      // React Router: navigate(`/states/${code}`);
      // Custom: window.location.href = `/states/${code}`;
    },
    [router] // Update dependency array if using different router
  );

  const handleKeyDown = useCallback(
    (event, code) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleStateClick(code);
      }
    },
    [handleStateClick]
  );

  const featureByCode = useMemo(() => {
    const map = {};
    features.forEach((featureShape) => {
      const fips = featureShape.id?.toString().padStart(2, '0');
      const code = FIPS_TO_STATE[fips];
      if (code) {
        map[code] = featureShape;
      }
    });
    return map;
  }, [features]);

  const baseStates = useMemo(() => {
    return features.map((featureShape) => {
      const fips = featureShape.id?.toString().padStart(2, '0');
      const code = FIPS_TO_STATE[fips];
      const stateData = states[code];
      if (!code || !stateData) {
        return null;
      }

      const path = pathGenerator(featureShape);
      const centroid = geoCentroid(featureShape);
      const projected = projection(centroid);
      if (!projected) {
        return null;
      }
      const [cx, cy] = projected;
      const fill = STATUS_COLORS[stateData.status] || 'rgba(255,255,255,0.1)';
      
      // Hide base state when hovered for states that are displayed separately (Alaska, Hawaii, and states with connector lines)
      const statesToHideOnHover = new Set(['ak', 'hi', 'ca', 'la', 'ms', 'fl', 'nc', 'ny', 'mi', 'ma']);
      const isHovered = hoveredCode === code;
      const shouldHide = statesToHideOnHover.has(code) && isHovered;

      return (
        <path
          key={code}
          d={path}
          fill={fill}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={0.7}
          role="button"
          tabIndex={0}
          aria-label={`${stateData.name}: ${stateData.status}`}
          onPointerEnter={() => {
            scheduleHoverUpdate(code);
            // OPTIONAL: Remove resource prefetching if not needed
            // if (typeof window !== 'undefined') {
            //   import('@/lib/resourceCache').then(({ fetchResourcesWithCache }) => {
            //     fetchResourcesWithCache(code).catch(error => {
            //       console.error(`Error prefetching resources for ${code}:`, error);
            //     });
            //   });
            // }
          }}
          onFocus={() => scheduleHoverUpdate(code)}
          onPointerLeave={() => scheduleHoverUpdate('')}
          onBlur={() => scheduleHoverUpdate('')}
          onClick={() => handleStateClick(code)}
          onKeyDown={(event) => handleKeyDown(event, code)}
          className="state-path"
          style={{
            cursor: 'pointer',
            opacity: shouldHide ? 0 : 1,
            pointerEvents: shouldHide ? 'none' : 'auto'
          }}
        />
      );
    });
  }, [features, handleKeyDown, handleStateClick, hoveredCode, pathGenerator, projection, scheduleHoverUpdate]);

  const highlightedState = useMemo(() => {
    if (!hoveredCode) {
      return null;
    }
    const featureShape = featureByCode[hoveredCode];
    const stateData = states[hoveredCode];
    if (!featureShape || !stateData) {
      return null;
    }
    const path = pathGenerator(featureShape);
    const centroid = geoCentroid(featureShape);
    const projected = projection(centroid);
    if (!projected) {
      return null;
    }
    const [cx, cy] = projected;
    const stateLabelConfig = LABEL_CONFIG[hoveredCode] || {};
    const showConnector = Boolean(stateLabelConfig.line);

    return (
      <path
        key={`${hoveredCode}-highlight`}
        d={path}
        fill={STATUS_HOVER_COLORS[stateData.status] || 'rgba(255,255,255,0.25)'}
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth={0.9}
        role="button"
        tabIndex={0}
        aria-label={`${stateData.name}: ${stateData.status}`}
        onPointerEnter={() => scheduleHoverUpdate(hoveredCode)}
        onFocus={() => scheduleHoverUpdate(hoveredCode)}
        onPointerLeave={() => scheduleHoverUpdate('')}
        onBlur={() => scheduleHoverUpdate('')}
        onClick={() => handleStateClick(hoveredCode)}
        onKeyDown={(event) => handleKeyDown(event, hoveredCode)}
        className="state-path state-path--active"
        style={{
          cursor: 'pointer',
          outline: showConnector ? '1.5px solid rgba(255,255,255,0.5)' : 'none',
          transformOrigin: `${cx}px ${cy}px`,
          transform: 'scale(1.1)'
        }}
      />
    );
  }, [
    featureByCode,
    handleKeyDown,
    handleStateClick,
    hoveredCode,
    pathGenerator,
    projection,
    scheduleHoverUpdate
  ]);

  return (
    <div className="interactive-map">
      {isLoading && (
        <div className="map-loader">
          <Skeleton width="100%" height="100%" style={{ borderRadius: '12px' }} />
        </div>
      )}

      {!isLoading && error && (
        <div className="map-error">
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <motion.svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label="United States cannabis status map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
        <g className="states-layer">
          {baseStates}
        </g>

        <g className="highlighted-state-layer">
          {highlightedState}
        </g>

        <g className="labels-layer">
          {features.map((featureShape) => {
            const fips = featureShape.id?.toString().padStart(2, '0');
            const code = FIPS_TO_STATE[fips];
            const stateData = states[code];
            if (!code || !stateData) {
              return null;
            }

            const centroid = geoCentroid(featureShape);
            const projected = projection(centroid);
            if (!projected) {
              return null;
            }

            const [x, y] = projected;
            const config = LABEL_CONFIG[code] || {};
            const targetX = x + (config.dx || 0);
            const targetY = y + (config.dy || 0);
            const labelX = targetX;
            const labelY = targetY;
            const lineEndX = labelX + (config.lineLabelOffsetX || 0);
            const lineEndY = labelY + (config.lineLabelOffsetY || 0);
            const showConnector = Boolean(config.line);
            const labelColor = showConnector ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)';
            const labelShadow = showConnector ? '0 2px 4px rgba(0, 0, 0, 0.45)' : 'none';

            return (
              <g
                key={`${code}-label`}
                className="state-label"
                style={{ isolation: hoveredCode === code ? 'isolate' : 'auto' }}
              >
                {showConnector && (
                  <line
                    x1={x}
                    y1={y}
                    x2={lineEndX}
                    y2={lineEndY}
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                )}
                <motion.text
                  x={labelX}
                  y={labelY}
                  textAnchor={showConnector ? 'start' : 'middle'}
                  alignmentBaseline="middle"
                  className="state-label-text"
                  style={{
                    fontSize: config.fontSize || (smallTextStates.has(code) ? 11 : 13),
                    letterSpacing: '0.04em',
                    fill: labelColor,
                    color: labelColor,
                    textShadow: labelShadow,
                    cursor: 'pointer',
                    outline: showConnector && hoveredCode === code ? '1.5px solid rgba(255,255,255,0.6)' : 'none',
                    outlineOffset: showConnector && hoveredCode === code ? '2px' : '0'
                  }}
                  onPointerEnter={() => scheduleHoverUpdate(code)}
                  onFocus={() => scheduleHoverUpdate(code)}
                  onPointerLeave={() => scheduleHoverUpdate('')}
                  onBlur={() => scheduleHoverUpdate('')}
                  onClick={() => handleStateClick(code)}
                  onKeyDown={(event) => handleKeyDown(event, code)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open resources for ${stateData.name}`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                >
                  {code.toUpperCase()}
                </motion.text>
              </g>
            );
          })}
        </g>
      </motion.svg>
      )}

    </div>
  );
}
