let researchSections = [];

// 탐구 섹션 템플릿
function createResearchSection(index) {
    return `
        <div class="card experiment-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">실험 ${index + 1}</h5>
                <button class="btn btn-danger btn-sm" onclick="removeResearchSection(${index})">
                    삭제
                </button>
            </div>
            <div class="card-body">
                <div class="data-input">
                    <label class="form-label">실험 내용</label>
                    <textarea class="form-control" rows="3" 
                        oninput="updateResearchSection(${index}, 'content', this.value)"
                        placeholder="실험 절차를 상세히 기록하세요"></textarea>
                </div>
                <div class="data-input">
                    <label class="form-label">실험 결과</label>
                    <textarea class="form-control" rows="3" 
                        oninput="updateResearchSection(${index}, 'result', this.value)"
                        placeholder="실험 결과를 기록하세요"></textarea>
                </div>
                <div class="data-input">
                    <label class="form-label">결과 해석</label>
                    <textarea class="form-control" rows="3" 
                        oninput="updateResearchSection(${index}, 'interpretation', this.value)"
                        placeholder="실험 결과를 해석하세요"></textarea>
                </div>
                <div class="data-input">
                    <label class="form-label">느낀 점</label>
                    <textarea class="form-control" rows="3" 
                        oninput="updateResearchSection(${index}, 'reflection', this.value)"
                        placeholder="실험을 통해 얻은 교훈을 기록하세요"></textarea>
                </div>
                <div class="data-input">
                    <label class="form-label">데이터 입력</label>
                    <textarea class="form-control" rows="3" 
                        oninput="updateResearchSection(${index}, 'data', this.value)"
                        placeholder="{
    \"x\": [\"데이터1\", \"데이터2\", \"데이터3\"],
    \"y\": [값1, 값2, 값3]
}"></textarea>
                </div>
                <div class="chart-container" id="chartContainer${index}">
                    <!-- 그래프가 여기에 표시됨 -->
                </div>
            </div>
        </div>
    `;
}

// 탐구 섹션 추가
function addResearchSection() {
    researchSections.push({
        content: '',
        result: '',
        interpretation: '',
        reflection: '',
        data: ''
    });
    updateSections();
}

// 탐구 섹션 삭제
function removeResearchSection(index) {
    if (researchSections.length > 1) {
        researchSections.splice(index, 1);
        updateSections();
    }
}

// 탐구 섹션 내용 업데이트
function updateResearchSection(index, field, value) {
    researchSections[index][field] = value;
    if (field === 'data') {
        updateChart(index);
    }
}

// 섹션 UI 업데이트
function updateSections() {
    const container = document.getElementById('experiments');
    container.innerHTML = researchSections.map((_, i) => createResearchSection(i)).join('');
}

// 그래프 업데이트
function updateChart(index) {
    const container = document.getElementById(`chartContainer${index}`);
    const ctx = container.querySelector('canvas') || document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(ctx);

    try {
        const data = JSON.parse(researchSections[index].data);
        if (Array.isArray(data.x) && Array.isArray(data.y)) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.x,
                    datasets: [{
                        label: '실험 결과',
                        data: data.y,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.log('Invalid data format');
    }
}

// 데이터 저장
function saveData() {
    const data = JSON.stringify(researchSections);
    localStorage.setItem('researchData', data);
    alert('데이터가 저장되었습니다!');
}

// 데이터 불러오기
function loadData() {
    const savedData = localStorage.getItem('researchData');
    if (savedData) {
        researchSections = JSON.parse(savedData);
        updateSections();
        alert('데이터가 불러와졌습니다!');
    } else {
        alert('저장된 데이터가 없습니다.');
    }
}

// 초기 탐구 섹션 하나 추가
addResearchSection();
