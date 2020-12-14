<template>
  <div style="height: 100%;text-align: left">
    <div class="chart-render-area" style="width: 100%;height:800px" ref="chartRenderArea">
      <iframe src="../../ui/planit-population-chart/population-chart.html"></iframe>
    </div>

    <h2>의존 모듈</h2>

    <div class="textbox">
      d3.js : $ npm install d3 --save
    </div>

    <h2>Template</h2>

    <codemirror
      :value="templateCode"
      :options="cmOptionsHtml">
    </codemirror>

    <h2>Script</h2>

    <codemirror
      :value="scriptCode"
      :options="cmOptionsJavascript">
    </codemirror>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror';
// eslint-disable-next-line import/extensions
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import PlanitChartGantt from './PlanitChartGantt.vue';

export default {
  name: 'Example',
  components: {
    codemirror,
    PlanitChartGantt,
  },
  data() {
    return {
      chartData: {
        // [optional] y축 텍스트 설정. 값이 없을 경우, 데이터 통해 자동으로 구성
        yAxisTick: [
          'Room1', 'Room2', 'Room3', 'Room39', 'Room4', 'Room5', 'Room6',
          'Room10', 'Room11', 'Room12', 'Room13', 'Room14', 'Room15', 'Room16', 'Room7',
          'Room8', 'Room9', 'Room19', 'Room17', 'Room18', 'Room21', 'Room22', 'Room23',
          '통원수술회복실', 'Room24', 'Room25', 'Room26', 'Room27',
          'Room28',
          'Room29',
          'Room30',
          'Room31',
          'Room32',
          'Room33',
          'Room34',
          'Room35',
          'Room36',
          'Room37',
          'Room38',
          'Room20',
          '응급수술실',
          '기타수술장',
          '기관지내시경실1',
          '기관지내시경실2',
        ],
        // x축 시간 표시 범위
        timeDomain: {
          start: new Date('2020-06-10T06:00:00'),
          end: new Date('2020-06-10T23:00:00'),
        },
        // y축 데이터 지정
        yAxisProperty: 'oprmNm',
        // [optional] y축 데이터 sort 기준 설정.
        yAxisSortCampare: 'scrnSortSeq',
        // x축 데이터 지정
        xAxisProperty: {
          startDate: 'opStartDtm',
          endDate: 'opOutDtm',
        },
        // [optional] x축 시간 표시 형식 지정. default: '%H:%M'. https://github.com/d3/d3-time-format/blob/v2.2.3/README.md#timeFormat 참조.
        xAxisTickFormat: '%H:%M',
        // [optional] 툴팁
        tooltip: "진료의: {{pfdrStfNm}} <br />진료과: {{ctrDeptNm}}",
        // [optional] 세로 시간선 표시
        timePointer: [
          '2020-06-10T08:00:00',
          '2020-06-10T12:00:00',
          '2020-06-10T18:00:00',
        ],
        // [optional] 세로 시간선 컬러 사용자 지정. default: '#ffc107'
        timePointerColor: '#ffc107',
        // [optional] 차트 여백 사용자 지정. default: { top: 40, right: 30, bottom: 40, left: 140 }
        chartPadding: {
          top: 40,
          right: 30,
          bottom: 40,
          left: 140,
        },
        // [optional] y축 브러시 줌 사용 여부 .default: false
        yAxisBrush: true,
        // 시간 표시 데이터
        series: [{
          "pkId": "20200610ORA1100623676",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA1",
          "oprmNm": "Room1",
          "scrnSortSeq": "10",
          "ptNo": "20544364",
          "ctrDeptCd": "CNSC",
          "ctrDeptNm": "뇌신경센터",
          "medDeptCd": "NS",
          "medDeptNm": "신경외과",
          "pfdrSid": "1005331",
          "pfdrStfNo": "65899",
          "pfdrStfNm": "홍길동",
          "opStartDtm": "2020-06-10 12:33:00",
          "opOutDtm": "2020-06-10 14:21:00",
          "opVocId": "P00008191",
          "opNm": "Stenting of aneurysm, neuroendovascular",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "NNS",
          "orgPfdrDeptNm": "신경외과 (뇌신경센터)",
          "orgPfdrSid": "1005331",
          "orgPfdrStfNo": "65899",
          "orgPfdrStfNm": "홍길동",
        }, {
          "pkId": "20200610ORA1100629400",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA1",
          "oprmNm": "Room1",
          "scrnSortSeq": "10",
          "ptNo": "32501151",
          "ctrDeptCd": "CNSC",
          "ctrDeptNm": "뇌신경센터",
          "medDeptCd": "NS",
          "medDeptNm": "신경외과",
          "pfdrSid": "1005331",
          "pfdrStfNo": "65899",
          "pfdrStfNm": "홍길동",
          "opStartDtm": "2020-06-10 10:50:00",
          "opOutDtm": "2020-06-10 11:49:00",
          "opVocId": "P00008362",
          "opNm": "Coil embolization of aneurysm, neuroendovascular",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "NNS",
          "orgPfdrDeptNm": "신경외과 (뇌신경센터)",
          "orgPfdrSid": "1005331",
          "orgPfdrStfNo": "65899",
          "orgPfdrStfNm": "홍길동",
        }, {
          "pkId": "20200610ORA1100631082",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA1",
          "oprmNm": "Room1",
          "scrnSortSeq": "10",
          "ptNo": "20413903",
          "ctrDeptCd": "CNSC",
          "ctrDeptNm": "뇌신경센터",
          "medDeptCd": "NS",
          "medDeptNm": "신경외과",
          "pfdrSid": "1005331",
          "pfdrStfNo": "65899",
          "pfdrStfNm": "홍길동",
          "opStartDtm": "2020-06-10 11:57:00",
          "opOutDtm": "2020-06-10 12:23:00",
          "opVocId": "P00001798",
          "opNm": "Diagnostic procedure on blood vessel ( left )",
          "anstKndCd": "7",
          "anstKndNm": "국소",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "NNS",
          "orgPfdrDeptNm": "신경외과 (뇌신경센터)",
          "orgPfdrSid": "1005331",
          "orgPfdrStfNo": "65899",
          "orgPfdrStfNm": "홍길동",
        }, {
          "pkId": "20200610ORA2100623993",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA2",
          "oprmNm": "Room2",
          "scrnSortSeq": "20",
          "ptNo": "27176926",
          "ctrDeptCd": "RC",
          "ctrDeptNm": "폐센터",
          "medDeptCd": "TS",
          "medDeptNm": "흉부외과",
          "pfdrSid": "1000796",
          "pfdrStfNo": "65531",
          "pfdrStfNm": "아이언맨",
          "opStartDtm": "2020-06-10 08:42:00",
          "opOutDtm": "2020-06-10 12:38:00",
          "opVocId": "P00008207",
          "opNm": "VATS (video-assisted thoracic surgery) LUL segmentectomy",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "RC",
          "orgPfdrDeptNm": "폐센터",
          "orgPfdrSid": "1000796",
          "orgPfdrStfNo": "65531",
          "orgPfdrStfNm": "아이언맨",
        }, {
          "pkId": "20200610ORA2100628816",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA2",
          "oprmNm": "Room2",
          "scrnSortSeq": "20",
          "ptNo": "25298729",
          "ctrDeptCd": "RC",
          "ctrDeptNm": "폐센터",
          "medDeptCd": "TS",
          "medDeptNm": "흉부외과",
          "pfdrSid": "1000796",
          "pfdrStfNo": "65531",
          "pfdrStfNm": "아이언맨",
          "opStartDtm": "2020-06-10 13:36:00",
          "opOutDtm": "2020-06-10 16:03:00",
          "opVocId": "P00008202",
          "opNm": "VATS (video-assisted thoracic surgery) LULobectomy",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "RC",
          "orgPfdrDeptNm": "폐센터",
          "orgPfdrSid": "1000796",
          "orgPfdrStfNo": "65531",
          "orgPfdrStfNm": "아이언맨",
        }, {
          "pkId": "20200610ORA2100630863",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA2",
          "oprmNm": "Room2",
          "scrnSortSeq": "20",
          "ptNo": "32588754",
          "ctrDeptCd": "CVC",
          "ctrDeptNm": "심장혈관센터",
          "medDeptCd": "TS",
          "medDeptNm": "흉부외과",
          "pfdrSid": "1004604",
          "pfdrStfNo": "65934",
          "pfdrStfNm": "트로츠키",
          "opStartDtm": "2020-06-10 16:28:00",
          "opOutDtm": "2020-06-10 17:42:00",
          "opVocId": "P00002814",
          "opNm": "Exploration of wound",
          "anstKndCd": "6",
          "anstKndNm": "MAC",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "CVC",
          "orgPfdrDeptNm": "심장혈관센터",
          "orgPfdrSid": "1004604",
          "orgPfdrStfNo": "65934",
          "orgPfdrStfNm": "트로츠키",
        }, {
          "pkId": "20200610ORA3100627422",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA3",
          "oprmNm": "Room3",
          "scrnSortSeq": "30",
          "ptNo": "14896464",
          "ctrDeptCd": "CVC",
          "ctrDeptNm": "심장혈관센터",
          "medDeptCd": "TS",
          "medDeptNm": "흉부외과",
          "pfdrSid": "1000216",
          "pfdrStfNo": "00913",
          "pfdrStfNm": "헐크",
          "opStartDtm": "2020-06-10 08:44:00",
          "opOutDtm": "2020-06-10 13:57:00",
          "opVocId": "P00006787",
          "opNm": "Root remodeling operation for annuloaortic ectasia (David operation)",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "CVC",
          "orgPfdrDeptNm": "심장혈관센터",
          "orgPfdrSid": "1000216",
          "orgPfdrStfNo": "00913",
          "orgPfdrStfNm": "헐크",
        }, {
          "pkId": "20200610ORA3100629792",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA3",
          "oprmNm": "Room3",
          "scrnSortSeq": "30",
          "ptNo": "32763841",
          "ctrDeptCd": "CVC",
          "ctrDeptNm": "심장혈관센터",
          "medDeptCd": "TS",
          "medDeptNm": "흉부외과",
          "pfdrSid": "1000216",
          "pfdrStfNo": "00913",
          "pfdrStfNm": "헐크",
          "opStartDtm": "2020-06-10 14:20:00",
          "opOutDtm": "2020-06-10 19:32:00",
          "opVocId": "P00006787",
          "opNm": "Root remodeling operation for annuloaortic ectasia (David operation)",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "CVC",
          "orgPfdrDeptNm": "심장혈관센터",
          "orgPfdrSid": "1000216",
          "orgPfdrStfNo": "00913",
          "orgPfdrStfNm": "헐크"
        }, {
          "pkId": "20200610ORA39100628181",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA39",
          "oprmNm": "Room39",
          "scrnSortSeq": "5",
          "ptNo": "10069943",
          "ctrDeptCd": "GS",
          "ctrDeptNm": "기타",
          "medDeptCd": "GS",
          "medDeptNm": "외과",
          "pfdrSid": "1002544",
          "pfdrStfNo": "65971",
          "pfdrStfNm": "타노스",
          "opStartDtm": "2020-06-10 10:05:00",
          "opOutDtm": "2020-06-10 11:33:00",
          "opVocId": "P00004259",
          "opNm": "Breast-conserving surgery ( right/ with sentinel lymph node biopsy )",
          "anstKndCd": "0",
          "anstKndNm": "전신",
          "emrgCsltTpCd": "N",
          "orgPfdrDeptCd": "GS",
          "orgPfdrDeptNm": "외과",
          "orgPfdrSid": "1002544",
          "orgPfdrStfNo": "65971",
          "orgPfdrStfNm": "타노스"
        }],

      },

      templateCode: `
<div class="chart-render-area" style="width: 100%;height:800px">
  <planit-chart-gantt
    :itemSource="chartData">
  </planit-chart-gantt>
</div>
      `,
      scriptCode: `
import PlanitChartGantt from './PlanitChartGantt.vue';

export default {
  name: 'Example',
  components: {
    PlanitChartGantt,
  },
  data() {
    return {
      chartData: {
        // [optional] y축 텍스트 설정. 값이 없을 경우, 데이터 통해 자동으로 구성
        yAxisTick: [
          '응급수술실', 'Room1', 'Room2', 'Room3', 'Room39', 'Room4', 'Room5', 'Room6',
          'Room10', 'Room11', 'Room12', 'Room13', 'Room14', 'Room15', 'Room16', 'Room7',
          'Room8', 'Room9', 'Room19', 'Room17', 'Room18', 'Room21', 'Room22', 'Room23',
          '통원수술회복실', 'Room24', 'Room25', 'Room26', 'Room27',
          'Room28',
          'Room29',
          'Room30',
          'Room31',
          'Room32',
          'Room33',
          'Room34',
          'Room35',
          'Room36',
          'Room37',
          'Room38',
          'Room20',
          '기타수술장',
          '기관지내시경실1',
          '기관지내시경실2',
        ],
        // x축 시간 표시 범위
        timeDomain: {
          start: new Date('2020-06-10T06:00:00'),
          end: new Date('2020-06-10T23:00:00'),
        },
        // y축 데이터 지정
        yAxisProperty: 'oprmNm',
        // [optional] y축 데이터 sort 기준 설정.
        yAxisSortCampare: 'scrnSortSeq',
        // x축 데이터 지정
        xAxisProperty: {
          startDate: 'opStartDtm',
          endDate: 'opOutDtm',
        },
        // [optional] x축 시간 표시 형식 지정. default: '%H:%M'. https://github.com/d3/d3-time-format/blob/v2.2.3/README.md#timeFormat 참조.
        xAxisTickFormat: '%H:%M',
        // [optional] 툴팁
        tooltip: "진료의: {{pfdrStfNm}} <br />진료과: {{ctrDeptNm}}",
        // [optional] 세로 시간선 표시
        timePointer: [
          '2020-06-10T08:00:00',
          '2020-06-10T12:00:00',
          '2020-06-10T18:00:00',
        ],
        // [optional] 세로 시간선 컬러 사용자 지정. default: '#ffc107'
        timePointerColor: '#ffc107',
        // [optional] 차트 여백 사용자 지정. default: { top: 40, right: 30, bottom: 40, left: 140 }
        chartPadding: {
          top: 40,
          right: 30,
          bottom: 40,
          left: 140,
        },
        // [optional] y축 브러시 줌 사용 여부 .default: false
        yAxisBrush: true,
        // 시간 표시 데이터
        series: [{
          "pkId": "20200610ORA1100623445",
          "opExptDt": "2020-06-10T00:00:00",
          "oprmNo": "ORA1",
          "oprmNm": "Room1",
          "scrnSortSeq": "10",
          "ctrDeptNm": "뇌신경센터",
          "medDeptCd": "NS",
          "medDeptNm": "신경외과",
          "pfdrStfNm": "홍길동",
          "opStartDtm": "2020-06-10 08:49:00",
          "opOutDtm": "2020-06-10 10:46:00",
          "orgPfdrDeptNm": "신경외과 (뇌신경센터)",
          "color": "#000000"
        }, ...],
      },
    }
  }
      `,
      cmOptionsJavascript: {
        tabSize: 4,
        mode: 'text/javascript',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true,
        highlightDifferences: true,
      },
      cmOptionsHtml: {
        tabSize: 4,
        mode: 'text/html',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true,
        highlightDifferences: true,
      }
    };
  },
};
</script>

<style type="text/css">
body,
html {
  height: 100%;
}

.chart-render-area {
  border: 1px solid #ddd;
  height: 700px;
  /* padding: 20px; */
  /* margin: 50px; */
}
.CodeMirror {
  border: 1px solid #eee;
  height: auto;
  font-size: 14px;
  font-weight: 400;
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  line-height: 1.5em;
}
.textbox {
  font-size: 16px;
  padding: 15px;
  font-weight: 700;
  background-color: #f5f5f5;
}

</style>
