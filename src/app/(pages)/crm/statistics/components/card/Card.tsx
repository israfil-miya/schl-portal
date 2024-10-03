import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick: () => void;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, onClick, icon }) => {
  return (
    <div
      className="flex-1 cursor-pointer p-4 bg-opacity-25 bg-gray-50 border shadow-md flex flex-col items-start"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{icon}</div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default Card;
