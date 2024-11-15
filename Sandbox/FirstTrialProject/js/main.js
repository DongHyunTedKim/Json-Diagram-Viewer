// js/main.js

document.addEventListener("DOMContentLoaded", () => {
    // 외부 JSON 파일 로드
    fetch('data/data.json') // 파일명 변경 반영
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(jsonData => {
            // 파서 함수 호출
            const mermaidSyntax = jsonToMermaid(jsonData);

            // Mermaid 구문을 콘솔에 출력하여 디버깅
            console.log("Generated Mermaid Syntax:\n", mermaidSyntax);

            // Mermaid 다이어그램 삽입
            const mermaidElement = document.getElementById('mermaidDiagram');
            mermaidElement.textContent = mermaidSyntax;

            // Mermaid 구문 표시
            const mermaidSyntaxView = document.getElementById('mermaidSyntaxView');
            mermaidSyntaxView.textContent = mermaidSyntax;

            // JSON 데이터 표시
            const jsonDataView = document.getElementById('jsonDataView');
            jsonDataView.textContent = JSON.stringify(jsonData, null, 4);

            // Mermaid 초기화 설정
            mermaid.initialize({
                startOnLoad: true,
                flowchart: {
                    curve: 'linear', // 필요 시 다른 옵션으로 변경 가능
                    // direction: 'LR', // 이미 flowchart LR으로 설정했으므로 추가 필요 없음
                }
            });

            // Mermaid 렌더링
            mermaid.init(undefined, mermaidElement);
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
});
