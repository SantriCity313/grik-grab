import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  MapPin,
  Search,
  Filter,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Users,
  Coins,
  ShieldCheck,
  Building2,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  TrendingUp,
  Compass,
  X,
  Target,
} from 'lucide-react';
import {
  BeneficiaryProgramLocation,
  ProgramCategoryType,
  ProgramRegionType,
  Language,
} from '../types';
import {
  indonesiaGeoData,
  initialBeneficiaryPrograms,
} from '../data/indonesiaGeoData';
import { translations } from '../translations';
import { formatIDR, formatCompactNumber } from '../utils';

interface BeneficiaryMapD3Props {
  language: Language;
  onOpenDonateModal?: (campaignTitle?: string, initialAmount?: number) => void;
}

export const BeneficiaryMapD3: React.FC<BeneficiaryMapD3Props> = ({
  language,
  onOpenDonateModal,
}) => {
  const t = translations[language];

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<BeneficiaryProgramLocation | null>(null);
  const [hoveredProgram, setHoveredProgram] = useState<BeneficiaryProgramLocation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return initialBeneficiaryPrograms.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchRegion =
        selectedRegion === 'all' || p.region === selectedRegion;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.province.toLowerCase().includes(query) ||
        p.regencyCity.toLowerCase().includes(query) ||
        p.partnerInstitution.toLowerCase().includes(query) ||
        p.leadCoordinator.toLowerCase().includes(query);

      return matchCategory && matchRegion && matchSearch;
    });
  }, [selectedCategory, selectedRegion, searchQuery]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalBeneficiaries = initialBeneficiaryPrograms.reduce(
      (sum, p) => sum + p.beneficiariesCount,
      0
    );
    const totalDisbursed = initialBeneficiaryPrograms.reduce(
      (sum, p) => sum + p.fundsDisbursed,
      0
    );
    const totalBudget = initialBeneficiaryPrograms.reduce(
      (sum, p) => sum + p.targetBudget,
      0
    );
    const activeCount = initialBeneficiaryPrograms.length;
    const avgProgress =
      totalBudget > 0 ? Math.round((totalDisbursed / totalBudget) * 100) : 0;

    return {
      totalBeneficiaries,
      totalDisbursed,
      activeCount,
      avgProgress,
    };
  }, []);

  // Category Colors
  const getCategoryColor = (category: ProgramCategoryType) => {
    switch (category) {
      case 'Modal UMKM':
        return {
          fill: '#10b981',
          stroke: '#047857',
          bgLight: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          badgeBorder: 'border-emerald-300 dark:border-emerald-700',
        };
      case 'Ketahanan Pangan':
        return {
          fill: '#f59e0b',
          stroke: '#b45309',
          bgLight: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          badgeBorder: 'border-amber-300 dark:border-amber-700',
        };
      case 'Zakat Vokasi':
        return {
          fill: '#3b82f6',
          stroke: '#1d4ed8',
          bgLight: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
          badgeBorder: 'border-blue-300 dark:border-blue-700',
        };
      case 'Kesehatan & Kemanusiaan':
        return {
          fill: '#f43f5e',
          stroke: '#be123c',
          bgLight: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          badgeBorder: 'border-rose-300 dark:border-rose-700',
        };
      case 'Wakaf Produktif':
        return {
          fill: '#8b5cf6',
          stroke: '#6d28d9',
          bgLight: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
          badgeBorder: 'border-purple-300 dark:border-purple-700',
        };
      default:
        return {
          fill: '#10b981',
          stroke: '#047857',
          bgLight: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          badgeBorder: 'border-emerald-300 dark:border-emerald-700',
        };
    }
  };

  // Render & Update D3 Map
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container ? container.clientWidth : 960;
    const height = Math.max(480, Math.min(620, width * 0.52));

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    // Defs for gradients & shadow filters
    const defs = svg.append('defs');

    // Ocean gradient
    const oceanGrad = defs
      .append('linearGradient')
      .attr('id', 'oceanGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    oceanGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0f172a')
      .attr('stop-opacity', 0.85);
    oceanGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#022c22')
      .attr('stop-opacity', 0.95);

    // Glow filter for markers
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background ocean rect
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#oceanGradient)')
      .attr('rx', 20);

    // Main map container group for zoom & pan
    const g = svg.append('g').attr('class', 'map-container');

    // Geo Mercator projection centered on Indonesia
    // Indonesia spans roughly 95°E to 141°E (~46 deg), -11°S to 6°N (~17 deg)
    const projection = d3
      .geoMercator()
      .center([118.5, -2.5])
      .scale(width * 1.35)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw Nautical / Graticule Lines
    const graticule = d3.geoGraticule().step([10, 5]);
    g.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.75)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.4);

    // Draw Equator Line
    const equatorFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [94, 0],
          [142, 0],
        ],
      },
    };
    g.append('path')
      .datum(equatorFeature)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6);

    // Equator Label
    const equatorCoord = projection([97.5, 0.4]);
    if (equatorCoord) {
      g.append('text')
        .attr('x', equatorCoord[0])
        .attr('y', equatorCoord[1])
        .attr('fill', '#34d399')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('letter-spacing', '1px')
        .attr('opacity', 0.8)
        .text('GARIS KHATULISTIWA (0° LAT)');
    }

    // Draw Indonesia Island & Province Polygons
    const provincesGroup = g.append('g').attr('class', 'provinces-layer');

    provincesGroup
      .selectAll('path')
      .data(indonesiaGeoData.features)
      .enter()
      .append('path')
      .attr('d', (d) => pathGenerator(d as any))
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.2)
      .attr('class', 'province-path transition-colors duration-200 cursor-pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .on('mouseover', function () {
        d3.select(this)
          .attr('fill', '#065f46')
          .attr('stroke', '#34d399')
          .attr('stroke-width', 1.8);
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('fill', '#1e293b')
          .attr('stroke', '#475569')
          .attr('stroke-width', 1.2);
      });

    // Island Regional Watermarks/Labels
    const islandLabels = [
      { name: 'SUMATERA', coords: [102.0, -1.5] },
      { name: 'JAWA', coords: [110.0, -7.0] },
      { name: 'KALIMANTAN', coords: [113.5, 0.2] },
      { name: 'SULAWESI', coords: [121.2, -1.8] },
      { name: 'NUSA TENGGARA', coords: [119.5, -8.6] },
      { name: 'MALUKU', coords: [128.5, -2.0] },
      { name: 'PAPUA', coords: [137.5, -4.5] },
    ];

    islandLabels.forEach((label) => {
      const pos = projection(label.coords as [number, number]);
      if (pos) {
        g.append('text')
          .attr('x', pos[0])
          .attr('y', pos[1])
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748b')
          .attr('font-size', '11px')
          .attr('font-weight', '800')
          .attr('letter-spacing', '2.5px')
          .attr('opacity', 0.5)
          .attr('pointer-events', 'none')
          .text(label.name);
      }
    });

    // Program Markers Group
    const markersGroup = g.append('g').attr('class', 'markers-layer');

    filteredPrograms.forEach((prog) => {
      const pos = projection(prog.coordinates);
      if (!pos) return;

      const isSelected = selectedProgram?.id === prog.id;
      const isHovered = hoveredProgram?.id === prog.id;
      const col = getCategoryColor(prog.category);

      const markerNode = markersGroup
        .append('g')
        .attr('class', 'program-pin cursor-pointer')
        .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
        .on('mouseenter', (event) => {
          setHoveredProgram(prog);
          const [clientX, clientY] = d3.pointer(event, container);
          setTooltipPos({ x: clientX, y: clientY });
        })
        .on('mousemove', (event) => {
          const [clientX, clientY] = d3.pointer(event, container);
          setTooltipPos({ x: clientX, y: clientY });
        })
        .on('mouseleave', () => {
          setHoveredProgram(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          setSelectedProgram(prog);
          // Smooth zoom into marker
          if (zoomBehaviorRef.current && svgRef.current) {
            svg
              .transition()
              .duration(750)
              .call(
                zoomBehaviorRef.current.transform,
                d3.zoomIdentity
                  .translate(width / 2, height / 2)
                  .scale(2.2)
                  .translate(-pos[0], -pos[1])
              );
          }
        });

      // Radiating pulsing halo
      markerNode
        .append('circle')
        .attr('r', isSelected ? 16 : 10)
        .attr('fill', col.fill)
        .attr('opacity', 0.25)
        .attr('class', 'animate-ping')
        .style('transform-origin', 'center');

      // Outer ring
      markerNode
        .append('circle')
        .attr('r', isSelected ? 11 : isHovered ? 9 : 7)
        .attr('fill', col.fill)
        .attr('opacity', 0.4)
        .attr('stroke', col.stroke)
        .attr('stroke-width', 1.5);

      // Core crisp pin circle
      markerNode
        .append('circle')
        .attr('r', isSelected ? 6.5 : 5)
        .attr('fill', '#ffffff')
        .attr('stroke', col.fill)
        .attr('stroke-width', 2.5)
        .style('filter', 'url(#glow)');

      // Title badge for selected or hovered pin
      if (isSelected || isHovered) {
        const textBg = markerNode
          .append('rect')
          .attr('x', 10)
          .attr('y', -16)
          .attr('rx', 6)
          .attr('fill', '#090d16')
          .attr('stroke', col.fill)
          .attr('stroke-width', 1.2)
          .attr('opacity', 0.95);

        const text = markerNode
          .append('text')
          .attr('x', 18)
          .attr('y', -3)
          .attr('fill', '#ffffff')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .text(prog.regencyCity);

        // Resize background rect dynamically
        const bbox = (text.node() as SVGTextContentElement)?.getBBox();
        if (bbox) {
          textBg.attr('width', bbox.width + 16).attr('height', 20);
        }
      }
    });

    // D3 Zoom & Pan Behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 6])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Initial scale & center view
    svg.call(zoom.transform, d3.zoomIdentity);
  }, [filteredPrograms, selectedProgram, hoveredProgram]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(350)
        .call(zoomBehaviorRef.current.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(350)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(600)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
      setSelectedProgram(null);
    }
  };

  const handleSelectProgramFromList = (prog: BeneficiaryProgramLocation) => {
    setSelectedProgram(prog);
    setActiveTab('map');

    if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = Math.max(480, Math.min(620, width * 0.52));
      const projection = d3
        .geoMercator()
        .center([118.5, -2.5])
        .scale(width * 1.35)
        .translate([width / 2, height / 2]);

      const pos = projection(prog.coordinates);
      if (pos) {
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(2.4)
              .translate(-pos[0], -pos[1])
          );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Impact Metric Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase block">
              {t.mapTotalBeneficiaries || 'Total Penerima Manfaat'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {summaryMetrics.totalBeneficiaries.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-stone-500 ml-1">Keluarga & Jiwa</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase block">
              {t.mapDisbursedFunds || 'Dana Penyaluran Bergulir'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {formatCompactNumber(summaryMetrics.totalDisbursed)}
              <span className="text-xs font-normal text-stone-500 ml-1">IDR</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase block">
              {t.mapActiveHubs || 'Sentra & Klaster Berjalan'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {summaryMetrics.activeCount}
              <span className="text-xs font-normal text-stone-500 ml-1">Inisiatif Terbina</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase block">
              {t.mapAvgProgress || 'Rasio Capaian Target'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {summaryMetrics.avgProgress}%
              <span className="text-xs font-normal text-stone-500 ml-1">Terealisasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                {t.mapBeneficiariesTitle || 'Peta Sebaran Penerima Manfaat & Pemberdayaan Ekonomi'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-3xl">
              {t.mapBeneficiariesSubtitle ||
                'Visualisasi interaktif D3 sebaran lokasi program kemandirian ekonomi, lumbung pangan wakaf, dan pemberdayaan mustahiq di seluruh kepulauan Indonesia.'}
            </p>
          </div>

          {/* Toggle View & Zoom Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
            <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Interaktif</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Daftar Inisiatif ({filteredPrograms.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800/80">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t.mapSearchPlaceholder || 'Cari kota, provinsi, program...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Kategori Inisiatif</option>
              <option value="Modal UMKM">Modal UMKM Syariah</option>
              <option value="Ketahanan Pangan">Ketahanan Pangan & Wakaf</option>
              <option value="Zakat Vokasi">Zakat Vokasi & Pelatihan</option>
              <option value="Kesehatan & Kemanusiaan">Kesehatan & Kemanusiaan</option>
              <option value="Wakaf Produktif">Wakaf Produktif</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Seluruh Wilayah Kepulauan</option>
              <option value="Sumatera">Sumatera</option>
              <option value="Jawa">Jawa & Madura</option>
              <option value="Bali & Nusa Tenggara">Bali & Nusa Tenggara</option>
              <option value="Kalimantan">Kalimantan</option>
              <option value="Sulawesi">Sulawesi</option>
              <option value="Maluku & Papua">Maluku & Papua</option>
            </select>
          </div>

          {/* Quick Action: Reset & Found Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Menampilkan <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredPrograms.length}</span> lokasi
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRegion('all');
                setSearchQuery('');
                handleResetZoom();
              }}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      {activeTab === 'map' ? (
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg bg-stone-950">
          <div ref={containerRef} className="w-full min-h-[480px] sm:min-h-[540px] relative">
            <svg
              ref={svgRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing select-none"
            />

            {/* D3 Zoom Floating Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700 shadow-md">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Perbesar Peta"
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Perkecil Peta"
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Posisi Awal"
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer border-t border-stone-700/60"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute left-4 bottom-4 bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 text-stone-300 shadow-md max-w-xs hidden sm:block">
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block mb-2">
                LEGENDA KATEGORI PROGRAM
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                  <span className="text-stone-300">Modal UMKM Syariah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span>
                  <span className="text-stone-300">Ketahanan Pangan Wakaf</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
                  <span className="text-stone-300">Zakat Vokasi & Pendidikan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
                  <span className="text-stone-300">Kesehatan & Tanggap Kemanusiaan</span>
                </div>
              </div>
            </div>

            {/* D3 Tooltip */}
            {hoveredProgram && tooltipPos && (
              <div
                className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-stone-900/95 text-white border border-stone-700 shadow-xl max-w-xs transition-all duration-75 text-xs"
                style={{
                  left: `${Math.min(tooltipPos.x + 12, (containerRef.current?.clientWidth || 800) - 240)}px`,
                  top: `${Math.max(tooltipPos.y - 70, 10)}px`,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      getCategoryColor(hoveredProgram.category).bgLight
                    }`}
                  >
                    {hoveredProgram.category}
                  </span>
                  <span className="text-[10px] text-stone-400">{hoveredProgram.province}</span>
                </div>
                <h5 className="font-bold text-stone-100 text-xs leading-snug">
                  {hoveredProgram.title}
                </h5>
                <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-300">
                  <span>{hoveredProgram.beneficiariesCount} {hoveredProgram.beneficiaryUnit}</span>
                  <span className="font-bold text-emerald-400">
                    {formatIDR(hoveredProgram.fundsDisbursed)}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 italic">
                  Klik marker untuk detail lengkap program & bukti audit
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((prog) => {
            const catStyle = getCategoryColor(prog.category);
            return (
              <div
                key={prog.id}
                onClick={() => handleSelectProgramFromList(prog)}
                className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${catStyle.bgLight}`}
                    >
                      {prog.category}
                    </span>
                    <span className="text-xs font-bold text-stone-400">
                      {prog.region}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug group-hover:text-emerald-600 transition">
                      {prog.title}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{prog.regencyCity}, {prog.province}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span>Penerima Manfaat:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {prog.beneficiariesCount} {prog.beneficiaryUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span>Dana Tersalurkan:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatIDR(prog.fundsDisbursed)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                    {prog.story}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-500">
                  <span>Lihat Pada Peta</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Program Detail Drawer / Modal */}
      {selectedProgram && (
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-7 rounded-3xl border border-emerald-500/40 dark:border-emerald-600/40 shadow-xl relative animate-fadeIn">
          <button
            type="button"
            onClick={() => setSelectedProgram(null)}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Info and Impact Highlighting */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    getCategoryColor(selectedProgram.category).bgLight
                  }`}
                >
                  {selectedProgram.category}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{selectedProgram.regencyCity}, {selectedProgram.province}</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit On-Chain: {selectedProgram.verifiedAuditHash}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                  {selectedProgram.title}
                </h3>
                <div className="mt-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                      {selectedProgram.impactMetric}
                    </h5>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {selectedProgram.impactHighlight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                  Latar Belakang & Kisah Perubahan Mustahiq
                </h5>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                  "{selectedProgram.story}"
                </p>
              </div>

              {/* Progress and Financial Metrics */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-600 dark:text-stone-400">
                    Realisasi Penyaluran Modal & Sarana:
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatIDR(selectedProgram.fundsDisbursed)} / {formatIDR(selectedProgram.targetBudget)} ({selectedProgram.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${selectedProgram.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Coordinator & Call to Action */}
            <div className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block">
                  LEMBAGA MITRA & KOORDINATOR LAPANGAN
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-stone-500 block">Lembaga Amil / Mitra Syariah:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {selectedProgram.partnerInstitution}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Penanggung Jawab Wilayah:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedProgram.leadCoordinator}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Kontak Transparansi:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedProgram.coordinatorContact}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Koordinat Geografis:</span>
                    <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                      [{selectedProgram.coordinates[0].toFixed(2)}° E, {selectedProgram.coordinates[1].toFixed(2)}° S]
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700/80">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDonateModal) {
                      onOpenDonateModal(selectedProgram.title, 250000);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>Dukung Program di Wilayah Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResetZoom()}
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Lihat Seluruh Indonesia</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
