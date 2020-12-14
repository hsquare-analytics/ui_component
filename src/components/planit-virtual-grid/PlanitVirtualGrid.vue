<template>
  <div
    class="table-wrapper default-table-wrapper"
    :class="resize ? 'table-wrapper-lg' : ''"
    ref="defaultTableWrapper"
  >
    <table
      class="table table-striped table-body table-hover"
      ref="defaultTableHeader"
      :style="{ width: defaultTableWidth }"
    >
      <colgroup>
        <col
          v-for="(col, index) in defaultTableColgroup"
          :width="col + 'px'"
          v-bind:key="'C' + index"
        />
      </colgroup>
      <thead>
        <template v-for="column in tableData.columns">
          <th scope="col" v-if="column.show" :key="column.key" :data-column="column.key">
            <span>{{column.name}}</span>
          </th>
        </template>
      </thead>
    </table>
    <VuewPerfectScrollbar
      :settings="settings"
      class="scroll-area"
      :style="{ height: scrollableHeight + 'px', width: defaultTableWidth }"
    >
      <table
        class="table table-striped table-body table-hover"
        ref="defaultTableBody"
        :style="{ width: defaultTableWidth }"
      >
        <colgroup>
          <col v-for="col in defaultTableColgroup" :width="col" :key="'D' + col" />
        </colgroup>
        <tbody ref="defaultTableBody">
          <tr v-for="d in tableData.data" :key="d.id">
            <td
              v-for="column in tableData.columns"
              :key="column.key"
            >{{decorateVal(column , d[column.key])}}</td>
          </tr>
        </tbody>
      </table>
    </VuewPerfectScrollbar>
  </div>
</template>

<script>
import VuewPerfectScrollbar from "vue-perfect-scrollbar";

export default {
  name: "PlanitVirtualGrid",
  props: {
    storeName: {
      type: String,
    },
    resize: {
      type: Boolean,
    },
  },
  components: {
    VuewPerfectScrollbar,
  },
  data() {
    return {
      ref: this.$refs,
      pivotData: [],
      columns: [],
      rows: [],
      colgroup: [],
      defaultTableColgroup: [],
      defaultTableWidth: "100%",
      scrollableHeight: 0,
      settings: {
        suppressScrollX: true,
        scrollXMarginOffset: 100,
        minScrollbarLength: 20,
      },
      timer1: null,
      timer2: null,
      timer3: null,
      timer4: null,
      minTdSize: 120,
      rowHeight: 31,
      reformPivotTableData: [],
      virtualPivotTableData: [],
      virtualTableTopFilter: [],
      virtualMode: false,
      viewportHeight: 0,
      virtualBufferTop: 0,
      virtualBufferBottom: 0,
      virtualLeft: [],
      minVirtualScrollLength: 50,
    };
  },
  created() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.autoSizeColumn);
    });
  },
  destroyed() {
    this.psScrollbar.destroy();
    this.psScrollbar = null;
    window.removeEventListener("resize", this.autoSizeColumn);
  },
  mounted() {
    this.$nextTick(() => {
      this.setScrollbar();
    });
  },
  beforeDestroy() {
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
    clearTimeout(this.timer3);
    clearTimeout(this.timer4);
  },
  watch: {
    pivotTableData() {
      this.pivotData = this.pivotTableData.data;
      this.reformPivotTableData = [];
      this.$nextTick(() => {
        this.dataDivide = {
          start: 0,
          end: this.initLoadDataNum,
        };
        const viewport = this.$refs.pivotTableScrollArea;
        viewport.scrollTop = 0;

        this.makeVirtualScroll(
          this.pivotTableData.left.slice(
            this.dataDivide.start,
            this.dataDivide.end + 1
          )
        );
        this.pivotTableScroll();
      });
    },
    defaultGridType() {
      this.$nextTick(() => {
        // this.autoSizeColumn();
        this.setScrollbar();
      });
    },
  },
  methods: {
    // 스롤바 세팅
    setScrollbar() {
      // const container = this.$refs.pivotTableScrollArea;
      // this.psScrollbar = new PerfectScrollbar(container, this.settings);
    },

    // 피벗테이블 가상스크롤 실행
    pivotTableScroll() {
      let ticking = false;

      if (!ticking) {
        // 스크롤은 이벤트 발생 속도가 매우 빠르므로, 윈도우 화면주사율과 이벤트 발생 속도를 일치시켜 버퍼링을 방지한다.
        window.requestAnimationFrame(() => {
          // 데이터 개수
          const trLength = this.pivotTableData.left.length;

          // 그리드 효율을 위해 데이터 개수가 minVirtualScrollLength 보다 작으면 피벗스크롤 실행하지 않음.
          if (
            trLength < this.minVirtualScrollLength || !this.reformPivotTableData.length
          ) {
            return;
          }

          // 스크롤 영역
          const viewport = this.$refs.pivotTableScrollArea;

          // 현재 y스크롤 위치
          const y = viewport.scrollTop;
          // 원활한 스크롤을 위해 스크롤 영역 높이보다 약 2배 정도의 데이터를 DOM으로 생성한다.
          const buffer = this.scrollableHeight * 2;

          // 스크롤 발생시마다 피벗 데이터의 top위치와 bottom 위치를 계산한다.
          let top = Math.floor((y - buffer) / this.rowHeight);
          let bottom = Math.ceil((y + buffer) / this.rowHeight);
          top = Math.max(0, top);
          bottom = Math.min(trLength, bottom);
          const tableViewHeight = (bottom - top + 1) * this.rowHeight;

          this.virtualBufferTop = Math.max(0, y - tableViewHeight / 3);

          this.virtualBufferBottom = Math.max(
            0,
            this.viewportHeight - tableViewHeight - this.virtualBufferTop
          );
          this.virtualPivotTableData = this.reformPivotTableData.slice(
            top,
            bottom
          );

          ticking = false;
        });

        ticking = true;
      }
    },

    // 가상스크롤을 위한 데이터 재가공
    makeVirtualScrollData(pivotLeft) {
      const row = this.pivotTableFrame.rows.length;

      return pivotLeft.map((data, index) => {
        const rData = { ...data };
        const left = this.pivotTableData.leftFilter[index];

        const css = {
          total1: left && left.length === row - 1,
          total2: left && left.length === row - 2,
          finalTop: index === 0, // 소계 맨 위
        };

        while (rData.colspan.length > data.key.length) {
          rData.key.unshift("");
        }

        rData.css = css;
        rData.index = index;

        return rData;
      });
    },

    // 가상스크롤 세팅
    makeVirtualScroll(pivotTableData) {
      // 데이터 개수
      const trLength = this.pivotTableData.left.length;
      // 데이터 재가공
      console.log("데이터 접수 완료");

      const thumb = this.makeVirtualScrollData(pivotTableData);

      this.virtualLeft = thumb[0].colspan.length === 1
        ? new Array(thumb[0].colspan[0])
        : new Array(thumb[0].colspan.length);

      this.viewportHeight = thumb.length * this.rowHeight;

      if (trLength < this.minVirtualScrollLength) {
        this.virtualPivotTableData = this.makeVirtualScrollData(pivotTableData);
        this.virtualMode = false;
        return;
      }

      this.virtualMode = true;
      this.reformPivotTableData.push(...thumb);
    },

  },
};
</script>
<style lang="scss" scoped>
</style>
