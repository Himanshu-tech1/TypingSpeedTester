// chart.js - High-DPI responsive canvas chart for typing speed & error timeline

class TypingChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
  }

  render(dataPoints, rawPoints = [], errorsPerSec = []) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length < 2) {
      // Draw placeholder if too few points
      ctx.fillStyle = '#64748b';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data to plot progression', width / 2, height / 2);
      return;
    }

    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Determine Min & Max bounds
    const allWpm = [...dataPoints, ...rawPoints];
    const maxWpm = Math.max(40, Math.ceil(Math.max(...allWpm) / 10) * 10 + 10);
    const minWpm = 0;
    const maxTime = dataPoints.length; // 1 second increments

    const getX = (index) => padding.left + (index / (maxTime - 1)) * chartW;
    const getY = (wpm) => padding.top + chartH - ((wpm - minWpm) / (maxWpm - minWpm)) * chartH;

    // Draw Grid & Y-Axis labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round(minWpm + (maxWpm - minWpm) * (i / ySteps));
      const y = getY(val);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(val.toString(), padding.left - 10, y + 4);
    }

    // Draw X-Axis labels
    ctx.textAlign = 'center';
    const xStepCount = Math.min(8, maxTime);
    const xStepInterval = Math.max(1, Math.floor(maxTime / xStepCount));

    for (let t = 0; t < maxTime; t += xStepInterval) {
      const x = getX(t);
      ctx.fillText(`${t + 1}s`, x, height - 12);
    }

    // 1. Draw Raw WPM (Dashed line)
    if (rawPoints && rawPoints.length === dataPoints.length) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      rawPoints.forEach((wpm, i) => {
        const x = getX(i);
        const y = getY(wpm);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Net WPM Gradient Fill Under Curve
    ctx.save();
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0]));
    for (let i = 1; i < dataPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(dataPoints[i - 1]);
      const currX = getX(i);
      const currY = getY(dataPoints[i]);
      const midX = (prevX + currX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
    }
    ctx.lineTo(getX(dataPoints.length - 1), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // 3. Draw Net WPM Solid Line with glowing effect
    ctx.save();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0]));
    for (let i = 1; i < dataPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(dataPoints[i - 1]);
      const currX = getX(i);
      const currY = getY(dataPoints[i]);
      const midX = (prevX + currX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
    }
    ctx.stroke();
    ctx.restore();

    // 4. Draw Data Points (Dots on Net WPM)
    dataPoints.forEach((wpm, i) => {
      const x = getX(i);
      const y = getY(wpm);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 5. Draw Error Indicators if any occurred at second i
    if (errorsPerSec && errorsPerSec.length) {
      errorsPerSec.forEach((errCount, i) => {
        if (errCount > 0 && i < dataPoints.length) {
          const x = getX(i);
          const y = getY(dataPoints[i]);
          
          // Draw red warning cross/circle
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x, y - 10, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('✕', x, y - 7.5);
          ctx.restore();
        }
      });
    }

    // 6. Draw Average WPM Horizontal Line
    const sum = dataPoints.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / dataPoints.length);
    const avgY = getY(avg);

    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, avgY);
    ctx.lineTo(width - padding.right, avgY);
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Avg: ${avg} WPM`, width - padding.right - 80, avgY - 6);
    ctx.restore();
  }
}
