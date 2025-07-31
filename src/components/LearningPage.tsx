import React from 'react';

const LearningPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>학습하기</h1>
        <p>생성된 학습 시나리오를 선택하고 페르소나와 대화를 연습해보세요</p>
      </div>
      <div className="page-content">
        <div className="learning-list">
          <div className="empty-state">
            <h3>아직 생성된 학습이 없습니다</h3>
            <p>학습관리에서 새로운 학습을 만들어보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;