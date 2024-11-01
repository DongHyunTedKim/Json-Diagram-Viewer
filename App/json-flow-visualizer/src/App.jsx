// src/App.jsx
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

import initialData from './data/flowData.json';
import { parseComponents, parseConnections } from './utils/dataUtils';
import { applyLayout } from './utils/layoutUtils';

// 커스텀 노드 컴포넌트 정의
const CustomNode = ({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position="top" /> {/* 노드의 상단에 연결 핸들 */}
      <div style={{ padding: '8px' }}>{data.label}</div> {/* 노드의 레이블 표시 */}
      <Handle type="source" position="bottom" /> {/* 노드의 하단에 연결 핸들 */}
    </div>
  );
};

// 노드 타입 정의
const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  // 노드와 엣지 상태 관리
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);

  // 최소화 상태 관리
  const [isMinimized, setIsMinimized] = React.useState(false);

  // 최소화 버튼 클릭 시 호출되는 함수
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // 컴포넌트가 처음 렌더링될 때 실행
  useEffect(() => {
    console.log('Initial Data:', initialData);
    const parsedNodes = parseComponents(initialData.components); // 컴포넌트 데이터 파싱
    const parsedEdges = parseConnections(initialData.connections); // 연결 데이터 파싱
    console.log('Parsed Nodes:', parsedNodes);
    console.log('Parsed Edges:', parsedEdges);
    const layoutedNodes = applyLayout(parsedNodes, parsedEdges); // 레이아웃 적용

    setNodes(layoutedNodes); // 노드 상태 업데이트
    setEdges(parsedEdges); // 엣지 상태 업데이트
  }, []);

  // 노드 변경 시 호출되는 콜백
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // 엣지 변경 시 호출되는 콜백
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 새로운 연결이 추가될 때 호출되는 콜백
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // 변경된 데이터를 저장하는 함수
  const onSave = () => {
    const data = {
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updatedFlowData.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <div style={{ flex: 1 }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
          <button onClick={onSave}>Save Changes</button> {/* 변경 사항 저장 버튼 */}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap /> {/* 미니맵 컴포넌트 */}
          <Controls /> {/* 컨트롤 컴포넌트 */}
          <Background color="#aaa" gap={16} /> {/* 배경 설정 */}
        </ReactFlow>
      </div>
      {!isMinimized && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '300px',
            height: '200px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden',
            resize: 'both', // 크기 조절 가능하도록 설정
            pointerEvents: 'auto',
            minWidth: `${window.innerWidth * 0.25}px`, // 최소 너비를 화면 너비의 25%로 설정
            maxWidth: `${window.innerWidth * 0.75}px`, // 최대 너비를 화면 너비의 75%로 설정
            minHeight: `${window.innerHeight * 0.25}px`, // 최소 높이를 화면 높이의 25%로 설정
            maxHeight: `${window.innerHeight * 0.75}px`, // 최대 높이를 화면 높이의 75%로 설정
          }}
        >
          <img
            src="/images/00001(노드에 번호매김).jpg"
            alt="Original Flowchart"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            원본 이미지 데이터
          </div>
          <button
            onClick={toggleMinimize}
            aria-label="Minimize"
            style={{
              position: 'absolute',
              top: '5px',
              left : '5px',
              zIndex: 10,
              padding: '4px 8px',
              backgroundColor: 'black',
              color: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Minimize
          </button>
        </div>
      )}
      {isMinimized && (
        <button
          onClick={toggleMinimize}
          aria-label="Expand"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            padding: '4px 8px',
            backgroundColor: 'black',
            color: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Expand
        </button>
      )}
    </div>
  );
}

export default App;