// src/App.jsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

import initialData from './data/flowData.json';
import { parseJSONtoReactFlowData, createEdge } from './utils/dataUtils';
import { applyLayout } from './utils/layoutUtils';

import FloatingEdge from './components/FloatingEdge';
import FloatingConnectionLine from './components/FloatingConnectionLine';

// JSON Viewer 컴포넌트
const JsonViewer = ({ data }) => (
  <pre style={{
    padding: '20px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    margin: 0,
    border: '1px solid #333',
  }}>
    {JSON.stringify(data, null, 2)}
  </pre>
);

const edgeTypes = {
  floating: FloatingEdge
};

function App() {

  //MARK: - 필수 기능
  // 노드와 엣지 상태 관리
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // 노드 변경 시 호출되는 콜백
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  // 새로운 연결이 추가될 때 호출되는 콜백
  const onConnect = useCallback(
    (params) => {
      // 중복 연결 체크
      const isDuplicate = edges.some(
        edge => edge.source === params.source && edge.target === params.target
      );

      if (isDuplicate) {
        console.warn('이미 존재하는 연결입니다.');
        return;
      }

      setEdges((eds) => addEdge(createEdge(params), eds));
      console.log('새로운 연결이 생성되었습니다:', params);
    },
    [setEdges, edges]
  );

  // 엣지 변경 시 호출되는 콜백
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      console.log('Edge changed:', changes);
    },
    [setEdges]
  );


  // Edge 삭제 핸들러 추가
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      setEdges((els) => els.map((el) =>
        el.id === oldEdge.id ? createEdge({ ...oldEdge, ...newConnection }) : el
      ));
    },
    [setEdges]
  );

  // Edge 드롭 시 삭제 핸들러
  const onEdgeUpdateEnd = useCallback(
    (_, edge) => {
      const { source, target } = edge;
      if (!source || !target) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges]
  );

  // Edge 삭제를 위한 키보드 이벤트 핸들러 수정
  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        console.log('Edge deleted');
      }
    },
    [setEdges]
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

  // Edge 업데이트 시작 핸들러 추가
  const onEdgeUpdateStart = useCallback((event, edge) => {
    // 엣지 업데이트 시작 시 필요한 작업을 수행할 수 있습니다
    // 예: 현재 엣지의 상태를 저장하거나, UI 피드백을 제공
    console.log('Edge update started:', edge);
  }, []);

  //
  //
  //
  //
  // MARK: 편의 기능
  // 최소화 상태 관리
  const [isMinimized, setIsMinimized] = useState(false);

  //
  //
  //
  // MARK: - 이미지뷰어
  // 이미지 뷰어 - 최소화 버튼 클릭 시 호출되는 함수
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // 이미지 뷰어 - 크기와 스크롤 위치 상태 추가
  const [imageViewerSize, setImageViewerSize] = useState(() => {
    const saved = localStorage.getItem('imageViewerSize');
    return saved ? JSON.parse(saved) : { width: 300, height: 200 };
  });

  const [imageViewerScroll, setImageViewerScroll] = useState(() => {
    const saved = localStorage.getItem('imageViewerScroll');
    return saved ? JSON.parse(saved) : { left: 0, top: 0 };
  });

  // 이미지 뷰어 - 크기와 스크롤 위치 저장 함수
  useEffect(() => {
    localStorage.setItem('imageViewerSize', JSON.stringify(imageViewerSize));
  }, [imageViewerSize]);

  useEffect(() => {
    localStorage.setItem('imageViewerScroll', JSON.stringify(imageViewerScroll));
  }, [imageViewerScroll]);

  // 이미지 뷰어 스크롤 핸들러
  const handleImageViewerScroll = useCallback((e) => {
    const { scrollLeft, scrollTop } = e.target;
    setImageViewerScroll({ left: scrollLeft, top: scrollTop });
  }, []);

  //
  //
  //
  // MARK: - JSONViewer
  // JSON Viewer 상태 관리
  const [showJson, setShowJson] = useState(false);
  const [jsonViewData, setJsonViewData] = useState({
    original: initialData,
    parsed: { nodes: [], edges: [] }
  });

  // JSON Viewer 크기와 스크롤 위치 상태 추가
  const [jsonViewerSize, setJsonViewerSize] = useState(() => {
    const saved = localStorage.getItem('jsonViewerSize');
    return saved ? JSON.parse(saved) : { width: 600, height: 500 };
  });

  const [jsonViewerScroll, setJsonViewerScroll] = useState(() => {
    const saved = localStorage.getItem('jsonViewerScroll');
    return saved ? JSON.parse(saved) : { left: 0, top: 0 };
  });

  // JsonViewer 크기와 스크롤 위치 저장 함수
  useEffect(() => {
    localStorage.setItem('jsonViewerSize', JSON.stringify(jsonViewerSize));
  }, [jsonViewerSize]);

  useEffect(() => {
    localStorage.setItem('jsonViewerScroll', JSON.stringify(jsonViewerScroll));
  }, [jsonViewerScroll]);

  // JSON Viewer 스크롤 핸들러
  const handleJsonViewerScroll = useCallback((e) => {
    const { scrollLeft, scrollTop } = e.target;
    setJsonViewerScroll({ left: scrollLeft, top: scrollTop });
  }, []);


  //  
  //
  //
  // MARK: - 레이아웃
  // 컴포넌트가 처음 렌더링될 때 실행
  useEffect(() => {
    const { parsedNodes, parsedEdges } = parseJSONtoReactFlowData(JSON.stringify(initialData));
    const layoutedNodes = applyLayout(parsedNodes, parsedEdges); // 레이아웃 적용

    console.log('Initial Data:', initialData);
    console.log('Parsed Nodes:', parsedNodes);
    console.log('Parsed Edges:', parsedEdges);

    setNodes(layoutedNodes); // 노드 상태 업데트
    setEdges(parsedEdges); // 엣지 상태 업데이트
    setJsonViewData(prev => ({ // JSON Viewer 데이터 업데이트
      ...prev,
      parsed: { nodes: layoutedNodes, edges: parsedEdges }
    }));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onKeyDown={onKeyDown}
          fitView
          edgeTypes={edgeTypes}
          connectionLineComponent={FloatingConnectionLine}
          selectNodesOnDrag={false}
          elementsSelectable={true}
          edgesFocusable={true}
          edgesUpdatable={true}
          nodesDraggable={true}
          nodesConnectable={true}
          snapToGrid={true}
          snapGrid={[15, 15]}
          connectionMode="loose"
          defaultEdgeOptions={{
            type: 'floating',
            animated: true
          }}
          className="react-flow-graph"
          elevateEdgesOnSelect={true}
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </ReactFlowProvider>

      <div style={{ flex: 1 }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000 
        }}>
          <button 
            onClick={onSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#000',
              color: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Save Changes
          </button>
        </div>
        {!isMinimized && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: `${imageViewerSize.width}px`,
              height: `${imageViewerSize.height}px`,
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
            onScroll={handleImageViewerScroll}
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
              Original Image
            </div>
            <button
              onClick={toggleMinimize}
              aria-label="HideImage"
              style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
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
              Hide Image
            </button>
            <div
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                cursor: 'se-resize',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                zIndex: 10
              }}
              onMouseDown={(e) => {
                const container = e.currentTarget.parentElement;
                const startX = e.pageX;
                const startY = e.pageY;
                const startWidth = container.offsetWidth;
                const startHeight = container.offsetHeight;

                const handleMouseMove = (moveEvent) => {
                  const newWidth = startWidth + (moveEvent.pageX - startX);
                  const newHeight = startHeight + (moveEvent.pageY - startY);

                  const limitedWidth = Math.min(
                    Math.max(200, newWidth),
                    window.innerWidth * 0.8
                  );
                  const limitedHeight = Math.min(
                    Math.max(150, newHeight),
                    window.innerHeight * 0.8
                  );

                  setImageViewerSize({ width: limitedWidth, height: limitedHeight });
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              ↗️
            </div>
          </div>
        )}
        {isMinimized && (
          <button
            onClick={toggleMinimize}
            aria-label="ShowImage"
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
            Show Image
          </button>
        )}
        {/* JSON Viewer 버튼 */}
        <button
          onClick={() => setShowJson(!showJson)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
          }}
        >
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </button>

        {/* JSON Viewer 패널 */}
        {showJson && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            left: '20px',
            width: `${jsonViewerSize.width}px`,
            height: `${jsonViewerSize.height}px`,
            backgroundColor: '#252526',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            borderRadius: '4px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #333',
            overflow: 'hidden',
            minWidth: '400px',
            minHeight: '300px',
            maxWidth: `${window.innerWidth * 0.8}px`,
            maxHeight: `${window.innerHeight * 0.8}px`,
          }}>
            <div style={{
              padding: '10px',
              borderBottom: '1px solid #333',
              backgroundColor: '#333333',
              position: 'sticky',
              top: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#fff' }}>JSON Structure</h3>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'nesw-resize',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  const container = e.currentTarget.parentElement.parentElement;
                  const startX = e.pageX;
                  const startY = e.pageY;
                  const startWidth = container.offsetWidth;
                  const startHeight = container.offsetHeight;

                  const handleMouseMove = (moveEvent) => {
                    const newWidth = startWidth + (moveEvent.pageX - startX);
                    const newHeight = startHeight - (moveEvent.pageY - startY);

                    const limitedWidth = Math.min(
                      Math.max(400, newWidth),
                      window.innerWidth * 0.8
                    );
                    const limitedHeight = Math.min(
                      Math.max(300, newHeight),
                      window.innerHeight * 0.8
                    );

                    setJsonViewerSize({ width: limitedWidth, height: limitedHeight });
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                ↗️
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden'
              }}
              onScroll={handleJsonViewerScroll}
            >
              {/* Original JSON 패널 */}
              <div style={{
                flex: 1,
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <h4 style={{
                  margin: '10px',
                  color: '#d4d4d4',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#252526',
                  padding: '5px'
                }}>Original JSON:</h4>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <JsonViewer data={jsonViewData.original} />
                </div>
              </div>

              {/* Parsed React Flow 패널 */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <h4 style={{
                  margin: '10px',
                  color: '#d4d4d4',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#252526',
                  padding: '5px'
                }}>Parsed React Flow:</h4>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <JsonViewer data={jsonViewData.parsed} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
