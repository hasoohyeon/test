import React, { useState } from 'react';
import ExperimentForm from './ExperimentForm';
import ExperimentList from './ExperimentList';
import './styles.css';

const LOCAL_STORAGE_KEY = 'science_notes';

function ExperimentNote() {
  const [experiments, setExperiments] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const addExperiment = (exp) => {
    setExperiments((prev) => {
      const updated = [...prev, exp];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateExperiment = (idx, newExp) => {
    setExperiments((prev) => {
      const updated = prev.map((e, i) => (i === idx ? newExp : e));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteExperiment = (idx) => {
    setExperiments((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="note-container">
      <h1 className="note-title">과학 탐구 노트</h1>
      <ExperimentForm onAdd={addExperiment} />
      <ExperimentList
        experiments={experiments}
        onUpdate={updateExperiment}
        onDelete={deleteExperiment}
      />
    </div>
  );
}

export default ExperimentNote;
