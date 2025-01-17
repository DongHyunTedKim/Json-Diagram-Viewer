// src/App.jsx
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
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
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

import { parseJSONtoReactFlowData, createEdge, convertReactFlowToJSON } from './utils/dataUtils';
import { applyLayout } from './utils/layoutUtils';
import FolderViewer from './components/FolderViewer';
import ToolboxViewer from './components/ToolboxViewer';

import initialData from './data/0157.json';

import CustomNode from './components/CustomNode';
const nodeTypes = {
  custom: CustomNode
};

import SimpleFloatingEdge from './components/SimpleFloatingEdge';
import { FLOW_CONSTANTS } from './constants/flowConstants';

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

// 사용 방법 뷰어
import HelpViewer from './components/HelpViewer';

function App() {

  //MARK: - 필수 기능 

  // metadata, 노드와 엣지 상태 관리
  const [metadata, setMetadata] = useState({
    file_name: "",
    summary: ""
  });
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // edgeTypes를 useMemo로 메모이제이션
  const edgeTypes = useMemo(() => ({
    floating: (props) => <SimpleFloatingEdge {...props} setEdges={setEdges} />
  }), [setEdges]);

  // 노드 변경 시 호출되는 콜백
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );


  const onNodeLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              onNodeLabelChange
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

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

  // Edge 삭제를 위한 키보드 이벤트 핸들러 수정
  const onKeyDown = useCallback(
    (event) => {
      // Delete 키와 Backspace 키 모두 처리
      if (event.key === 'Delete') {
        event.preventDefault(); // 기본 동작 방지



        setEdges((eds) => {
          const selectedEdges = eds.filter((edge) => edge.selected);
          if (selectedEdges.length === 0) {
            console.warn('삭제할 엣지가 선택되지 않았습니다.');
            return eds;
          }
          console.log('삭제할 엣지:', selectedEdges);
          return eds.filter((edge) => !edge.selected);
        });
        console.log('Edge deleted');
      }
    },
    [setEdges]
  );

  // 변경된 데이터를 저장하는 함수
  const onSave = () => {
    const jsonData = convertReactFlowToJSON(metadata, nodes, edges);
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    
    // 파일 이름 동적 생성
    const fileName = metadata.file_name
        ? metadata.file_name.replace(/\.(jpg|jpeg|png|gif)$/i, '.json')  // 이미지 확장자를 json으로 변경
        : 'flowData.json';  // metadata.file_name이 없을 경우 기본값
        
    a.download = fileName;
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
  //MARK: 폴더 뷰어
  // 이미지 경로 상태 수정
  const [currentImage, setCurrentImage] = useState({
    path: '/images/0157.jpg',  // 기본 이미지 경로
    name: 'sample.jpg'
  });

  // ReactFlow 초기화 함수
  const initializeFlowData = (jsonData) => {
    try {
      setNodes([]);
      setEdges([]);

      setJsonViewData({
        original: jsonData,
        parsed: { nodes: [], edges: [] }
      });

      setTimeout(() => {
        const { parsedNodes, parsedEdges, metadata } = parseJSONtoReactFlowData(JSON.stringify(jsonData), onNodeLabelChange);
        const layoutedNodes = applyLayout(parsedNodes, parsedEdges);

        setNodes(layoutedNodes);
        setEdges(parsedEdges);
        setMetadata(metadata); // metadata 상태 업데이트
        setJsonViewData(prev => ({
          ...prev,
          parsed: {
            metadata,
            nodes: layoutedNodes,
            edges: parsedEdges
          }
        }));
      }, 100);

    } catch (error) {
      console.error("Flow 초기화 에러:", error);
    }
  };

  // handleFilesSelected 함수 수정
  const handleFilesSelected = (imageFiles, jsonFiles) => {
    setSelectedFiles({
      images: imageFiles,
      jsons: jsonFiles
    });

    jsonFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          initializeFlowData(jsonData);
        } catch (error) {
          console.error('JSON 파싱 에러:', error);
        }
      };
      reader.readAsText(file);
    });
  };

  // 최소화 상태 관리
  const [isMinimized, setIsMinimized] = useState(false);
  //
  // MARK: - 이미지뷰어
  // 이미지 뷰어 - 최소화 버튼 클릭 시 호출되는 함수
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // 이미지 뷰어 - 크기와 스크롤 위치 상태 추가
  const [imageViewerSize, setImageViewerSize] = useState(() => {
    //const saved = localStorage.getItem('imageViewerSize');
    //console.log('imageViewerSize', saved);
    return { width: 300, height: 200 };
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
  // 컴넌트가 처음 렌더링될 때 실행
  useEffect(() => {
    const { parsedNodes, parsedEdges, metadata } = parseJSONtoReactFlowData(JSON.stringify(initialData), onNodeLabelChange);
    const layoutedNodes = applyLayout(parsedNodes, parsedEdges);
    setNodes(layoutedNodes);
    setEdges(parsedEdges);
    setMetadata(metadata); // metadata 상태 업데이트
    setJsonViewData(prev => ({
      ...prev,
      parsed: { 
        metadata,
        nodes: layoutedNodes, 
        edges: parsedEdges 
      }
    }));
  }, [onNodeLabelChange]);  // 상단에 상태 추가
  const [showHelp, setShowHelp] = useState(false);

  // App.jsx에 추가할 부분
  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    jsons: []
  });

  // 상단에 instance 선언 추가 (useCallback 의존성 문제 해결)
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      try {
        const type = event.dataTransfer.getData('application/reactflow');

        // 배경색 선택
        //const backgroundColors = Object.values(FLOW_CONSTANTS.NODE.STYLE.BACKGROUND_COLORS);
        //const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
        const staticColor = FLOW_CONSTANTS.NODE.STYLE.BACKGROUND_COLORS.LAYER1;

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - FLOW_CONSTANTS.NODE.SIZE.MIN_WIDTH / 2,
          y: event.clientY - FLOW_CONSTANTS.NODE.SIZE.MIN_HEIGHT / 2
        });

        const newNode = {
          id: generateUniqueNodeId(nodes),
          type: 'custom',
          position,
          className: 'custom-node',
          style: {
            //backgroundColor: randomColor,
            //backgroundColor: staticColor,
            width: FLOW_CONSTANTS.NODE.SIZE.MIN_WIDTH,
            height: FLOW_CONSTANTS.NODE.SIZE.MIN_HEIGHT
          },
          data: {
            label: '새 노드',
            onNodeLabelChange
          }
        };

        setNodes((nds) => nds.concat(newNode));
        console.log('노드 생성 완료:', newNode);
      } catch (error) {
        console.error('노드 생성 중 오류 발생:', error);
      }
    },
    [reactFlowInstance, setNodes, nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ref 추가
  const reactFlowWrapper = useRef(null);


  // 노드 ID 생성 함수
  const generateUniqueNodeId = (nodes) => {
    const existingIds = nodes.map(node => parseInt(node.id));
    const maxId = Math.max(...existingIds, 0);
    return String(maxId + 1);
  };

  // onInit 콜백 수정
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onKeyDown={onKeyDown}
            deleteKeyCode="Delete"
            fitView
            edgeTypes={edgeTypes}
            selectNodesOnDrag={false}
            elementsSelectable={true}
            edgesFocusable={true} // 엣지 선택 가능 
            edgesUpdatable={true} // 엣지 업데이트 가능
            nodesDraggable={true} // 노드 드래그 가능
            nodesConnectable={true} // 노드 연결 가
            snapToGrid={true} // 그리드 맞
            snapGrid={[15, 15]} // 그리드 크기
            connectionMode={ConnectionMode.Loose}
            elevateEdgesOnSelect={true}
            selectionOnDrag={true}
            selectionMode="partial"
            multiSelectionKeyCode="Shift"
            panOnDrag={[1, 2]}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            nodeTypes={nodeTypes}
            onInit={onInit}
            defaultEdgeOptions={{
              type: 'floating',
              animated: false
            }}
          >
            <Background variant="dots" gap={12} size={1} />
            <HelpViewer showHelp={showHelp} setShowHelp={setShowHelp} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </ReactFlowProvider>

      {/* 저장 버튼 */}
      <div style={{ flex: 1 }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          gap: '10px'  // 버튼 사이 간격
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
              resize: 'both', // 크기 조절 가능도록 설정
              pointerEvents: 'auto',
              minWidth: `${window.innerWidth * 0.25}px`, // 최소 너비를 화면 너비의 25%로 설정
              maxWidth: `${window.innerWidth * 0.95}px`, // 최대 너비를 화면 너비의 75%로 설정
              minHeight: `${window.innerHeight * 0.25}px`, // 최소 높이를 화면 높이의 25%로 설정
              maxHeight: `${window.innerHeight * 0.95}px`, // 최대 높이를 화면 높이의 75%로 설정
            }}
            onScroll={handleImageViewerScroll}
          >
            <img
              src={currentImage.path}
              alt={currentImage.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
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
              {currentImage.name}
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
                bottom: '5px', // top에서 bottom으로 변경
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
      <FolderViewer
        onImageSelect={(file) => {
          setCurrentImage({
            path: file.path,
            name: file.name
          });
        }}
        onFilesSelected={handleFilesSelected}
        fitView={() => reactFlowInstance?.fitView()}
      />
      <ToolboxViewer
        onLayoutDirectionChange={(direction) => {
          const layoutedNodes = applyLayout(nodes, edges, direction);
          setNodes(layoutedNodes);
        }}
        fitView={() => reactFlowInstance?.fitView()}
      />
    </div>
  );
}

export default App;

