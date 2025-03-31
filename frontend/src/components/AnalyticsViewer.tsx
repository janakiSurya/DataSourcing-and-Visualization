import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTask, getTaskAnalytics } from '../services/api';
import { TaskResponse, Analytics } from '../types';
import * as d3 from 'd3';

const AnalyticsViewer: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
 
  const priceByTypeChartRef = useRef<SVGSVGElement | null>(null);
  const priceByLocationChartRef = useRef<SVGSVGElement | null>(null);
  const listingsByMonthChartRef = useRef<SVGSVGElement | null>(null);
  const bedroomDistributionChartRef = useRef<SVGSVGElement | null>(null);
  
 
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(['2022-01', '2025-12']);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  
 
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  
  const [filteredData, setFilteredData] = useState<{
    avg_price_by_type: Record<string, number>;
    avg_price_by_location: Record<string, number>;
    listings_by_month: Record<string, number>;
    bedroom_distribution: Record<string | number, number>;
  } | null>(null);
  
  
  const fetchData = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      
      const taskData = await getTask(parseInt(taskId));
      setTask(taskData);
      
      if (taskData.status !== 'completed') {
        setError('This task is not yet completed. Please wait for it to finish processing.');
        setLoading(false);
        return;
      }
      
      
      const analyticsData = await getTaskAnalytics(parseInt(taskId));
      setAnalytics(analyticsData);
      
      
      const propertyTypes = Object.keys(analyticsData.analytics.avg_price_by_type);
      const locations = Object.keys(analyticsData.analytics.avg_price_by_location);
      const months = Object.keys(analyticsData.analytics.listings_by_month);
      
      setAvailablePropertyTypes(propertyTypes);
      setAvailableLocations(locations);
      setAvailableMonths(months);
      
     
      setFilteredData(analyticsData.analytics);
      
      
      const prices = Object.values(analyticsData.analytics.avg_price_by_type);
      const minPrice = Math.floor(Math.min(...prices) * 0.8);
      const maxPrice = Math.ceil(Math.max(...prices) * 1.2);
      setPriceRange([minPrice, maxPrice]);
      
     
      if (months.length > 0) {
        const sortedMonths = [...months].sort();
        setDateRange([sortedMonths[0], sortedMonths[sortedMonths.length - 1]]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
    
  }, [taskId]); 
  
  
  useEffect(() => {
    if (!analytics) return;
    
    
    let filteredPriceByType = { ...analytics.analytics.avg_price_by_type };
    let filteredPriceByLocation = { ...analytics.analytics.avg_price_by_location };
    let filteredListingsByMonth = { ...analytics.analytics.listings_by_month };
    let filteredBedroomDistribution = { ...analytics.analytics.bedroom_distribution };
    
    
    if (selectedPropertyTypes.length > 0) {
      filteredPriceByType = Object.fromEntries(
        Object.entries(filteredPriceByType).filter(([type, _]) => 
          selectedPropertyTypes.includes(type)
        )
      );
    }
    
    
    if (selectedLocations.length > 0) {
      filteredPriceByLocation = Object.fromEntries(
        Object.entries(filteredPriceByLocation).filter(([location, _]) => 
          selectedLocations.includes(location)
        )
      );
    }
    
    
    filteredPriceByType = Object.fromEntries(
      Object.entries(filteredPriceByType).filter(([_, price]) => 
        price >= priceRange[0] && price <= priceRange[1]
      )
    );
    
    filteredPriceByLocation = Object.fromEntries(
      Object.entries(filteredPriceByLocation).filter(([_, price]) => 
        price >= priceRange[0] && price <= priceRange[1]
      )
    );
    
    
    filteredListingsByMonth = Object.fromEntries(
      Object.entries(filteredListingsByMonth).filter(([month, _]) => 
        month >= dateRange[0] && month <= dateRange[1]
      )
    );
    
    
    if (minBedrooms > 0) {
      filteredBedroomDistribution = Object.fromEntries(
        Object.entries(filteredBedroomDistribution)
          .filter(([bedrooms, _]) => {
            if (bedrooms === '5+') return minBedrooms <= 5;
            return parseInt(bedrooms) >= minBedrooms;
          })
      );
    }
    
    // Update filtered data
    setFilteredData({
      avg_price_by_type: filteredPriceByType,
      avg_price_by_location: filteredPriceByLocation,
      listings_by_month: filteredListingsByMonth,
      bedroom_distribution: filteredBedroomDistribution
    });
    
  }, [analytics, selectedPropertyTypes, selectedLocations, priceRange, dateRange, minBedrooms]);
  
  // Create/Update charts when filtered data changes
  useEffect(() => {
    if (!filteredData) return;
    
   
    createPriceByTypeChart();
    createPriceByLocationChart();
    createListingsByMonthChart();
    createBedroomDistributionChart();
    
    
  }, [filteredData]); 
  
 
  const resetFilters = () => {
    setSelectedPropertyTypes([]);
    setSelectedLocations([]);
    if (analytics) {
      const prices = Object.values(analytics.analytics.avg_price_by_type);
      const minPrice = Math.floor(Math.min(...prices) * 0.8);
      const maxPrice = Math.ceil(Math.max(...prices) * 1.2);
      setPriceRange([minPrice, maxPrice]);
      
      const months = Object.keys(analytics.analytics.listings_by_month);
      if (months.length > 0) {
        const sortedMonths = [...months].sort();
        setDateRange([sortedMonths[0], sortedMonths[sortedMonths.length - 1]]);
      }
    }
    setMinBedrooms(0);
  };
  
  
  const togglePropertyType = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
    }
  };
  
 
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };
  
  
  const createPriceByTypeChart = () => {
    if (!filteredData || !priceByTypeChartRef.current) return;
    
    
    d3.select(priceByTypeChartRef.current).selectAll('*').remove();
    
    const data = Object.entries(filteredData.avg_price_by_type).map(([type, price]) => ({
      type,
      price: price as number
    }));
    
    if (data.length === 0) {
      
      d3.select(priceByTypeChartRef.current)
        .attr('width', 500)
        .attr('height', 300)
        .append('text')
        .attr('x', 250)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
        .text('No data matching the selected filters');
      return;
    }
    
   
    data.sort((a, b) => b.price - a.price);
    
   
    const margin = { top: 30, right: 30, bottom: 70, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    
    const formatCurrency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format;
    
   
    const svg = d3.select(priceByTypeChartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
   
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.type))
      .padding(0.2);
    
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.price) as number * 1.1])
      .range([height, 0]);
    
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
    
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Average Price (USD)');
    
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Average Price by Property Type');
    
    
    const barColor = document.documentElement.classList.contains('dark') ? '#818cf8' : '#4f46e5';
    
   
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.type) as number)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.price))
      .attr('height', d => height - y(d.price))
      .attr('fill', barColor)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', document.documentElement.classList.contains('dark') ? '#a78bfa' : '#8b5cf6');
        
       
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (x(d.type) as number) + x.bandwidth() / 2)
          .attr('y', y(d.price) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
          .text(formatCurrency(d.price));
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', barColor);
        svg.selectAll('.tooltip').remove();
      });
  };
  
  // Create Price by Location chart
  const createPriceByLocationChart = () => {
    if (!filteredData || !priceByLocationChartRef.current) return;
    
   
    d3.select(priceByLocationChartRef.current).selectAll('*').remove();
    
    const data = Object.entries(filteredData.avg_price_by_location).map(([location, price]) => ({
      location,
      price: price as number
    }));
    
    if (data.length === 0) {
      
      d3.select(priceByLocationChartRef.current)
        .attr('width', 500)
        .attr('height', 300)
        .append('text')
        .attr('x', 250)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
        .text('No data matching the selected filters');
      return;
    }
    
    
    data.sort((a, b) => b.price - a.price);
    
   
    const margin = { top: 30, right: 30, bottom: 70, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
   
    const formatCurrency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format;
    
    
    const svg = d3.select(priceByLocationChartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
   
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.location))
      .padding(0.2);
    
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.price) as number * 1.1])
      .range([height, 0]);
    
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
   
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Average Price (USD)');
    
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Average Price by Location');
    
    
    const barColor = document.documentElement.classList.contains('dark') ? '#34d399' : '#10b981';
    
    
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.location) as number)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.price))
      .attr('height', d => height - y(d.price))
      .attr('fill', barColor)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', document.documentElement.classList.contains('dark') ? '#a78bfa' : '#8b5cf6');
        
        
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (x(d.location) as number) + x.bandwidth() / 2)
          .attr('y', y(d.price) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
          .text(formatCurrency(d.price));
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', barColor);
        svg.selectAll('.tooltip').remove();
      });
  };
  
 
  const createListingsByMonthChart = () => {
    if (!filteredData || !listingsByMonthChartRef.current) return;
    
   
    d3.select(listingsByMonthChartRef.current).selectAll('*').remove();
    
    const data = Object.entries(filteredData.listings_by_month).map(([month, count]) => ({
      month,
      count: count as number
    }));
    
    if (data.length === 0) {
     
      d3.select(listingsByMonthChartRef.current)
        .attr('width', 500)
        .attr('height', 300)
        .append('text')
        .attr('x', 250)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
        .text('No data matching the selected filters');
      return;
    }
    
   
    data.sort((a, b) => a.month.localeCompare(b.month));
    
   
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    
    const svg = d3.select(listingsByMonthChartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.month))
      .padding(0.2);
    
   
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number * 1.1])
      .range([height, 0]);
    
   
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
    
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Number of Listings');
    
   
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Listings by Month');
    
   
    const line = d3.line<{month: string, count: number}>()
      .x(d => (x(d.month) as number) + x.bandwidth() / 2)
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);
    
    
    const lineColor = document.documentElement.classList.contains('dark') ? '#818cf8' : '#4f46e5';
    const areaColor = document.documentElement.classList.contains('dark') ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.1)';
    
    
    svg.append('path')
      .datum(data)
      .attr('fill', areaColor)
      .attr('stroke', 'none')
      .attr('d', d3.area<{month: string, count: number}>()
        .x(d => (x(d.month) as number) + x.bandwidth() / 2)
        .y0(height)
        .y1(d => y(d.count))
        .curve(d3.curveMonotoneX)
      );
    
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2.5)
      .attr('d', line);
    
    
    svg.selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => (x(d.month) as number) + x.bandwidth() / 2)
      .attr('cy', d => y(d.count))
      .attr('r', 5)
      .attr('fill', document.documentElement.classList.contains('dark') ? '#34d399' : '#10b981')
      .attr('stroke', document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 7);
        
        // Add tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (x(d.month) as number) + x.bandwidth() / 2)
          .attr('y', y(d.count) - 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
          .text(d.count);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5);
        svg.selectAll('.tooltip').remove();
      });
  };
  
  
  const createBedroomDistributionChart = () => {
    if (!filteredData || !bedroomDistributionChartRef.current) return;
    
    
    d3.select(bedroomDistributionChartRef.current).selectAll('*').remove();
    
    const data = Object.entries(filteredData.bedroom_distribution).map(([bedrooms, count]) => ({
      bedrooms,
      count: count as number
    }));
    
    if (data.length === 0) {
      
      d3.select(bedroomDistributionChartRef.current)
        .attr('width', 500)
        .attr('height', 300)
        .append('text')
        .attr('x', 250)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
        .text('No data matching the selected filters');
      return;
    }
    
   
    const width = 500;
    const height = 400;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    
    
    const svg = d3.select(bedroomDistributionChartRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 + margin / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937')
      .text('Bedroom Distribution');
    
    
    const colors = document.documentElement.classList.contains('dark') 
      ? d3.scaleOrdinal<string>()
        .domain(data.map(d => d.bedrooms))
        .range(['#818cf8', '#34d399', '#a78bfa', '#60a5fa', '#f87171', '#fbbf24', '#a1a1aa']) 
      : d3.scaleOrdinal<string>()
        .domain(data.map(d => d.bedrooms))
        .range(['#4f46e5', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444', '#f59e0b', '#71717a']);
    
    
    const total = d3.sum(data, d => d.count);
    
   
    const pie = d3.pie<{bedrooms: string, count: number}>()
      .sort(null)
      .value(d => d.count);
    
    const dataReady = pie(data);
    
    
    const arc = d3.arc<d3.PieArcDatum<{bedrooms: string, count: number}>>()
      .innerRadius(0)
      .outerRadius(radius);
    
   
    const tooltip = svg.append('text')
      .attr('class', 'tooltip')
      .attr('x', 0)
      .attr('y', 0)
      .style('opacity', 0)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
    
    
    svg.selectAll('slices')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colors(d.data.bedrooms) as string)
      .attr('stroke', document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('opacity', 1)
          .attr('transform', 'scale(1.05)');
        
       
        tooltip.style('opacity', 1)
          .text(`${d.data.bedrooms} BR: ${d.data.count} (${Math.round(d.data.count / total * 100)}%)`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.8)
          .attr('transform', 'scale(1)');
        
        
        tooltip.style('opacity', 0);
      });
    
  
    svg.selectAll('labels')
      .data(dataReady)
      .enter()
      .append('text')
      .text(d => `${d.data.bedrooms} BR`)
      .attr('transform', d => {
        const pos = arc.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        const x = Math.cos(midAngle) * (radius * 0.8);
        const y = Math.sin(midAngle) * (radius * 0.8);
        return `translate(${x}, ${y})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary-light dark:border-primary-dark rounded-full animate-spin"></div>
          <p className="mt-4 text-text-light dark:text-text-dark">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-4 shadow-soft transition-colors duration-300">
        <p>{error}</p>
        <button 
          onClick={fetchData} 
          className="mt-2 bg-red-600 dark:bg-red-700 text-white px-4 py-1 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!task || !analytics) {
    return <div className="text-center py-8 text-text-light dark:text-text-dark">Task or analytics data not found</div>;
  }
  
  return (
    <div>
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-soft-lg transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics for Task: {task.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(ID: {task.id})</span>
        </h2>
        
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg transition-colors duration-300">
          <p className="text-blue-700 dark:text-blue-100">
            Total Properties: <span className="font-bold">{analytics.count}</span>
          </p>
        </div>
        
      
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-3 text-text-light dark:text-text-dark">Filter Charts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="Min Price"
                />
                <span className="text-text-light dark:text-text-dark">to</span>
                <input
                  type="number"
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  placeholder="Max Price"
                />
              </div>
            </div>
            
           
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Minimum Bedrooms
              </label>
              <select
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(Number(e.target.value))}
              >
                <option value="0">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>
          
         
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Date Range
            </label>
            <div className="flex items-center space-x-2">
              <select
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={dateRange[0]}
                onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
              >
                {availableMonths.sort().map(month => (
                  <option key={`start-${month}`} value={month}>{month}</option>
                ))}
              </select>
              <span className="text-text-light dark:text-text-dark">to</span>
              <select
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition-colors duration-200"
                value={dateRange[1]}
                onChange={(e) => setDateRange([dateRange[0], e.target.value])}
              >
                {availableMonths.sort().map(month => (
                  <option key={`end-${month}`} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Property Types
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePropertyTypes.map(type => (
                <label key={type} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <input
                    type="checkbox"
                    className="mr-1.5 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                    checked={selectedPropertyTypes.length === 0 || selectedPropertyTypes.includes(type)}
                    onChange={() => togglePropertyType(type)}
                  />
                  <span className="text-sm text-text-light dark:text-text-dark">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Locations
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLocations.map(location => (
                <label key={location} className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <input
                    type="checkbox"
                    className="mr-1.5 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                    checked={selectedLocations.length === 0 || selectedLocations.includes(location)}
                    onChange={() => toggleLocation(location)}
                  />
                  <span className="text-sm text-text-light dark:text-text-dark">{location}</span>
                </label>
              ))}
            </div>
          </div>
          
        
          <div className="text-right">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-opacity-90 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="overflow-x-auto">
              <svg ref={priceByTypeChartRef} className="mx-auto"></svg>
            </div>
          </div>
          
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="overflow-x-auto">
              <svg ref={priceByLocationChartRef} className="mx-auto"></svg>
            </div>
          </div>
          
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="overflow-x-auto">
              <svg ref={listingsByMonthChartRef} className="mx-auto"></svg>
            </div>
          </div>
          
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="overflow-x-auto">
              <svg ref={bedroomDistributionChartRef} className="mx-auto"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsViewer; 