import React from 'react';

const HelpViewer = ({ showHelp, setShowHelp }) => {
  return (
    <div style={{
      position: 'absolute',
      right: '45px',
      bottom: '200px',
      zIndex: 5
    }}>
      <button
        onClick={() => setShowHelp(!showHelp)}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <span role="img" aria-label="help">❓</span>
        사용 방법
      </button>

      {showHelp && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '0px',
            width: '400px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '15px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '13px',
            lineHeight: '1.4'
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>사용 방법</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>1. 파일 불러오기:</strong>
              <ul>
                <li>'폴더 선택' 버튼을 클릭하여 작업할 이미지와 JSON 파일이 있는 폴더를 선택합니다.</li>
                <li>이미지(.jpg, .png 등)와 동일한 이름의 JSON 파일(.json)이 필요합니다.</li>
              </ul>
            </li>

            <li style={{ marginBottom: '12px' }}>
              <strong>2. 화면 구성:</strong>
              <ul>
                <li>좌측 상단: 이미지 뷰어 (Hide/Show Image로 토글 가능)</li>
                <li>우측: 폴더/파일 목록</li>
                <li>중앙: 플로우 차트 작업 영역</li>
                <li>좌측 하단: JSON 데이터 뷰어 (Show/Hide JSON으로 토글 가능)</li>
              </ul>
            </li>

            <li style={{ marginBottom: '12px' }}>
              <strong>3. 화면 조작:</strong>
              <ul>
                <li>화면 이동: 마우스 우클릭 후 드래그</li>
                <li>화면 확대/축소: 마우스 휠 스크롤</li>
                <li>전체 화면 맞추기: 좌측하단 컨트롤 패널의 맞춤 버튼 클릭</li>
              </ul>
            </li>

            <li style={{ marginBottom: '12px' }}>
              <strong>4. 노드 작업:</strong>
              <ul>
                <li>노드 선택: 클릭</li>
                <li>다중 선택: Shift클릭 or 드래그로 영역 선택</li>
                <li>노드 이동: 드래그 앤 드롭</li>
                <li>노드 삭제: 선택 후 Delete키</li>
                <li>텍스트 수정: 노드 텍스트 더블 클릭</li>
              </ul>
            </li>

            <li style={{ marginBottom: '12px' }}>
              <strong>5. 엣지(연결선) 작업:</strong>
              <ul>
                <li>엣지 생성: 노드의 핸들을 다른 노드로 드래그</li>
                <li>엣지 선택: 클릭 (source 노드가 선택된 상태에서만 가능)</li>
                <li>엣지 삭제: 선택 후 Delete 키</li>
                <li>다중 엣지 삭제: Shift + Delete (영역 선택된 엣지만 삭제)</li>
                <li>텍스트 수정: 엣지 텍스트 더블 클릭</li>
              </ul>
            </li>

            <li style={{ marginBottom: '12px' }}>
              <strong>6. 저장:</strong>
              <ul>
                <li>우측 상단의 'Save Changes' 버튼으로 현재 작업 내용을 JSON 파일로 저장</li>
              </ul>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HelpViewer; 