import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ElevationPoint {
  lat: number;
  lon: number;
  ele: number;
  distance: number;
}

export interface ClosestLatLonResult {
  point: ElevationPoint;
  index: number;
  distanceSq: number;
}

export interface ClosestDistanceResult {
  point: ElevationPoint;
  index: number;
}

@Injectable({ providedIn: 'root' })
export class ElevationChartService {

  buildChart(
    canvas: HTMLCanvasElement,
    elevationData: ElevationPoint[],
    onChartClick: (distance: number) => void,
    xAxisTickCallback?: (value: number) => string | number
  ): Chart {
    const ctx = canvas.getContext('2d')!;
    const dataPoints = elevationData.map(p => ({ x: p.distance, y: p.ele }));
    const elevations = dataPoints.map(p => p.y);
    const minEle = Math.floor(Math.min(...elevations) / 10) * 10;
    const maxEle = Math.ceil(Math.max(...elevations) / 10) * 10;
    const maxDist = Math.round(elevationData[elevationData.length - 1].distance * 10) / 10;

    return new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Elevation (ft)',
            data: dataPoints,
            borderColor: 'grey',
            backgroundColor: 'rgba(200, 200, 200, 0.5)',
            fill: true,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: 'Position',
            data: [],
            borderColor: 'red',
            backgroundColor: 'red',
            pointRadius: 6,
            showLine: false,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Miles' },
            ticks: {
              maxTicksLimit: 14,
              ...(xAxisTickCallback ? { callback: (value: any) => xAxisTickCallback(value) } : {})
            },
            min: 0,
            max: maxDist,
          },
          y: {
            title: { display: true, text: 'Elevation (ft)' },
            min: minEle,
            max: maxEle,
            ticks: { padding: 5, autoSkip: true, maxTicksLimit: 6 },
          },
        },
        onClick: (_event, _elements, chart) => {
          const xScale = chart.scales['x'];
          const nativeEvent = (_event as any).native;
          if (!nativeEvent) return;
          const canvasPosition = (chart as any).canvas.getBoundingClientRect();
          const clickX = nativeEvent.clientX - canvasPosition.left;
          const distance = xScale.getValueForPixel(clickX);
          if (distance !== undefined) {
            onChartClick(distance);
          }
        }
      },
    });
  }

  findClosestByLatLon(elevationData: ElevationPoint[], lat: number, lon: number): ClosestLatLonResult | null {
    if (!elevationData.length) return null;
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < elevationData.length; i++) {
      const d = (elevationData[i].lat - lat) ** 2 + (elevationData[i].lon - lon) ** 2;
      if (d < minDist) { minDist = d; closestIdx = i; }
    }
    return { point: elevationData[closestIdx], index: closestIdx, distanceSq: minDist };
  }

  findClosestByDistance(elevationData: ElevationPoint[], distance: number): ClosestDistanceResult | null {
    if (!elevationData.length) return null;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < elevationData.length; i++) {
      const diff = Math.abs(elevationData[i].distance - distance);
      if (diff < minDiff) { minDiff = diff; closestIdx = i; }
    }
    return { point: elevationData[closestIdx], index: closestIdx };
  }

  updateChartMarker(chart: Chart, point: ElevationPoint): void {
    chart.data.datasets[1].data = [{ x: point.distance, y: point.ele }];
    chart.update('none');
  }
}
