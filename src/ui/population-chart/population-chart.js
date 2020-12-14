// import * as d3 from "d3";

class PopulationChart {
  constructor(chartData) {
    this.chartData = chartData;
    this.itemSource = JSON.parse(JSON.stringify(chartData));

    this.element = document.getElementById(chartData.targetId);
    this.height = chartData.height || 400;
    this.width = chartData.width || this.element.clientWidth;

    this.chartWidth = this.width;
    this.chartHeight = this.height;

    this.margin = {
      top: 40, right: 10, bottom: 30, left: 10,
    };
    this.gutter = 30;
    this.regionWidth = null;

    this.svg = null;
    this.xScaleLeft = null;
    this.xScaleRight = null;
    this.yScaleLeft = null;

    this.leftColor = this.itemSource.leftColor || '#148ecf';
    this.rightColor = this.itemSource.rightColor || '#f45e84';

  }

  renderChart() {
    this.validateChartData();

    this.setChartLayout();

    

    // 툴팁 그리기
    this.insertTooltip();

    // 범례 삽입
    this.insertLegend();
  }

  // 차트 기본 설정
  setChartLayout() {
    if (!this.element.classList.contains('chart-area')) {
      this.element.classList.add('chart-area');
    }

    const width = this.width;

    this.chartWidth = width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    // 기존 차트 제거
    this.removeDom();

    if (!this.itemSource) {
      return;
    }

    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', width)
      .attr('height', this.height)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width} ${this.height}`)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // 스케일 설정
    this.setScale();

    // 차트 그리기
    this.drawChart();

  }

  // 차트 크기 리사이즈
  resize(w, h) {
    const width = !w || w === 'auto' ? this.element.clientWidth : w;
    const height = !h ? this.element.clientHeight : h;

    this.height = height || 400;
    this.width = width || this.element.clientWidth;

    this.chartWidth = this.width;
    this.chartHeight = this.height;

    this.setChartLayout();
  }

  // 데이터 체크
  validateChartData() {
    const element = document.getElementById(this.itemSource.targetId);
    if (!element) {
      throw Error('targetId를 설정하세요');
    }
    if (!this.itemSource.yAxisProps) {
      throw Error('yAxisProps를 설정하세요');
    }
    if (!this.itemSource.xAxisProps) {
      throw Error('xAxisProps를 설정하세요');
    }
    if (!this.itemSource.series || !this.itemSource.series.length) {
      throw Error('series 데이터가 없습니다.');
    }
  }

  // 기존 차트 제거
  removeDom() {
    const svg = d3.select(this.element).select('svg');
    svg.remove();
  }

  // 스케일 설정 및 축 그리기
  setScale() {

    // 차트의 각면의 너비
    this.regionWidth = (this.chartWidth / 2) - this.gutter;

    // 양쪽에서 최대 데이터 값을 찾는다.
    const maxValue = Math.max(
      d3.max(this.itemSource.series.map(d => d[this.itemSource.xAxisProps.left])),
      d3.max(this.itemSource.series.map(d => d[this.itemSource.xAxisProps.right])),
      1
    );

    this.xScaleLeft = d3.scaleLinear()
      .domain([0, maxValue].reverse())
      .range([0, this.regionWidth]);

    this.xScaleRight = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, this.regionWidth]);

    this.yScaleLeft = d3.scaleBand().domain(this.itemSource.yAxisTick).range([0, this.chartHeight]);

    const format = maxValue > 1000 ? d3.format('~s') : d3.format('.3');
    const xAxisLeft = d3.axisBottom(this.xScaleLeft)
      .tickSize(5)
      .ticks(5)
      .tickFormat(format);

    const xAxisRight = d3.axisBottom(this.xScaleRight)
      .tickSize(5)
      .ticks(5)
      .tickFormat(format);

    const yAxisLeft = d3.axisLeft(this.yScaleLeft)
      .tickSize(5)
      .tickFormat('');

    const yAxisRight = d3.axisRight(this.yScaleLeft)
      .tickSize(5);

    // 축 그리기
    this.svg.append('g')
      .attr('class', 'axis y left')
      .attr('transform', `translate(${this.regionWidth}, 0)`)
      .call(yAxisLeft);

    this.svg.append('g')
      .attr('class', 'axis y right')
      .attr('transform', `translate(${this.chartWidth / 2 + this.gutter}, 0)`)
      .call(yAxisRight)
      .selectAll('text')
      .attr('x', -this.gutter / 2 - 15)
      .style('text-anchor', 'middle');

    this.svg.append('g')
      .attr('class', 'axis x left')
      .attr('transform', `translate(0, ${this.chartHeight})`)
      .call(xAxisLeft);

    this.svg.append('g')
      .attr('class', 'axis x right')
      .attr('transform', `translate(${this.chartWidth / 2 + this.gutter}, ${this.chartHeight})`)
      .call(xAxisRight);
  }

  // 차트 그리기
  drawChart() {
    const that = this;

    const leftBarGroup = this.svg.append('g')
      .attr('class', 'x-left-area')
      .attr('transform', `translate(${this.regionWidth}, 0) scale(-1,1)`);

    const rightBarGroup = this.svg.append('g')
      .attr('class', 'x-right-area')
      .attr('transform', `translate(${this.chartWidth / 2 + this.gutter}, 0)`);

    leftBarGroup
      .selectAll('.dataRect.left')
      .data(this.itemSource.series)
      .enter()
      .append('rect')
      .attr('class', 'dataRect left')
      .attr('y', function (d) {
        return that.yScaleLeft(d[that.itemSource.yAxisProps]);
      })
      .attr('height', 15)
      .transition()
      .duration(500)
      .attr('width', function (d) {
        return that.regionWidth - that.xScaleLeft(d[that.itemSource.xAxisProps.left]);
      })
      .attr('fill', this.itemSource.color.left);

    rightBarGroup
      .selectAll('.dataRect.right')
      .data(this.itemSource.series)
      .enter()
      .append('rect')
      .attr('class', 'dataRect right')
      .attr('x', 0)
      .attr('y', function (d) {
        return that.yScaleLeft(d[that.itemSource.yAxisProps]);
      })
      .attr('height', 15)
      .transition()
      .duration(500)
      .attr('width', function (d) {
        return that.xScaleRight(d[that.itemSource.xAxisProps.right]);
      })
      .attr('fill', this.itemSource.color.right);

  }

  // 툴팁 그리기
  insertTooltip() {
    const that = this;
    const svg = d3.select(this.element).select('svg');

    const tooltip = d3.select('.chart-area')
      .append('div')
      .attr('class', 'tooltip-chart')
      .style('visibility', 'hidden');

    svg.selectAll('.dataRect.left').on('mouseover', function (d) {

      if (that.itemSource.tooltip) {
        let tooltiptxt = that.itemSource.tooltip;
        const regexp = new RegExp(`\\{\\{data\\}\\}`, 'gi');
        tooltiptxt = tooltiptxt.replace(regexp, d[that.itemSource.xAxisProps.left].toLocaleString('en', { timeZone: 'UTC' }));
        tooltip.html(tooltiptxt);
      } else {
        tooltip.html(d[that.itemSource.xAxisProps.left].toLocaleString('en', { timeZone: 'UTC' }));
      }

      return tooltip.style('visibility', 'visible');
    });

    svg.selectAll('.dataRect.right').on('mouseover', function (d) {
      if (that.itemSource.tooltip) {
        let tooltiptxt = that.itemSource.tooltip;
        const regexp = new RegExp(`\\{\\{data\\}\\}`, 'gi');
        tooltiptxt = tooltiptxt.replace(regexp, d[that.itemSource.xAxisProps.right].toLocaleString('en', { timeZone: 'UTC' }));
        tooltip.html(tooltiptxt);
      } else {
        tooltip.html(d[that.itemSource.xAxisProps.right].toLocaleString('en', { timeZone: 'UTC' }));
      }

      return tooltip.style('visibility', 'visible');
    });

    svg.selectAll('.dataRect')
      .on('mousemove', function () {
        const coord = d3.mouse(svg.node());
        return tooltip
          .style('left', (coord[0] - 10) + 'px')
          .style('top', (coord[1] + 10) + 'px');
      })
      .on('mouseout', function () {
        tooltip.html('');
        return tooltip.style('visibility', 'hidden');
      });
  }

  // 범례 삽입
  insertLegend() {
    const svg = d3.select(this.element).select('svg');
    const legend = svg.append('foreignObject')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.chartWidth)
      .attr('height', '20px');

    legend.append('xhtml:div')
      .attr('class', 'population-chart-legend')
      .html(`
        <i class="icon-legend" style="background-color: ${this.itemSource.color.left}"></i><span class="text">${this.itemSource.legend.left}</span>
        <i class="icon-legend" style="background-color: ${this.itemSource.color.right}"></i><span class="text">${this.itemSource.legend.right}</span>
      `);
  }
}
