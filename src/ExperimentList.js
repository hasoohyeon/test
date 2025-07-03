import React, { useState } from 'react';
import ChartView from './ChartView';

function ExperimentList({ experiments, onUpdate, onDelete }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editExp, setEditExp] = useState({});

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditExp(experiments[idx]);
  };

  const handleChange = (e) => {
    setEditExp({ ...editExp, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate(editIdx, editExp);
    setEditIdx(null);
  };

  return (
    <div className="exp-list">
      {experiments.map((exp, idx) => (
        <div key={idx} className="exp-card">
          {editIdx === idx ? (
            <div className="exp-edit-form">
              <input name="title" value={editExp.title} onChange={handleChange} />
              <textarea name="content" value={editExp.content} onChange={handleChange} />
              <textarea name="result" value={editExp.result} onChange={handleChange} />
              <textarea name="interpretation" value={editExp.interpretation} onChange={handleChange} />
              <textarea name="thoughts" value={editExp.thoughts} onChange={handleChange} />
              <textarea name="data" value={editExp.data} onChange={handleChange} />
              <button onClick={handleSave}>저장</button>
              <button onClick={() => setEditIdx(null)}>취소</button>
            </div>
          ) : (
            <div>
              <h2>{exp.title}</h2>
              <div><b>내용:</b> {exp.content}</div>
              <div><b>결과:</b> {exp.result}</div>
              <div><b>해석:</b> {exp.interpretation}</div>
              <div><b>느낀 점:</b> {exp.thoughts}</div>
              <ChartView dataStr={exp.data} />
              <button onClick={() => handleEdit(idx)}>수정</button>
              <button onClick={() => onDelete(idx)}>삭제</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ExperimentList;
