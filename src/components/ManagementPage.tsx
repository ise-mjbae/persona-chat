import React from 'react';

const ManagementPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>학습관리</h1>
        <p>학습 시나리오를 생성하고 관리하세요</p>
        <button className="btn-primary">+ 학습 추가</button>
      </div>
      <div className="page-content">
        <div className="management-list">
          <div className="empty-state">
            <h3>아직 생성된 학습이 없습니다</h3>
            <p>새로운 학습을 추가해보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;