import React from 'react';
import ExperimentNote from './ExperimentNote';
import './styles.css';

function App() {
  return <ExperimentNote />;
}

  const [experiments, setExperiments] = useState([{ id: Date.now(), content: '' }]);
  const [selectedExperiment, setSelectedExperiment] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: '실험 결과',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  });

  const addExperiment = () => {
    setExperiments([...experiments, { id: Date.now(), content: '' }]);
  };

  const removeExperiment = (index) => {
    if (experiments.length > 1) {
      const newExperiments = [...experiments];
      newExperiments.splice(index, 1);
      setExperiments(newExperiments);
      if (selectedExperiment >= index) {
        setSelectedExperiment(Math.max(0, selectedExperiment - 1));
      }
    }
  };

  const updateExperiment = (index, field, value) => {
    const newExperiments = [...experiments];
    newExperiments[index] = { ...newExperiments[index], [field]: value };
    setExperiments(newExperiments);
    updateChart(index);
  };

  const updateChart = (index) => {
    const experiment = experiments[index];
    // 예시: 실험 데이터에서 자동으로 그래프 생성
    if (experiment.content) {
      try {
        const data = JSON.parse(experiment.content);
        if (Array.isArray(data.x) && Array.isArray(data.y)) {
          setChartData({
            labels: data.x,
            datasets: [{
              label: '실험 결과',
              data: data.y,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            }],
          });
        }
      } catch (e) {
        console.log('Invalid data format');
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        과학 탐구 노트
      </Typography>

      <Grid container spacing={3}>
        {/* 실험 목록 */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                실험 목록
              </Typography>
              {experiments.map((exp, index) => (
                <Box
                  key={exp.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedExperiment(index)}
                >
                  <Typography variant="body1">
                    {exp.content ? '실험 내용이 있습니다' : '새로운 실험'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExperiment(index);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addExperiment}
                fullWidth
              >
                새로운 실험 추가
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 실험 내용 작성 */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                실험 {selectedExperiment + 1}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>실험 제목</InputLabel>
                <Select
                  value={experiments[selectedExperiment]?.title || ''}
                  onChange={(e) => updateExperiment(selectedExperiment, 'title', e.target.value)}
                >
                  <MenuItem value="">실험 제목을 선택하세요</MenuItem>
                  <MenuItem value="물리">물리</MenuItem>
                  <MenuItem value="화학">화학</MenuItem>
                  <MenuItem value="생물">생물</MenuItem>
                  <MenuItem value="지구과학">지구과학</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="실험 내용"
                value={experiments[selectedExperiment]?.content || ''}
                onChange={(e) => updateExperiment(selectedExperiment, 'content', e.target.value)}
                sx={{ mb: 2 }}
                helperText="실험 절차, 결과, 해석 등을 기록하세요"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="느낀 점"
                value={experiments[selectedExperiment]?.reflection || ''}
                onChange={(e) => updateExperiment(selectedExperiment, 'reflection', e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* 그래프 표시 */}
              <Box sx={{ height: 400 }}>
                <Line data={chartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
