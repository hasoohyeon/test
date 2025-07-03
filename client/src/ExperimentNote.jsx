import React, { useState, useEffect, useRef } from "react";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";

// textarea 자동 높이 조절 커스텀 컴포넌트
function AutoResizeTextarea({ value, onChange, placeholder, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      style={{ overflow: 'hidden', resize: 'none' }}
      {...props}
    />
  );
}


const chartTypeOptions = [
  { value: "bar", label: "막대그래프" },
  { value: "line", label: "선그래프" },
  { value: "pie", label: "원그래프" },
  { value: "scatter", label: "분포도" },
];

const defaultExperiment = () => ({
  id: Date.now() + Math.random(),
  date: "",
  author: "",
  title: "",
  content: "",
  result: "",
  interpretation: "",
  feeling: "",
  data: "", // CSV or comma-separated numbers for graph
  chartType: "bar",
  pointLabels: [], // 각 점의 이름(수정 가능)
  image: "", // 사진 base64
});

// '이름:값, 이름:값' 또는 '값, 값' 모두 지원
function parseDataAndLabels(dataStr) {
  const pairs = dataStr.split(/,|\n|\r/).map(s => s.trim()).filter(Boolean);
  let values = [], labels = [];
  pairs.forEach((item, idx) => {
    const [label, value] = item.split(":");
    if (value !== undefined) {
      labels.push(label.trim() || `점${idx+1}`);
      values.push(parseFloat(value));
    } else {
      values.push(parseFloat(label));
      labels.push(`점${idx+1}`);
    }
  });
  // 필터링
  const filtered = values.map((v, i) => !isNaN(v) ? { label: labels[i], value: v } : null).filter(Boolean);
  return {
    values: filtered.map(f => f.value),
    labels: filtered.map(f => f.label),
  };
}

const ExperimentCard = ({ exp, onChange, onDelete, onChartTypeChange }) => {
  // 사진 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...exp, image: ev.target.result });
    };
    reader.readAsDataURL(file);
  };
  const handleImageRemove = () => {
    onChange({ ...exp, image: "" });
  };

  // 점 라벨 인라인 수정
  const [editingIdx, setEditingIdx] = useState(-1);
  const [labelEdit, setLabelEdit] = useState("");
  const { values: dataArr, labels: parsedLabels } = parseDataAndLabels(exp.data);

  // pointLabels 동기화
  useEffect(() => {
    if (
      !exp.pointLabels ||
      exp.pointLabels.length !== dataArr.length ||
      exp.pointLabels.some((l, i) => l !== parsedLabels[i])
    ) {
      onChange({ ...exp, pointLabels: parsedLabels });
    }
    // eslint-disable-next-line
  }, [exp.data]);

  // 라벨 클릭 시 수정
  const handleLabelClick = (idx) => {
    setEditingIdx(idx);
    setLabelEdit(exp.pointLabels[idx] || "");
  };
  const handleLabelEditChange = (e) => setLabelEdit(e.target.value);
  const handleLabelEditBlur = (idx) => {
    const newLabels = exp.pointLabels.slice();
    newLabels[idx] = labelEdit.trim() || `점${idx + 1}`;
    setEditingIdx(-1);
    setLabelEdit("");
    onChange({ ...exp, pointLabels: newLabels });
  };
  const handleLabelEditKey = (e, idx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelEditBlur(idx);
    }
  };

  // 차트 데이터에 pointLabels 적용
  const customLabels = exp.pointLabels && exp.pointLabels.length === dataArr.length ? exp.pointLabels : parsedLabels;

  const chartData = {
    labels: customLabels,
    datasets: [
      {
        label: "실험 데이터",
        data: dataArr,
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,99,132,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(153,102,255,0.6)",
          "rgba(255,159,64,0.6)",
        ],
        borderColor: "#1976d2",
        pointBackgroundColor: "#1976d2",
      },
    ],
  };
  const scatterData = {
    datasets: [
      {
        label: "실험 데이터",
        data: dataArr.map((v, i) => ({ x: customLabels[i] || i + 1, y: v })),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  // 차트 옵션: x축 라벨 커스텀 렌더링 및 클릭 핸들러
  const chartOptions = {
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    onClick: (evt, elements, chart) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      handleLabelClick(idx);
    },
    scales: {
      x: {
        ticks: {
          callback: function (val, idx) {
            if (editingIdx === idx) return "";
            return customLabels[idx];
          },
        },
      },
    },
  };

  let ChartComponent = null;
  if (exp.chartType === "bar") ChartComponent = <Bar data={chartData} options={chartOptions} />;
  else if (exp.chartType === "line") ChartComponent = <Line data={chartData} options={chartOptions} />;
  else if (exp.chartType === "pie") ChartComponent = (
    <div style={{ width: 220, height: 220, margin: '0 auto' }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
  else if (exp.chartType === "scatter") ChartComponent = <Scatter data={scatterData} options={chartOptions} />;

  const [showChart, setShowChart] = useState(false);

  return (
    <div className="experiment-card">
      {/* 사진 업로드 및 미리보기 */}
      <div style={{ marginBottom: 8 }}>
        {exp.image ? (
          <div style={{ marginBottom: 6 }}>
            <img src={exp.image} alt="첨부사진" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 8, border: '1px solid #b3c2d1' }} />
            <button onClick={handleImageRemove} style={{ marginLeft: 8, background: '#ff5c5c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>삭제</button>
          </div>
        ) : (
          <label style={{ display: 'inline-block', cursor: 'pointer', color: '#1976d2', fontWeight: 500 }}>
            📷 사진 첨부
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </label>
        )}
      </div>

      <input
        className="title-input"
        placeholder="실험 제목"
        value={exp.title}
        onChange={(e) => onChange({ ...exp, title: e.target.value })}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="date"
          value={exp.date || ""}
          onChange={e => onChange({ ...exp, date: e.target.value })}
          placeholder="날짜"
          style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid #b3c2d1", background: "#f8faff", color: "#174786", fontWeight: 400, minWidth: 120 }}
        />
        <input
          type="text"
          value={exp.author || ""}
          onChange={e => onChange({ ...exp, author: e.target.value })}
          placeholder="실험자 이름"
          style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid #b3c2d1", background: "#f8faff", color: "#174786", fontWeight: 400, minWidth: 100 }}
        />
      </div>
      <select
        value={exp.chartType}
        onChange={(e) => onChartTypeChange(exp.id, e.target.value)}
        style={{ marginBottom: 8, padding: "6px 10px", borderRadius: 6, border: "1.5px solid #1976d2", background: "#eaf3ff", color: "#174786", fontWeight: 600 }}
      >
        {chartTypeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <AutoResizeTextarea
        placeholder="실험 내용"
        value={exp.content}
        onChange={(e) => onChange({ ...exp, content: e.target.value })}
      />
      <AutoResizeTextarea
        placeholder="결과"
        value={exp.result}
        onChange={(e) => onChange({ ...exp, result: e.target.value })}
      />
      <AutoResizeTextarea
        placeholder="해석"
        value={exp.interpretation}
        onChange={(e) => onChange({ ...exp, interpretation: e.target.value })}
      />
      <AutoResizeTextarea
        placeholder="느낀 점"
        value={exp.feeling}
        onChange={(e) => onChange({ ...exp, feeling: e.target.value })}
      />
      <input
        placeholder="그래프 데이터 (예: 토마토:5, 오이:7, 당근:3 또는 5,7,3)"
        value={exp.data}
        onChange={(e) => onChange({ ...exp, data: e.target.value })}
      />
      <button onClick={() => setShowChart((v) => !v)}>
        {showChart ? "그래프 숨기기" : "그래프 보기"}
      </button>
      {showChart && dataArr.length > 0 && (
        <div className="chart-container">
          {ChartComponent}
          {/* 점 라벨 직접 수정 UI */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {customLabels.map((label, idx) => (
              <span key={idx} style={{ minWidth: 40 }}>
                {editingIdx === idx ? (
                  <input
                    autoFocus
                    value={labelEdit}
                    onChange={handleLabelEditChange}
                    onBlur={() => handleLabelEditBlur(idx)}
                    onKeyDown={e => handleLabelEditKey(e, idx)}
                    style={{ width: 60, padding: '2px 4px', borderRadius: 4, border: '1.5px solid #1976d2', fontSize: 13 }}
                  />
                ) : (
                  <span
                    onClick={() => handleLabelClick(idx)}
                    style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 4, background: '#f5f8ff', border: '1px solid #b3c2d1', marginRight: 2, fontSize: 13 }}
                    title="클릭해서 이름 수정"
                  >
                    {label}
                  </span>
                )}
              </span>
            ))}
            <span style={{ color: '#888', fontSize: 12 }}> (이름을 클릭하면 수정 가능)</span>
          </div>
        </div>
      )}
      <button className="delete-btn" onClick={() => onDelete(exp.id)}>
        삭제
      </button>
    </div>
  );
};

// 페이지 단위 노트 관리
const LOCAL_KEY = "experiment_notes_pages_v1";

export default function ExperimentNote() {
  const [pages, setPages] = useState([]); // [{ id, experiments }]
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  // 페이지/노트 로딩
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPages(parsed.pages || []);
      setCurrentPageIdx(parsed.currentPageIdx || 0);
    } else {
      setPages([{ id: Date.now(), experiments: [] }]);
      setCurrentPageIdx(0);
    }
  }, []);

  // 저장
  useEffect(() => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ pages, currentPageIdx })
    );
  }, [pages, currentPageIdx]);

  // 페이지 이동
  const goPage = (idx) => {
    setCurrentPageIdx(idx);
  };
  const addPage = () => {
    setPages([...pages, { id: Date.now() + Math.random(), experiments: [] }]);
    setCurrentPageIdx(pages.length);
  };
  const deletePage = (idx) => {
    if (pages.length === 1) return; // 최소 1장 보장
    const newPages = pages.filter((_, i) => i !== idx);
    setPages(newPages);
    setCurrentPageIdx(Math.max(0, idx - 1));
  };

  // 실험 추가/삭제/수정 (현재 페이지 기준)
  const addExperiment = () => {
    setPages(
      pages.map((p, i) =>
        i === currentPageIdx
          ? { ...p, experiments: [defaultExperiment(), ...p.experiments] }
          : p
      )
    );
  };
  const updateExperiment = (exp) => {
    setPages(
      pages.map((p, i) =>
        i === currentPageIdx
          ? {
              ...p,
              experiments: p.experiments.map((e) => (e.id === exp.id ? exp : e)),
            }
          : p
      )
    );
  };
  const deleteExperiment = (id) => {
    setPages(
      pages.map((p, i) =>
        i === currentPageIdx
          ? { ...p, experiments: p.experiments.filter((e) => e.id !== id) }
          : p
      )
    );
  };
  const changeChartType = (id, chartType) => {
    setPages(
      pages.map((p, i) =>
        i === currentPageIdx
          ? {
              ...p,
              experiments: p.experiments.map((e) =>
                e.id === id ? { ...e, chartType } : e
              ),
            }
          : p
      )
    );
  };

  const currentPage = pages[currentPageIdx] || { experiments: [] };

  return (
    <div className="experiment-note-root">
      <h1>과학 탐구 노트</h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <button onClick={() => goPage(Math.max(0, currentPageIdx - 1))} disabled={currentPageIdx === 0} style={{ marginRight: 8 }}>
            ◀ 이전 장
          </button>
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goPage(idx)}
              style={{
                marginRight: 4,
                fontWeight: idx === currentPageIdx ? "bold" : "normal",
                background: idx === currentPageIdx ? "#1976d2" : "#e3f0ff",
                color: idx === currentPageIdx ? "#fff" : "#1976d2",
                border: idx === currentPageIdx ? "2px solid #1976d2" : "1.5px solid #b3c2d1",
              }}
            >
              {idx + 1}장
            </button>
          ))}
          <button onClick={() => goPage(Math.min(pages.length - 1, currentPageIdx + 1))} disabled={currentPageIdx === pages.length - 1} style={{ marginLeft: 8 }}>
            다음 장 ▶
          </button>
        </div>
        <div>
          <button className="add-btn" onClick={addPage} style={{ marginRight: 8 }}>
            + 새 노트 장 추가
          </button>
          <button className="delete-btn" onClick={() => deletePage(currentPageIdx)} disabled={pages.length === 1}>
            현재 장 삭제
          </button>
        </div>
      </div>
      <button className="add-btn" onClick={addExperiment}>
        새 실험 추가
      </button>
      <div className="experiment-list">
        {currentPage.experiments.map((exp) => (
          <ExperimentCard
            key={exp.id}
            exp={exp}
            onChange={updateExperiment}
            onDelete={deleteExperiment}
            onChartTypeChange={changeChartType}
          />
        ))}
      </div>
    </div>
  );
}
