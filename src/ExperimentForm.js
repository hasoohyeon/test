import React, { useState } from 'react';

const emptyExp = {
  title: '',
  content: '',
  result: '',
  interpretation: '',
  thoughts: '',
  data: '',
};

function ExperimentForm({ onAdd }) {
  const [exp, setExp] = useState(emptyExp);

  const handleChange = (e) => {
    setExp({ ...exp, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exp.title) return;
    onAdd(exp);
    setExp(emptyExp);
  };

  return (
    <form className="exp-form" onSubmit={handleSubmit}>
      <input
        name="title"
        value={exp.title}
        onChange={handleChange}
        placeholder="실험 제목"
        required
      />
      <textarea
        name="content"
        value={exp.content}
        onChange={handleChange}
        placeholder="실험 내용"
      />
      <textarea
        name="result"
        value={exp.result}
        onChange={handleChange}
        placeholder="실험 결과"
      />
      <textarea
        name="interpretation"
        value={exp.interpretation}
        onChange={handleChange}
        placeholder="해석"
      />
      <textarea
        name="thoughts"
        value={exp.thoughts}
        onChange={handleChange}
        placeholder="느낀 점"
      />
      <textarea
        name="data"
        value={exp.data}
        onChange={handleChange}
        placeholder="그래프 데이터 (예: 1,2,3; 4,5,6)"
      />
      <button type="submit">기록 추가</button>
    </form>
  );
}

export default ExperimentForm;
