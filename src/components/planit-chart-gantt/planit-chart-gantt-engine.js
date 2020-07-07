import d3 from 'd3';

export default {
  FIT_TIME_DOMAIN_MODEL: 'fit',

  margin: {
    top: 20,
    right: 40,
    bottom: 20,
    left: 150,
  },

  timeDomainStart: d3.time.day.offset(new Date(), -3),
  timeDomainEnd: d3.time.hour.offset(new Date(), +3),
  timeDomainMode: this.FIT_TIME_DOMAIN_MODE,
  taskTypes: [],
  taskStatus: [],
  tasks: null,

  height: document.body.clientHeight - this.margin.top - this.margin.bottom - 5,
  width: document.body.clientWidth - this.margin.right - this.margin.left - 5,
  tickFormat: '%H:%M',

  x: d3.time.scale().domain([this.timeDomainStart, this.timeDomainEnd]).range([0, this.width]).clamp(true),
  y: d3.scale.ordinal().domain(this.taskTypes).rangeRoundBands([0, this.height - this.margin.top - this.margin.bottom], 0.1),
  xAxis: null,
  yAxis: null,
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

  keyFunction(d) {
    return d.startDate + d.taskName + d.endDate;
  },

  rectTransform(d) {
    return `translate(${this.x(d.startDate)},${this.y(d.taskName)})`;
  },

  initTimeDomain() {
    if (this.timeDomainMode === this.FIT_TIME_DOMAIN_MODE) {
      if (this.tasks === undefined || this.tasks.length < 1) {
        this.timeDomainStart = d3.time.day.offset(new Date(), -3);
        this.timeDomainEnd = d3.time.hour.offset(new Date(), +3);
        return;
      }
      this.tasks.sort((a, b) => a.endDate - b.endDate);
      this.timeDomainEnd = this.tasks[this.tasks.length - 1].endDate;
      this.tasks.sort((a, b) => a.startDate - b.startDate);
      this.timeDomainStart = this.tasks[0].startDate;
    }
  },

  initAxis() {
    this.x = d3.time.scale().domain([this.timeDomainStart, this.timeDomainEnd]).range([0, this.width]).clamp(true);
    this.y = d3.scale.ordinal().domain(this.askTypes).rangeRoundBands([0, this.height - this.margin.top - this.margin.bottom], 0.1);
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom').tickFormat(d3.time.format(this.tickFormat))
      .tickSubdivide(true)
      .tickSize(8)
      .tickPadding(8);

    this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickSize(0);
  },

  gantt(tasks) {
    this.initTimeDomain();
    this.initAxis();

    const svg = d3.select('.chart-area')
      .append('svg')
      .attr('class', 'chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('class', 'gantt-chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    svg.selectAll('.chart')
      .data(tasks, this.keyFunction).enter()
      .append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('class', (d) => {
        if (this.taskStatus[d.status] == null) { return 'bar'; }
        return this.taskStatus[d.status];
      })
      .attr('y', 0)
      .attr('transform', this.rectTransform)
      .attr('height', () => this.y.rangeBand())
      .attr('width', (d) => (this.x(d.endDate) - this.x(d.startDate)));

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height - this.margin.top - this.margin.bottom})`)
      .transition()
      .call(this.xAxis);

    svg.append('g').attr('class', 'y axis').transition().call(this.yAxis);

  },
};


// d3.gantt = function () {
//   const FIT_TIME_DOMAIN_MODE = 'fit';
//   // const FIXED_TIME_DOMAIN_MODE = 'fixed';

//   const margin = {
//     top: 20,
//     right: 40,
//     bottom: 20,
//     left: 150,
//   };
//   let timeDomainStart = d3.time.day.offset(new Date(), -3);
//   let timeDomainEnd = d3.time.hour.offset(new Date(), +3);
//   // fixed or fit
//   let timeDomainMode = FIT_TIME_DOMAIN_MODE;
//   let taskTypes = [];
//   let taskStatus = [];
//   let height = document.body.clientHeight - margin.top - margin.bottom - 5;
//   let width = document.body.clientWidth - margin.right - margin.left - 5;

//   let tickFormat = '%H:%M';

//   let x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);

//   let y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);

//   const keyFunction = (d) => {
//     return d.startDate + d.taskName + d.endDate;
//   };

//   const rectTransform = function (d) {
//     return `translate(${x(d.startDate)},${y(d.taskName)})`;
//   };

//   let xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.time.format(tickFormat))
//     .tickSubdivide(true)
//     .tickSize(8)
//     .tickPadding(8);

//   let yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0);

//   const initTimeDomain = () => {
//     if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
//       if (tasks === undefined || tasks.length < 1) {
//         timeDomainStart = d3.time.day.offset(new Date(), -3);
//         timeDomainEnd = d3.time.hour.offset(new Date(), +3);
//         return;
//       }
//       tasks.sort((a, b) => a.endDate - b.endDate);
//       timeDomainEnd = tasks[tasks.length - 1].endDate;
//       tasks.sort((a, b) => a.startDate - b.startDate);
//       timeDomainStart = tasks[0].startDate;
//     }
//   };

//   const initAxis = () => {
//     x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
//     y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);
//     xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.time.format(tickFormat))
//       .tickSubdivide(true)
//       .tickSize(8)
//       .tickPadding(8);

//     yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0);
//   };

//   function gantt(tasks) {
//     initTimeDomain();
//     initAxis();

//     const svg = d3.select('.chart-area')
//       .append('svg')
//       .attr('class', 'chart')
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//       .append('g')
//       .attr('class', 'gantt-chart')
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//     svg.selectAll('.chart')
//       .data(tasks, keyFunction).enter()
//       .append('rect')
//       .attr('rx', 5)
//       .attr('ry', 5)
//       .attr('class', (d) => {
//         if (taskStatus[d.status] == null) { return 'bar'; }
//         return taskStatus[d.status];
//       })
//       .attr('y', 0)
//       .attr('transform', rectTransform)
//       .attr('height', (d) => y.rangeBand())
//       .attr('width', (d) => (x(d.endDate) - x(d.startDate)));

//     svg.append('g')
//       .attr('class', 'x axis')
//       .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
//       .transition()
//       .call(xAxis);

//     svg.append('g').attr('class', 'y axis').transition().call(yAxis);

//     return gantt;
//   }

//   gantt.redraw = function (tasks) {
//     initTimeDomain();
//     initAxis();

//     const svg = d3.select('svg');

//     const ganttChartGroup = svg.select('.gantt-chart');
//     const rect = ganttChartGroup.selectAll('rect').data(tasks, keyFunction);

//     rect.enter()
//       .insert('rect', ':first-child')
//       .attr('rx', 5)
//       .attr('ry', 5)
//       .attr('class', (d) => {
//         if (taskStatus[d.status] == null) { return 'bar'; }
//         return taskStatus[d.status];
//       })
//       .transition()
//       .attr('y', 0)
//       .attr('transform', rectTransform)
//       .attr('height', () => y.rangeBand())
//       .attr('width', (d) => (x(d.endDate) - x(d.startDate)));

//     rect.transition()
//       .attr('transform', rectTransform)
//       .attr('height', () => y.rangeBand())
//       .attr('width', (d) => (x(d.endDate) - x(d.startDate)));

//     rect.exit().remove();

//     svg.select('.x').transition().call(xAxis);
//     svg.select('.y').transition().call(yAxis);

//     return gantt;
//   };

//   gantt.margin = function (value) {
//     if (!arguments.length) { return margin; }
//     margin = value;
//     return gantt;
//   };

//   gantt.timeDomain = function (value) {
//     if (!arguments.length) { return [timeDomainStart, timeDomainEnd]; }
//     timeDomainStart = +value[0], timeDomainEnd = +value[1];
//     return gantt;
//   };

//   /**
// 	 * @param {string}
// 	 *                vale The value can be 'fit' - the domain fits the data or
// 	 *                'fixed' - fixed domain.
// 	 */
//   gantt.timeDomainMode = function (value) {
//     if (!arguments.length) { return timeDomainMode; }
//     timeDomainMode = value;
//     return gantt;
//   };

//   gantt.taskTypes = function (value) {
//     if (!arguments.length) { return taskTypes; }
//     taskTypes = value;
//     return gantt;
//   };

//   gantt.taskStatus = function (value) {
//     if (!arguments.length) { return taskStatus; }
//     taskStatus = value;
//     return gantt;
//   };

//   gantt.width = function (value) {
//     if (!arguments.length) { return width; }
//     width = +value;
//     return gantt;
//   };

//   gantt.height = function (value) {
//     if (!arguments.length) { return height; }
//     height = +value;
//     return gantt;
//   };

//   gantt.tickFormat = function (value) {
//     if (!arguments.length) { return tickFormat; }
//     tickFormat = value;
//     return gantt;
//   };

//   return gantt;
// };
