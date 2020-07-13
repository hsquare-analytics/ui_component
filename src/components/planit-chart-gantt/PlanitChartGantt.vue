<template>
  <div>
    <div class="chart-area"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'PlanitChartGantt',
  components: {

  },
  props: {
    itemSource: Object,
  },
  data() {
    return {
      FIT_TIME_DOMAIN_MODEL: 'fit',

      timeDomainStart: this.itemSource.timeDomain.start,
      timeDomainEnd: this.itemSource.timeDomain.end,
      timeDomainMode: this.FIT_TIME_DOMAIN_MODE,
      taskTypes: [],
      // taskStatus: [],
      tasks: null,

      // chartHeight: this.height - this.chartPadding.top - this.chartPadding.bottom - 5,
      // chartWidth: this.width - this.chartPadding.right - this.chartPadding.left - 5,
      // tickFormat: '%H:%M',

      chartPadding: this.itemSource.chartPadding || {
        top: 40,
        right: 30,
        bottom: 40,
        left: 140,
      },

      chartWidth: 0,
      chartHeight: 0,

      xAxis: null,
      yAxis: null,
      xAxisGrid: null,
      yAxisGrid: null,
      xScale: null,
      yScale: null,
      minXScale: null,
      minYScale: null,
      tickFormat: null,
      brushX: null,
      brushY: null,
      zoomX: null,
      zoomY: null,
      mainChart: null,
      chartContent: null,
      context: null,
      chartColor: Object.freeze({
        blue: '#007bff',
        lightBlue: '#48b0f7',
        darkBlue: '#1d2088',
        indigo: '#6610f2',
        lightIndigo: '#5c6bc0',
        purple: '#6f42c1',
        lightPurple: '#7774e7',
        pink: '#e83e8c',
        lightPink: '#fc61a8',
        red: '#dc3545',
        orange: '#fd7e14',
        yellow: '#ffc107',
        green: '#28a745',
        lightGreen: '#10cfbd',
        teal: '#20c997',
        cyan: '#17a2b8',
        lightCyan: '#baf2fb',
        brown: '#996c33',
        gray: '#c6cedb',
        lightGray: '#d1d9e5',
        white: '#ffffff',
        black: '#333333',
        inpatient: '#f0540f',
        outpatient: '#269993',
        eppatient: '#be433e',
      }),
      // icon path값 설정
      icon: {
        chevronLeft: 'M 12.839844 13.824219 L 9.023438 10 L 12.839844 6.175781 L 11.667969 5 L 6.667969 10 L 11.667969 15 Z M 12.839844 13.824219',
        chevronRight: 'M 7.160156 13.824219 L 10.976562 10 L 7.160156 6.175781 L 8.332031 5 L 13.332031 10 L 8.332031 15 Z M 7.160156 13.824219',
      },
      handleWidth: 8,
      brushYWidth: 15,
    };
  },
  computed: {
    // chartWidth() {
    //   const parent = this.$parent.$el;
    //   const width = typeof(this.width) === 'string' && this.width.includes('%') ? parent.offsetWidth : parseInt(this.width, 10)
    //   return width - this.chartPadding.right - this.chartPadding.left - 5;
    // },
    // chartHeight() {
    //   const parent = this.$parent.$el;
    //   const height = typeof(this.width) === 'string' && this.height.includes('%') ? parent.offsetHeight : parseInt(this.height, 10);
    //   return height - this.chartPadding.top - this.chartPadding.bottom - 5;
    // },
    // chartPadding() {
    //   return {
    //     top: 40,
    //     right: 30,
    //     bottom: 40,
    //     left: 140,
    //   };
    // },
  },
  watch: {
    itemSource: {
      handler() {
        this.renderChart(this.itemSource.series);
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart(this.itemSource.series);
      window.addEventListener('resize', () => {
        // this.throttle(this.renderChart(this.itemSource.series), 500);
        this.throttle(function () { console.log('리사이즈'); }, 500);
      });
    });
  },
  // updated() {
  //   this.$nextTick(() => {
  //     console.log('update');
  //   });
  // },
  destroyed() {
    const svg = d3.select('.chart-area').select('svg');

    d3.brushX().on('brush end', null);
    d3.zoom().on('zoom', null);
    svg.selectAll('.dataRect').on('mouseover', null)
      .on('mousemove', null)
      .on('mouseout', null);
  },
  methods: {
    rectTransform(d) {
      return 'translate(' + this.xScale(d.startDate) + ',' + this.yScale(d[this.itemSource.yAxisProperty]) + ')';
    },
    throttle(fn, wait) {
      let time = Date.now();
      return function () {
        if ((time + wait - Date.now()) < 0) {
          fn();
          time = Date.now();
        }
      };
    },
    setXScale() {
      this.xScale = d3.scaleTime().domain([this.timeDomainStart, this.timeDomainEnd]).range([0, this.chartWidth]);
      this.minXScale = d3.scaleTime().domain([this.timeDomainStart, this.timeDomainEnd]).range([0, this.chartWidth]);
    },
    setYScale() {
      if (this.itemSource.yAxisTick && this.itemSource.yAxisTick.length) {
        this.yScale = d3.scaleBand().domain(this.itemSource.yAxisTick).range([0, this.chartHeight]).paddingOuter(1);
        this.minYScale = d3.scaleBand().domain(this.itemSource.yAxisTick).range([0, this.chartHeight]).paddingOuter(1);
      } else {
        let yAxisTick = this.itemSource.series;
        if (this.itemSource.yAxisSortCampare) {
          yAxisTick = this.itemSource.series.sort((a, b) => a[this.itemSource.yAxisSortCampare] - b[this.itemSource.yAxisSortCampare]).map(series => series[this.itemSource.yAxisProperty]);
        }
        this.yScale = d3.scaleBand().domain(yAxisTick).range([0, this.chartHeight]).paddingOuter(1);
        this.minYScale = d3.scaleBand().domain(yAxisTick).range([0, this.chartHeight]).paddingOuter(1);
      }
    },
    // x축 설정
    setXAxis() {
      this.xAxis = d3.axisBottom(this.xScale)
        .tickFormat(d3.timeFormat(this.tickFormat))
        .tickSize(8)
        .tickPadding(8);
      this.xAxisGrid = d3.axisBottom(this.xScale).tickSize(this.chartHeight).tickFormat('');
    },
    // y축 설정
    setYAxis() {
      this.yAxis = d3.axisLeft(this.yScale).tickSize(5);
      this.yAxisGrid = d3.axisLeft(this.yScale).tickSize(-this.chartWidth).tickFormat('');
    },

    // tick 형식 설정
    setTickFormat() {
      this.tickFormat = this.itemSource.xAxisTickFormat ? this.itemSource.xAxisTickFormat : '%H:%M';
    },

    calcDate(date, seq) {
      const props = seq === 'start' ? this.itemSource.xAxisProperty.startDate : this.itemSource.xAxisProperty.endDate;
      return new Date(date[props].replace(/[.-]/gi, '/'));
    },

    setChartWidth() {
      if (this.itemSource.yAxisBrush) {
        this.chartWidth = this.$el.parentElement.offsetWidth - this.chartPadding.right - 15 - this.chartPadding.left - 5;
      } else {
        this.chartWidth = this.$el.parentElement.offsetWidth - this.chartPadding.right - this.chartPadding.left - 5;
      }
    },

    setChartHeight() {
      this.chartHeight = this.$el.parentElement.offsetHeight - this.chartPadding.top - this.chartPadding.bottom - 5;
    },

    // 차트 렌더링
    renderChart(series) {
      this.removeDom();
      this.setChartWidth();
      this.setChartHeight();
      this.setTickFormat();
      this.setZoom();
      this.setBrush();
      this.setXScale();
      this.setYScale();
      this.setXAxis();
      this.setYAxis();

      // 차트 그리기
      this.drawChart(series);

      // 세로 날짜선 그리기
      this.drawTimePointer();
      // 브러시 삽입
      this.drawBrush();
      this.drawBrushY();
      // 툴팁 그리기
      this.insertTooltip();
    },

    // 차트 재렌더링
    removeDom() {
      const svg = d3.select('.chart-area').select('svg');
      svg.remove();
    },

    // 차트 그리기
    drawChart(series) {
      const that = this;
      const width = this.chartWidth + this.chartPadding.left + this.chartPadding.right;
      const height = this.chartHeight + this.chartPadding.top + this.chartPadding.bottom;

      const svg = d3.select('.chart-area')
        .append('svg')
        .attr('class', 'chart')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'relative');
        // .append('g')
        // .attr('class', 'gantt-chart')
        // .attr('width', width)
        // .attr('height', height)
        // .attr('transform', `translate(${this.chartPadding.left}, ${this.chartPadding.top})`);

      // clip-path
      svg.append('defs').append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight)
        .attr('x', 0)
        .attr('y', 0);

      svg.append('defs').append('svg:clipPath')
        .attr('id', 'clip-today')
        .append('svg:rect')
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight + 20)
        .attr('x', this.chartPadding.left)
        .attr('y', this.chartPadding.top - 20);

      svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.chartWidth)
        .attr('height', this.chartHeight)
        .attr('fill', 'none')
        .attr('transform', 'translate(' + this.chartPadding.left + ',' + this.chartPadding.top + ')')
        .call(this.zoomX);

      this.mainChart = svg.append('g')
        .attr('class', 'mainChart')
        .attr('transform', 'translate(' + this.chartPadding.left + ',' + this.chartPadding.top + ')');

      // x축 추가
      this.mainChart.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${this.chartHeight})`)
        .transition()
        .call(this.xAxis);

      // y축 추가
      this.mainChart.append('g')
        .attr('class', 'axis axis--y')
        .transition()
        .call(this.yAxis);

      // x,y축 그리드 추가
      this.mainChart.append('g').attr('class', 'y grid').call(this.yAxisGrid);
      this.mainChart.append('g').attr('class', 'x grid').call(this.xAxisGrid);

      this.context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', `translate(${this.chartPadding.left}, ${this.chartHeight + this.chartPadding.top})`);

      this.chartContent = svg.append('g')
        .attr('class', 'mainChart')
        .attr('transform', 'translate(' + this.chartPadding.left + ',' + this.chartPadding.top + ')')
        .attr('clip-path', 'url(#clip)');

      this.chartContent
        .selectAll('.chart')
        .data(series)
        .enter()
        .append('rect')
        .attr('class', 'dataRect')
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', function (d) {
          return d.color ? d.color : that.chartColor.cyan;
        })
        // .attr('fill', this.chartColor.cyan)
        .attr('stroke', '#ffffff')
        .attr('y', 0)
        .attr('transform', function (d) {
          if (isNaN(that.calcDate(d, 'start'))) {
            return 'translate(0, 0)';
          }
          return `translate(
            ${parseInt(that.xScale(that.calcDate(d, 'start')), 10)},
            ${that.yScale(d[that.itemSource.yAxisProperty])}
          )`;
        })
        .transition()
        .attr('height', function () {
          return that.yScale.bandwidth() - 2;
        })
        .attr('width', function (d) {
          if (isNaN(that.calcDate(d, 'start')) || isNaN(that.calcDate(d, 'end'))) {
            return 0;
          }
          return that.xScale(that.calcDate(d, 'end')) - that.xScale(that.calcDate(d, 'start'));
        });

    },

    // 브러시 삽입
    drawBrush() {
      // const context = svg.select('.context');
      // const that = this;
      // this.context.append('g')
      //   .attr('class', 'axis axis--x')
      //   .attr('transform', `translate(0, ${this.chartHeight})`)
      //   .call(this.minXScale);

      const brush = this.context.append('g')
        .attr('class', 'brush')
        // .attr('height', this.chartPadding.bottom + 6)
        .call(this.brushX)
        .call(this.brushX.move, this.xScale.range());

      brush.selectAll('.handle')
        .attr('height', this.chartPadding.bottom)
        .attr('transform', 'translate(0, 3)');

      // brush.append('g').append('path')
      //   .attr('class', 'arrow-left')
      //   .attr('d', this.icon.chevronLeft)
      //   .attr('fill', '#000000');

      // brush
      //   .selectAll('.handle--custom')
      //   .data([{
      //     type: 'w'
      //   }, {
      //     type: 'e'
      //   }])
      //   .enter()
      //   .append('path')
      //   .attr('d', function (d, i) {
      //     const icon = i === 0 ? that.icon.chevronLeft : that.icon.chevronRight;
      //     return icon;
      //   })
      //   .style('fill', this.chartColor.cyan)
      //   .style('stroke', 'none')
      //   .attr('class', 'handle--arrow')
      //   .attr('transform', (d, i) => {
      //     const x = i === 0 ? -this.handleWidth : this.chartWidth - this.handleWidth;
      //     const y = 10;
      //     return `translate(${x}, ${y})`;
      //   });

    },

    drawBrushY() {
      if (!this.itemSource.yAxisBrush) {
        return;
      }

      const svg = d3.select('.chart-area').select('svg');

      svg.append('g')
        .attr('class', 'brush-y')
        .attr('width', 30)
        .attr('transform', `translate(${this.chartWidth + this.chartPadding.left + 15}, ${this.chartPadding.top})`)
        // .attr('height', this.chartPadding.bottom + 6)
        .call(this.brushY)
        .call(this.brushY.move, this.yScale.range());

    },

    // 차트 브러시 세팅
    setBrush() {
      this.brushX = d3.brushX()
        .extent([[0, 0], [this.chartWidth, this.chartPadding.bottom]])
        .on('brush end', this.brushedX);

      if (this.itemSource.yAxisBrush) {
        this.brushY = d3.brushY()
          .extent([[0, 0], [this.brushYWidth, this.chartHeight]])
          .on('brush', this.brushedY);
      }
    },

    // 브러시 작동 함수
    brushedX() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
        return;
      }

      const svg = d3.select('.chart-area').select('svg');
      const selection = d3.event.selection || this.minXScale.range();
      // const brush = svg.select('.brush');
      this.xScale.domain(selection.map(this.minXScale.invert, this.minXScale));

      // Line_chart.select('.line').attr('d', line);
      this.mainChart.select('.axis--x').call(this.xAxis);
      this.mainChart.select('.x.grid').call(this.xAxisGrid);

      svg.select('.zoom').call(this.zoomX.transform, d3.zoomIdentity
        .scale(this.chartWidth / (selection[1] - selection[0]))
        .translate(-selection[0], 0));

      // brush.selectAll('.handle--arrow')
      //   .attr('transform', (d, i) => {
      //     const x = i === 0 ? selection[i] - this.handleWidth : selection[i] - this.handleWidth;
      //     const y = 10;
      //     return `translate(${x}, ${y})`;
      //   });
      // brush.append('g').append('path')
      //   .attr('class', 'arrow-left')
      //   .attr('d', this.icon.chevronLeft)
      //   .attr('fill', '#000000');

      // let handle;
      // handle.attr('transform', function (d, i) {
      //   const x = i === 0 ? selection[i] : selection[i] - 20;
      //   const y = 10;
      //   return `translate(${x}, ${y})`;
      // })
      //   .attr('d', function (d, i) {
      //     const icon = i === 0 ? that.icon.chevronLeft : that.icon.chevronRight;
      //     return icon;
      //   })
      //   .style('fill', '#ffffff')
      //   .style('stroke', 'none');

      // handle = svg.select('.brush')
      //   .selectAll('.handle')
      //   .data([{
      //     type: 'w'
      //   }, {
      //     type: 'e'
      //   }])
      //   .enter()
      //   .append('path')
      //   .attr('class', 'handle')
      //   .attr('y', 5)
      //   .attr('transform', 'translate(0, 4)');

    },

    brushedY() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
        return;
      }
      const that = this;
      const svg = d3.select('.chart-area').select('svg');
      const selection = d3.event.selection || this.minYScale.range();
      const newAxisTick = [];

      this.minYScale.domain().forEach((d) => {
        const pos = this.minYScale(d) + this.minYScale.bandwidth() / 2;
        if (pos >= selection[0] && pos <= selection[1]){
          newAxisTick.push(d);
        }
      });

      this.yScale.domain(newAxisTick);
      // this.yScale.domain(selection.map(this.minYScale.invert, this.yScale));
      this.mainChart.select('.axis--y').call(this.yAxis);
      this.mainChart.select('.y.grid').call(this.yAxisGrid);

      // const ticks = this.yScale.ticks(newAxisTick.length);
      // const tickDistance = this.yScale(ticks[ticks.length - 1]) - this.yScale(ticks[ticks.length - 2]);
      // console.log(tickDistance);

      svg
        .selectAll('.dataRect')
        .attr('height', function () {
          return that.yScale.bandwidth() - 2;
        })
        .attr('transform', function (d) {
          if (isNaN(that.calcDate(d, 'start'))) {
            return 'translate(0, 0)';
          }
          return `translate(
            ${that.xScale(that.calcDate(d, 'start'))},
            ${that.yScale(d[that.itemSource.yAxisProperty])}
          )`;
        });

    },

    // scaleBandInvert(scale) {
    //   const domain = scale.domain();
    //   const paddingOuter = scale(domain[0]);
    //   const eachBand = scale.step();
    //   return function (value) {
    //     const index = Math.floor(((value - paddingOuter) / eachBand));
    //     return domain[Math.max(0, Math.min(index, domain.length - 1))];
    //   };
    // },

    // 줌 세팅
    setZoom() {
      this.zoomX = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.chartWidth, this.chartHeight]])
        .extent([[0, 0], [this.chartWidth, this.chartHeight]])
        .on('zoom', this.zoomedX);
    },

    zoomedX() {
      // if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
      //   return;
      // }
      const t = d3.event.transform;
      const svg = d3.select('.chart-area').select('svg');
      const that = this;

      this.xScale.domain(t.rescaleX(this.minXScale).domain());
      svg
        .selectAll('.dataRect')
        .attr('transform', function (d) {
          if (isNaN(that.calcDate(d, 'start'))) {
            return 'translate(0, 0)';
          }
          return `translate(
            ${that.xScale(that.calcDate(d, 'start'))},
            ${that.yScale(d[that.itemSource.yAxisProperty])}
          )`;
        })
        .attr('width', function (d) {
          if (isNaN(that.calcDate(d, 'start')) || isNaN(that.calcDate(d, 'end'))) {
            return 0;
          }
          return that.xScale(that.calcDate(d, 'end')) - that.xScale(that.calcDate(d, 'start'));
        });

      svg.selectAll('.time-pointer').remove();
      this.drawTimePointer();

      this.mainChart.select('.axis--x').call(this.xAxis);
      this.mainChart.select('.x.grid').call(this.xAxisGrid);
      this.context.select('.brush').call(this.brushX.move, this.xScale.range().map(t.invertX, t));
    },

    // 툴팁 그리기
    insertTooltip() {
      const that = this;
      const svg = d3.select('.chart-area').select('svg');

      const tooltip = d3.select('.chart-area')
        .append('div')
        .attr('class', 'tooltip-gantt-chart')
        .style('visibility', 'hidden');

      // const tooltipText = tooltip.append('text')
      //   .attr('class', 'tooltip-gantt-chart');

      svg.selectAll('.dataRect')
        .on('mouseover', function (d) {
          let result = that.itemSource.tooltip;

          Object.keys(d).forEach(name => {
            const val = d[name];
            const regexp = new RegExp(`\\{\\{${name}\\}\\}`, 'gi');

            result = result.replace(regexp, val);
          });
          tooltip.html(result.toString());

          return tooltip.style('visibility', 'visible');
        })
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
    },

    // 세로 날짜선 그리기
    drawTimePointer() {
      const timePointer = this.itemSource.timePointer;
      if (!(timePointer && timePointer.length)) {
        return;
      }
      const todaybarHeight = 16;
      const barWidth = 60;
      const adjustY = this.chartPadding.top;
      // const adjustY = todaybarHeight + 1;
      const color = this.itemSource.timpointerColor || this.chartColor.yellow;
      const format = d3.timeFormat(this.tickFormat);

      timePointer.forEach(pointer => {
        const xPoint = this.xScale(new Date(pointer)) + this.chartPadding.left;

        const root = d3.select('.chart-area').select('svg')
          .append('g')
          .attr('class', 'time-pointer')
          .attr('data-id', 'todayRoot')
          .attr('clip-path', 'url(#clip-today)');

        root.append('line')
          .attr('x1', xPoint)
          .attr('y1', adjustY - todaybarHeight)
          .attr('x2', xPoint)
          .attr('y2', this.chartHeight + this.chartPadding.top)
          .attr('class', 'nowBar')
          .style('stroke', color)
          .style('stroke-width', 1);

        root
          .append('rect')
          .attr('x', function () {
            return xPoint - (barWidth / 2);
          })
          .attr('y', adjustY - todaybarHeight)
          .attr('width', barWidth)
          .attr('height', todaybarHeight)
          .style('fill', color)
          .style('stroke-linecap', 'round');

        root
          .append('text')
          .attr('x', function () {
            return xPoint - (barWidth / 2);
          })
          .attr('y', adjustY - todaybarHeight)
          .attr('text-anchor', 'start')
          .attr('dx', 16)
          .attr('dy', 12)
          .text(format(new Date(pointer)))
          .style('font-size', '11px')
          .style('fill', '#ffffff');

        root
          .append('circle')
          .attr('r', 3)
          .attr('cx', function () {
            return xPoint;
          })
          .attr('cy', adjustY)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('fill', '#ffffff');
      });
    },
  },

  // created() {

  // },

};
</script>

<style>
.chart-area {
  position: relative;
}
.axis path,.axis line {
  fill: none;
  stroke: #ddd;
  shape-rendering: crispEdges;
}
.domain {
  stroke: #000;
}
.tick line {
  stroke: #ddd;
}
.grid .tick line {
  fill: none;
  stroke: #ddd;
  shape-rendering: crispEdges;
}
.tooltip-gantt-chart {
  position: absolute;
  background-color: rgba(50,50,50,0.7);
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  padding: 5px;
  white-space: nowrap;
  word-break: keep-all;
  text-align: left;
}
.selection {
  fill: #999;
}
.handle--w, .handle--e {
  width: 4px;
  fill: #fff;
  /* transform: translate(0, 10); */
  /* stroke-width: 2; */
  margin-left: -4px;
  /* stroke: rgba(23, 162, 184, 0.5); */
  /* fill: #f5f5f5; */
  /* stroke: #fff; */
  fill: rgba(23, 162, 184, 0.5);
}
.handle--n, .handle--s {
  height: 4px;
  fill: #fff;
  /* transform: translate(0, 10); */
  /* stroke-width: 2; */
  margin-left: -4px;
  /* stroke: rgba(23, 162, 184, 0.5); */
  /* fill: #f5f5f5; */
  /* stroke: #fff; */
  fill: rgba(23, 162, 184, 0.5);
}
.zoom {
  cursor: move;
  fill: none;
  pointer-events: all;
}
.brush-y .overlay {
  fill: #f5f5f5;
}
</style>
