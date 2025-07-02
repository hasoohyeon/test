// 페이지 내비게이션
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        window.location.href = target;
    });
});

// 스크롤 시 네비게이션 효과
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.backgroundColor = '#fff';
        nav.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    } else {
        nav.style.backgroundColor = '#f5f5f5';
        nav.style.boxShadow = 'none';
    }
});

// 논문 카드 호버 효과
const papers = document.querySelectorAll('.paper');
papers.forEach(paper => {
    paper.addEventListener('mouseenter', () => {
        paper.style.transform = 'translateY(-5px)';
        paper.style.transition = 'transform 0.3s ease';
    });
    paper.addEventListener('mouseleave', () => {
        paper.style.transform = 'translateY(0)';
    });
});

// 인용문헌 필터링 기능
const citationFilters = {
    'all': '전체보기',
    'ai': 'AI/머신러닝',
    'robotics': '로봇공학',
    'energy': '재생에너지'
};

function filterCitations(filter) {
    const citations = document.querySelectorAll('.citation');
    citations.forEach(citation => {
        citation.style.display = 'block';
        if (filter !== 'all') {
            const category = citation.getAttribute('data-category');
            if (category !== filter) {
                citation.style.display = 'none';
            }
        }
    });
}

// 반응 섹션 토글
function toggleReaction(reactionId) {
    const reaction = document.getElementById(reactionId);
    const icon = reaction.querySelector('.toggle-icon');
    
    if (reaction.classList.contains('expanded')) {
        reaction.classList.remove('expanded');
        icon.textContent = '▼';
    } else {
        reaction.classList.add('expanded');
        icon.textContent = '▲';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 인용문헌 필터링 UI 추가
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    Object.entries(citationFilters).forEach(([key, value]) => {
        const button = document.createElement('button');
        button.className = 'filter-button';
        button.textContent = value;
        button.onclick = () => filterCitations(key);
        filterContainer.appendChild(button);
    });
    
    const citationsSection = document.querySelector('.citations');
    citationsSection.insertBefore(filterContainer, citationsSection.firstChild);
});
