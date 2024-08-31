"use client"
import { useState } from "react";
import Image from "next/image";
import Map from "./components/map";
import data from "../public/data.json";

export default function Home() {
  const [mapData, setMapData] = useState<typeof data.geomarks | null>(null);

  const handleLoadData = () => {
    setMapData(data.geomarks);
  };

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="w-full h-full" style={{
          background: "url(/background.jpg)",
          backgroundSize: "120%",
          backgroundPosition: "10% 10%",
          backgroundRepeat: "no-repeat"
        }}>
          <div className="bg-gradient-to-t from-black to-transparent h-[300px] xl:h-[200px] absolute bottom-0 left-0 right-0"></div>
          <div className="bg-gradient-to-r from-black to-transparent w-[15%] absolute bottom-0 left-0 top-0"></div>
          <div className="bg-gradient-to-l from-black to-transparent w-[15%] absolute bottom-0 top-0 right-0"></div>
        </div>
      </div>
      <div className="absolute top-[12vh] left-[40vw] transform -translate-x-1/2 w-[45vw] max-w-[1000px]">
        <div className="relative w-full pb-[90%]">
          <div className="absolute inset-0 bg-[#82735B] shadow-[inset_0_0_10px_rgba(0,0,0,0.5),0_0_10px_rgba(0,0,0,0.5)]">
            <Map data={mapData} />
          </div>
        </div>
      </div>
      <button
        className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLoadData}
      >
        加载数据
      </button>
    </div>
  );
}
