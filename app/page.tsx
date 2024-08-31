"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Map from "./components/map";
import data from "../public/data.json";

export default function Home() {
  const [mapData, setMapData] = useState<typeof data.geomarks | null>(null);
  const [geomarkNames, setGeomarkNames] = useState<string[]>([]);

  useEffect(() => {
    // 页面加载时直接加载数据
    setMapData(data.geomarks);
    const names = data.geomarks.map((geomark) => Object.keys(geomark)[0]);
    setGeomarkNames(names);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: "url(/background.jpg)",
            backgroundSize: "120%",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
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

      {/* 左侧数据列表 */}
      <div className="absolute top-[12vh] left-4 w-[200px] bg-black bg-opacity-50 p-4 rounded">
        <h2 className="text-xl font-bold mb-4">地标列表</h2>
        <ul>
          {geomarkNames.map((name, index) => (
            <li key={index} className="flex items-center mb-2">
              <Image
                src={`/markers/${name}.png`}
                alt={name}
                width={24}
                height={24}
                className="mr-2"
              />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
