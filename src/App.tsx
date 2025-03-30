import React from "react";
import './App.css';
import Header from "./components/header";
import Card from "./components/card";
import { mockData } from "./data/mockData";
const App: React.FC = () => {
  return (
    <div className="w-full">

      <div className="bg-[#F7F7F7] h-[100px] w-full fixed top-0 left-0 z-50">
        <div className="flex justify-between items-center h-full px-[20px]">
          <div className="text-[24px] font-bold">My App</div>
          <div className="flex space-x-[20px]">
            <a href="#" className="text-[#333] hover:text-[#007bff]">Home</a>
            <a href="#" className="text-[#333] hover:text-[#007bff]">About</a>
            <a href="#" className="text-[#333] hover:text-[#007bff]">Contact</a>
          </div>
        </div>

        <Header />
        <div className="mt-[100px] ml-[210px] max-w-[50%] font-main">
          {mockData.map((data, index) => (
            <Card key={index} title={data.title} url={data.url} text={data.text} />
          ))}
        </div>
      </div>

      );
}

      export default App;